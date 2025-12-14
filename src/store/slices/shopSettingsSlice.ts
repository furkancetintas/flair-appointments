import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ShopSettings {
  id: string;
  shop_name: string;
  address: string | null;
  description: string | null;
  services: string[];
  working_hours: any;
  price_range: string | null;
  shop_status: 'open' | 'closed';
  appointment_duration: number;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

interface ShopSettingsState {
  settings: ShopSettings | null;
  loading: boolean;
  updateLoading: boolean;
  error: string | null;
}

const initialState: ShopSettingsState = {
  settings: null,
  loading: false,
  updateLoading: false,
  error: null,
};

// Fetch shop settings
export const fetchShopSettings = createAsyncThunk(
  'shopSettings/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await (supabase as any)
        .from('shop_settings')
        .select('*')
        .single();

      if (error) throw error;

      return data as ShopSettings;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Update shop settings
export const updateShopSettings = createAsyncThunk(
  'shopSettings/update',
  async (settingsData: Partial<ShopSettings>, { rejectWithValue }) => {
    try {
      // Get existing settings ID first
      const { data: existing } = await (supabase as any)
        .from('shop_settings')
        .select('id')
        .single();

      if (!existing) {
        throw new Error('Shop settings not found');
      }

      const { data, error } = await (supabase as any)
        .from('shop_settings')
        .update(settingsData)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;

      toast.success('Ayarlar başarıyla güncellendi!');
      return data as ShopSettings;
    } catch (error: any) {
      toast.error('Ayarlar güncellenirken bir hata oluştu');
      return rejectWithValue(error.message);
    }
  }
);

const shopSettingsSlice = createSlice({
  name: 'shopSettings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch settings
      .addCase(fetchShopSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShopSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(fetchShopSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update settings
      .addCase(updateShopSettings.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateShopSettings.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.settings = action.payload;
      })
      .addCase(updateShopSettings.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = shopSettingsSlice.actions;
export default shopSettingsSlice.reducer;
