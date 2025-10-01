import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Public barber data (without sensitive info)
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
  barber_full_name: string;
  role: string;
}

// Authenticated barber data (with full profile for own data)
export interface BarberWithProfile extends Omit<Barber, 'barber_full_name' | 'role'> {
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
  currentBarber: BarberWithProfile | null;
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
      // Use the public view that excludes sensitive data
      const { data, error } = await supabase
        .from('barbers_public')
        .select('*')
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
        
        // Convert BarberWithProfile to Barber for the public list
        const publicBarber: Barber = {
          id: action.payload.id,
          shop_name: action.payload.shop_name,
          address: action.payload.address,
          description: action.payload.description,
          services: action.payload.services,
          working_hours: action.payload.working_hours,
          price_range: action.payload.price_range,
          shop_status: action.payload.shop_status,
          profile_id: action.payload.profile_id,
          appointment_duration: action.payload.appointment_duration,
          barber_full_name: action.payload.profile.full_name,
          role: 'barber'
        };
        
        // Update the barber in the list
        const index = state.barbers.findIndex(b => b.id === action.payload.id);
        if (index >= 0) {
          state.barbers[index] = publicBarber;
        } else {
          state.barbers.push(publicBarber);
        }
        
        // Update filtered barbers
        const filteredIndex = state.filteredBarbers.findIndex(b => b.id === action.payload.id);
        if (filteredIndex >= 0) {
          state.filteredBarbers[filteredIndex] = publicBarber;
        } else if (state.searchTerm === '' || 
          action.payload.shop_name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
          action.payload.address?.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
          action.payload.services.some(service => 
            service.toLowerCase().includes(state.searchTerm.toLowerCase())
          )) {
          state.filteredBarbers.push(publicBarber);
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