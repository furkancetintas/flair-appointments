import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Barber {
  id: string;
  shop_name: string;
  address: string | null;
  description: string | null;
  services: string[];
  working_hours: any;
  price_range: string | null;
  shop_status: string;
  profile_id: string;
  appointment_duration?: number;
  profile: {
    full_name: string;
    email: string;
    phone: string | null;
  };
}

export interface BarberProfile {
  id?: string;
  shop_name: string;
  address: string;
  description: string;
  services: string[];
  working_hours: any;
  price_range: string;
  shop_status: 'open' | 'closed';
  appointment_duration?: number;
}

interface BarbersState {
  barbers: Barber[];
  currentBarber: Barber | null;
  filteredBarbers: Barber[];
  searchTerm: string;
  loading: boolean;
  error: string | null;
  updateLoading: boolean;
}

const initialState: BarbersState = {
  barbers: [],
  currentBarber: null,
  filteredBarbers: [],
  searchTerm: '',
  loading: false,
  error: null,
  updateLoading: false,
};

// Async thunks
export const fetchBarberById = createAsyncThunk(
  'barbers/fetchBarberById',
  async (barberId: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('barbers')
        .select(`
          *,
          profile:profiles!profile_id(full_name, email, phone)
        `)
        .eq('id', barberId)
        .single();

      if (error) throw error;

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchBarberBySlug = createAsyncThunk(
  'barbers/fetchBarberBySlug',
  async (slug: string, { rejectWithValue }) => {
    try {
      // Fetch all barbers
      const { data, error } = await supabase
        .from('barbers')
        .select(`
          *,
          profile:profiles!profile_id(full_name, email, phone)
        `);

      if (error) throw error;
      
      // Turkish character mapping
      const turkishMap: { [key: string]: string } = {
        'ç': 'c', 'Ç': 'c',
        'ğ': 'g', 'Ğ': 'g',
        'ı': 'i', 'İ': 'i',
        'ö': 'o', 'Ö': 'o',
        'ş': 's', 'Ş': 's',
        'ü': 'u', 'Ü': 'u',
      };
      
      const slugify = (text: string): string => {
        return text
          .split('')
          .map(char => turkishMap[char] || char)
          .join('')
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_]+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, '');
      };

      // Find barber with matching slug
      const barber = data?.find(b => slugify(b.shop_name) === slug);
      
      if (!barber) {
        throw new Error('Berber bulunamadı');
      }

      return barber;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchBarberByProfileId = createAsyncThunk(
  'barbers/fetchBarberByProfileId',
  async (profileId: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('barbers')
        .select(`
          *,
          profile:profiles!profile_id(full_name, email, phone)
        `)
        .eq('profile_id', profileId)
        .maybeSingle();

      if (error) throw error;

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchBarbers = createAsyncThunk(
  'barbers/fetchBarbers',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('barbers')
        .select(`
          *,
          profile:profiles!profile_id(full_name, email, phone)
        `)
        .order('shop_name');

      if (error) throw error;

      return data || [];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createOrUpdateBarberProfile = createAsyncThunk(
  'barbers/createOrUpdateBarberProfile',
  async ({ profileId, barberData }: { profileId: string; barberData: BarberProfile }, { rejectWithValue }) => {
    try {
      // Check if barber profile already exists
      const { data: existingBarber } = await supabase
        .from('barbers')
        .select('id')
        .eq('profile_id', profileId)
        .maybeSingle();

      let data;
      let error;

      if (existingBarber) {
        // Update existing profile
        const updateResult = await supabase
          .from('barbers')
          .update(barberData)
          .eq('profile_id', profileId)
          .select(`
            *,
            profile:profiles!profile_id(full_name, email, phone)
          `)
          .single();
        
        data = updateResult.data;
        error = updateResult.error;
      } else {
        // Create new profile
        const insertResult = await supabase
          .from('barbers')
          .insert({ ...barberData, profile_id: profileId })
          .select(`
            *,
            profile:profiles!profile_id(full_name, email, phone)
          `)
          .single();
        
        data = insertResult.data;
        error = insertResult.error;
      }

      if (error) throw error;

      toast.success('Berber profili başarıyla kaydedildi!');
      return data;
    } catch (error: any) {
      toast.error('Profil kaydedilirken bir hata oluştu');
      return rejectWithValue(error.message);
    }
  }
);

const barbersSlice = createSlice({
  name: 'barbers',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
      
      // Filter barbers based on search term
      if (action.payload.trim() === '') {
        state.filteredBarbers = state.barbers;
      } else {
        state.filteredBarbers = state.barbers.filter(barber => 
          barber.shop_name.toLowerCase().includes(action.payload.toLowerCase()) ||
          barber.address?.toLowerCase().includes(action.payload.toLowerCase()) ||
          barber.profile.full_name.toLowerCase().includes(action.payload.toLowerCase()) ||
          barber.services.some(service => 
            service.toLowerCase().includes(action.payload.toLowerCase())
          )
        );
      }
    },
    clearCurrentBarber: (state) => {
      state.currentBarber = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch barbers
      .addCase(fetchBarbers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBarbers.fulfilled, (state, action) => {
        state.loading = false;
        state.barbers = action.payload;
        state.filteredBarbers = action.payload;
      })
      .addCase(fetchBarbers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch barber by ID
      .addCase(fetchBarberById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBarberById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBarber = action.payload;
      })
      .addCase(fetchBarberById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch barber by slug
      .addCase(fetchBarberBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBarberBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBarber = action.payload;
      })
      .addCase(fetchBarberBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch barber by profile ID
      .addCase(fetchBarberByProfileId.fulfilled, (state, action) => {
        state.currentBarber = action.payload;
      })
      
      // Create or update barber profile
      .addCase(createOrUpdateBarberProfile.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(createOrUpdateBarberProfile.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.currentBarber = action.payload;
        
        // Update the barber in the list
        const index = state.barbers.findIndex(b => b.id === action.payload.id);
        if (index >= 0) {
          state.barbers[index] = action.payload;
        } else {
          state.barbers.push(action.payload);
        }
        
        // Update filtered barbers
        const filteredIndex = state.filteredBarbers.findIndex(b => b.id === action.payload.id);
        if (filteredIndex >= 0) {
          state.filteredBarbers[filteredIndex] = action.payload;
        } else if (state.searchTerm === '' || 
          action.payload.shop_name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
          action.payload.address?.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
          action.payload.profile.full_name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
          action.payload.services.some(service => 
            service.toLowerCase().includes(state.searchTerm.toLowerCase())
          )) {
          state.filteredBarbers.push(action.payload);
        }
      })
      .addCase(createOrUpdateBarberProfile.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSearchTerm, clearCurrentBarber, clearError } = barbersSlice.actions;
export default barbersSlice.reducer;