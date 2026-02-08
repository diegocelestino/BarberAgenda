import { createAsyncThunk } from '@reduxjs/toolkit';
import { barberApi, CreateBarberData, UpdateBarberData } from '../../services/api';

// Fetch all barbers
export const fetchBarbers = createAsyncThunk(
  'barbers/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await barberApi.getAll();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch barbers');
    }
  }
);

// Fetch barber by ID
export const fetchBarberById = createAsyncThunk(
  'barbers/fetchById',
  async (barberId: string, { rejectWithValue }) => {
    try {
      return await barberApi.getById(barberId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch barber');
    }
  }
);

// Create barber
export const createBarber = createAsyncThunk(
  'barbers/create',
  async (data: CreateBarberData, { rejectWithValue }) => {
    try {
      return await barberApi.create(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create barber');
    }
  }
);

// Update barber
export const updateBarber = createAsyncThunk(
  'barbers/update',
  async ({ barberId, data }: { barberId: string; data: UpdateBarberData }, { rejectWithValue }) => {
    try {
      return await barberApi.update(barberId, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update barber');
    }
  }
);

// Delete barber
export const deleteBarber = createAsyncThunk(
  'barbers/delete',
  async (barberId: string, { rejectWithValue }) => {
    try {
      await barberApi.delete(barberId);
      return barberId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete barber');
    }
  }
);
