import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Appointment {
  id: string;
  customer_id: string;
  barber_id: string;
  appointment_date: string;
  appointment_time: string;
  service: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes: string | null;
  created_at: string;
  updated_at: string;
  customer?: {
    full_name: string;
    email: string;
    phone: string | null;
  };
  barber?: {
    shop_name: string;
    address: string | null;
    profile: {
      full_name: string;
      email: string;
      phone: string | null;
    };
  };
}

interface AppointmentsState {
  appointments: Appointment[];
  barberAppointments: Appointment[];
  loading: boolean;
  error: string | null;
  bookingLoading: boolean;
}

const initialState: AppointmentsState = {
  appointments: [],
  barberAppointments: [],
  loading: false,
  error: null,
  bookingLoading: false,
};

// Async thunks
export const fetchCustomerAppointments = createAsyncThunk(
  'appointments/fetchCustomerAppointments',
  async (customerId: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          barber:barbers!barber_id(
            shop_name,
            address,
            profile:profiles!profile_id(full_name, email, phone)
          )
        `)
        .eq('customer_id', customerId)
        .order('appointment_date', { ascending: false })
        .order('appointment_time', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error: any) {
      console.error('Error fetching customer appointments:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchBarberAppointments = createAsyncThunk(
  'appointments/fetchBarberAppointments',
  async (barberId: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          customer:profiles!customer_id(full_name, email, phone)
        `)
        .eq('barber_id', barberId)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error: any) {
      console.error('Error fetching barber appointments:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAppointmentsForDate = createAsyncThunk(
  'appointments/fetchAppointmentsForDate',
  async ({ barberId, date }: { barberId: string; date: string }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('appointment_time')
        .eq('barber_id', barberId)
        .eq('appointment_date', date);

      if (error) throw error;

      return data || [];
    } catch (error: any) {
      console.error('Error fetching appointments for date:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const createAppointment = createAsyncThunk(
  'appointments/createAppointment',
  async (appointmentData: {
    customer_id: string;
    barber_id: string;
    appointment_date: string;
    appointment_time: string;
    service: string;
    price: number;
    notes?: string;
  }, { rejectWithValue }) => {
    try {
      // First check if the time slot is available using our database function
      const { data: isAvailable } = await supabase.rpc('check_appointment_availability', {
        barber_id_param: appointmentData.barber_id,
        appointment_date_param: appointmentData.appointment_date,
        appointment_time_param: appointmentData.appointment_time
      });

      if (!isAvailable) {
        toast.error('Bu saat dolu! Lütfen başka bir saat seçin.');
        return rejectWithValue('Time slot not available');
      }

      const { data, error } = await supabase
        .from('appointments')
        .insert({
          ...appointmentData,
          status: 'pending'
        })
        .select(`
          *,
          barber:barbers!barber_id(
            shop_name,
            address,
            profile:profiles!profile_id(full_name, email, phone)
          )
        `)
        .single();

      if (error) {
        // Handle unique constraint violation
        if (error.code === '23505') {
          toast.error('Bu saat dolu! Lütfen başka bir saat seçin.');
          return rejectWithValue('Time slot already booked');
        }
        throw error;
      }

      toast.success('Randevunuz başarıyla alındı!');
      return data;
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      toast.error('Randevu alınırken bir hata oluştu');
      return rejectWithValue(error.message);
    }
  }
);

export const updateAppointmentStatus = createAsyncThunk(
  'appointments/updateAppointmentStatus',
  async ({ appointmentId, status }: { appointmentId: string; status: string }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId)
        .select(`
          *,
          customer:profiles!customer_id(full_name, email, phone)
        `)
        .single();

      if (error) throw error;

      const statusText = status === 'confirmed' ? 'onaylandı' : 
                        status === 'cancelled' ? 'iptal edildi' : 
                        status === 'completed' ? 'tamamlandı' : status;
      
      toast.success(`Randevu ${statusText}!`);
      return data;
    } catch (error: any) {
      console.error('Error updating appointment status:', error);
      toast.error('Randevu güncellenirken bir hata oluştu');
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAppointmentById = createAsyncThunk(
  'appointments/fetchAppointmentById',
  async (appointmentId: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          customer:profiles!customer_id(full_name, email, phone),
          barber:barbers!barber_id(
            shop_name,
            address,
            profile:profiles!profile_id(full_name, phone)
          )
        `)
        .eq('id', appointmentId)
        .single();

      if (error) throw error;

      return data;
    } catch (error: any) {
      console.error('Error fetching appointment:', error);
      return rejectWithValue(error.message);
    }
  }
);

const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetAppointments: (state) => {
      state.appointments = [];
      state.barberAppointments = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch customer appointments
      .addCase(fetchCustomerAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload as Appointment[];
      })
      .addCase(fetchCustomerAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch barber appointments
      .addCase(fetchBarberAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBarberAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.barberAppointments = action.payload as Appointment[];
      })
      .addCase(fetchBarberAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create appointment
      .addCase(createAppointment.pending, (state) => {
        state.bookingLoading = true;
        state.error = null;
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.bookingLoading = false;
        state.appointments.unshift(action.payload as Appointment);
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.bookingLoading = false;
        state.error = action.payload as string;
      })
      
      // Update appointment status
      .addCase(updateAppointmentStatus.fulfilled, (state, action) => {
        const updatedAppointment = action.payload as Appointment;
        
        // Update in barber appointments
        const barberIndex = state.barberAppointments.findIndex(apt => apt.id === updatedAppointment.id);
        if (barberIndex >= 0) {
          state.barberAppointments[barberIndex] = updatedAppointment;
        }
        
        // Update in customer appointments
        const customerIndex = state.appointments.findIndex(apt => apt.id === updatedAppointment.id);
        if (customerIndex >= 0) {
          state.appointments[customerIndex] = updatedAppointment;
        }
      });
  },
});

export const { clearError, resetAppointments } = appointmentsSlice.actions;
export default appointmentsSlice.reducer;