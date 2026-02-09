import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  appointmentsApi,
  CreateAppointmentData,
  UpdateAppointmentData,
  GetAppointmentsParams,
} from '../../services/appointmentsApi';

// Fetch appointments by barber
export const fetchAppointmentsByBarber = createAsyncThunk(
  'appointments/fetchByBarber',
  async ({ barberId, params }: { barberId: string; params?: GetAppointmentsParams }, { rejectWithValue }) => {
    try {
      return await appointmentsApi.getByBarber(barberId, params);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch appointments');
    }
  }
);

// Fetch appointment by ID
export const fetchAppointmentById = createAsyncThunk(
  'appointments/fetchById',
  async ({ barberId, appointmentId }: { barberId: string; appointmentId: string }, { rejectWithValue }) => {
    try {
      return await appointmentsApi.getById(barberId, appointmentId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch appointment');
    }
  }
);

// Create appointment
export const createAppointment = createAsyncThunk(
  'appointments/create',
  async ({ barberId, data }: { barberId: string; data: CreateAppointmentData }, { rejectWithValue }) => {
    try {
      return await appointmentsApi.create(barberId, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create appointment');
    }
  }
);

// Update appointment
export const updateAppointment = createAsyncThunk(
  'appointments/update',
  async (
    { barberId, appointmentId, data }: { barberId: string; appointmentId: string; data: UpdateAppointmentData },
    { rejectWithValue }
  ) => {
    try {
      return await appointmentsApi.update(barberId, appointmentId, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update appointment');
    }
  }
);

// Delete appointment
export const deleteAppointment = createAsyncThunk(
  'appointments/delete',
  async ({ barberId, appointmentId }: { barberId: string; appointmentId: string }, { rejectWithValue }) => {
    try {
      await appointmentsApi.delete(barberId, appointmentId);
      return appointmentId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete appointment');
    }
  }
);
