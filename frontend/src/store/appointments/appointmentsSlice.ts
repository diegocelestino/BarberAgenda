import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Appointment } from '../../services/appointmentsApi';
import {
  fetchAppointmentsByBarber,
  fetchAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from './appointmentsThunks';

interface AppointmentsState {
  appointments: Appointment[];
  selectedAppointment: Appointment | null;
  loading: boolean;
  error: string | null;
}

const initialState: AppointmentsState = {
  appointments: [],
  selectedAppointment: null,
  loading: false,
  error: null,
};

const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedAppointment: (state) => {
      state.selectedAppointment = null;
    },
    clearAppointments: (state) => {
      state.appointments = [];
    },
  },
  extraReducers: (builder) => {
    // Fetch appointments by barber
    builder
      .addCase(fetchAppointmentsByBarber.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointmentsByBarber.fulfilled, (state, action: PayloadAction<Appointment[]>) => {
        state.loading = false;
        state.appointments = action.payload;
      })
      .addCase(fetchAppointmentsByBarber.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch appointment by ID
    builder
      .addCase(fetchAppointmentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointmentById.fulfilled, (state, action: PayloadAction<Appointment>) => {
        state.loading = false;
        state.selectedAppointment = action.payload;
      })
      .addCase(fetchAppointmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create appointment
    builder
      .addCase(createAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAppointment.fulfilled, (state, action: PayloadAction<Appointment>) => {
        state.loading = false;
        state.appointments.push(action.payload);
        // Sort by start time
        state.appointments.sort((a, b) => a.startTime - b.startTime);
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update appointment
    builder
      .addCase(updateAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAppointment.fulfilled, (state, action: PayloadAction<Appointment>) => {
        state.loading = false;
        const index = state.appointments.findIndex((a) => a.appointmentId === action.payload.appointmentId);
        if (index !== -1) {
          state.appointments[index] = action.payload;
          state.appointments.sort((a, b) => a.startTime - b.startTime);
        }
        if (state.selectedAppointment?.appointmentId === action.payload.appointmentId) {
          state.selectedAppointment = action.payload;
        }
      })
      .addCase(updateAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete appointment
    builder
      .addCase(deleteAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAppointment.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.appointments = state.appointments.filter((a) => a.appointmentId !== action.payload);
        if (state.selectedAppointment?.appointmentId === action.payload) {
          state.selectedAppointment = null;
        }
      })
      .addCase(deleteAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearSelectedAppointment, clearAppointments } = appointmentsSlice.actions;
export default appointmentsSlice.reducer;
