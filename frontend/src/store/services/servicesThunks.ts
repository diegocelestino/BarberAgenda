import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  servicesApi,
  CreateServiceData,
  UpdateServiceData,
} from '../../services/servicesApi';

// Fetch all services
export const fetchServices = createAsyncThunk(
  'services/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await servicesApi.getAll();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch services');
    }
  }
);

// Fetch service by ID
export const fetchServiceById = createAsyncThunk(
  'services/fetchById',
  async (serviceId: string, { rejectWithValue }) => {
    try {
      return await servicesApi.getById(serviceId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch service');
    }
  }
);

// Create service
export const createService = createAsyncThunk(
  'services/create',
  async (data: CreateServiceData, { rejectWithValue }) => {
    try {
      return await servicesApi.create(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create service');
    }
  }
);

// Update service
export const updateService = createAsyncThunk(
  'services/update',
  async (
    { serviceId, data }: { serviceId: string; data: UpdateServiceData },
    { rejectWithValue }
  ) => {
    try {
      return await servicesApi.update(serviceId, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update service');
    }
  }
);

// Delete service
export const deleteService = createAsyncThunk(
  'services/delete',
  async (serviceId: string, { rejectWithValue }) => {
    try {
      await servicesApi.delete(serviceId);
      return serviceId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete service');
    }
  }
);
