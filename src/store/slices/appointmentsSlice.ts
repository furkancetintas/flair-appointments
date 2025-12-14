import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Appointment {
  id: string;
  customer_id: string;
  appointment_date: string;
  appointment_time: string;
  service: string;
  price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes: string | null;
  created_at: string;
  updated_at: string;
  customer?: {
    full_name: string;
    email: string;
    phone: string | null;
  };
}

interface AppointmentsState {
  appointments: Appointment[];
  adminAppointments: Appointment[];
  loading: boolean;
  error: string | null;
  bookingLoading: boolean;
}

const initialState: AppointmentsState = {
  appointments: [],
  adminAppointments: [],
  loading: false,
  error: null,
  bookingLoading: false,
};

// Fetch customer appointments
export const fetchCustomerAppointments = createAsyncThunk(
  'appointments/fetchCustomerAppointments',
  async (customerId: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('customer_id', customerId)
        .order('appointment_date', { ascending: false })
        .order('appointment_time', { ascending: false });

      if (error) throw error;

      return (data || []) as Appointment[];
    } catch (error: any) {
      console.error('Error fetching customer appointments:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Fetch all appointments (admin)
export const fetchAdminAppointments = createAsyncThunk(
  'appointments/fetchAdminAppointments',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          customer:profiles!customer_id(full_name, email, phone)
        `)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

      if (error) throw error;

      return (data || []) as Appointment[];
    } catch (error: any) {
      console.error('Error fetching admin appointments:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Fetch appointments for a specific date
export const fetchAppointmentsForDate = createAsyncThunk(
  'appointments/fetchAppointmentsForDate',
  async (date: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('appointment_time')
        .eq('appointment_date', date)
        .neq('status', 'cancelled');

      if (error) throw error;

      return data || [];
    } catch (error: any) {
      console.error('Error fetching appointments for date:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Create appointment
export const createAppointment = createAsyncThunk(
  'appointments/createAppointment',
  async (appointmentData: {
    customer_id: string;
    appointment_date: string;
    appointment_time: string;
    service: string;
    price: number;
    notes?: string;
  }, { rejectWithValue }) => {
    try {
      // First check if the time slot is available
      const { data: isAvailable } = await (supabase as any).rpc('check_appointment_availability', {
        appointment_date_param: appointmentData.appointment_date,
        appointment_time_param: appointmentData.appointment_time
      });

      if (!isAvailable) {
        toast.error('Bu saat dolu! Lütfen başka bir saat seçin.');
        return rejectWithValue('Time slot not available');
      }

      const { data, error } = await (supabase as any)
        .from('appointments')
        .insert({
          ...appointmentData,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          toast.error('Bu saat dolu! Lütfen başka bir saat seçin.');
          return rejectWithValue('Time slot already booked');
        }
        throw error;
      }

      toast.success('Randevunuz başarıyla alındı!');
      return data as Appointment;
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      toast.error('Randevu alınırken bir hata oluştu');
      return rejectWithValue(error.message);
    }
  }
);

// Update appointment status
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
      return data as Appointment;
    } catch (error: any) {
      console.error('Error updating appointment status:', error);
      toast.error('Randevu güncellenirken bir hata oluştu');
      return rejectWithValue(error.message);
    }
  }
);

// Fetch appointment by ID
export const fetchAppointmentById = createAsyncThunk(
  'appointments/fetchAppointmentById',
  async (appointmentId: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          customer:profiles!customer_id(full_name, email, phone)
        `)
        .eq('id', appointmentId)
        .single();

      if (error) throw error;

      return data as Appointment;
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
      state.adminAppointments = [];
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
        state.appointments = action.payload;
      })
      .addCase(fetchCustomerAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch admin appointments
      .addCase(fetchAdminAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.adminAppointments = action.payload;
      })
      .addCase(fetchAdminAppointments.rejected, (state, action) => {
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
        if (action.payload) {
          state.appointments.unshift(action.payload);
        }
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.bookingLoading = false;
        state.error = action.payload as string;
      })
      
      // Update appointment status
      .addCase(updateAppointmentStatus.fulfilled, (state, action) => {
        const updatedAppointment = action.payload;
        
        // Update in admin appointments
        const adminIndex = state.adminAppointments.findIndex(apt => apt.id === updatedAppointment.id);
        if (adminIndex >= 0) {
          state.adminAppointments[adminIndex] = updatedAppointment;
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
