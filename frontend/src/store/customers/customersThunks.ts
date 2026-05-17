import { createAsyncThunk } from '@reduxjs/toolkit';
import { customersApi, Customer } from '../../services/customersApi';

export const fetchCustomers = createAsyncThunk(
  'customers/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await customersApi.getAll();
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch customers');
    }
  }
);

export const fetchCustomerById = createAsyncThunk(
  'customers/fetchById',
  async (customerId: string, { rejectWithValue }) => {
    try {
      return await customersApi.getById(customerId);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch customer');
    }
  }
);

export const createCustomer = createAsyncThunk(
  'customers/create',
  async (data: { name: string; phone: string; email?: string; notes?: string }, { rejectWithValue }) => {
    try {
      return await customersApi.create(data);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to create customer');
    }
  }
);

export const updateCustomer = createAsyncThunk(
  'customers/update',
  async ({ customerId, data }: { customerId: string; data: Partial<Customer> }, { rejectWithValue }) => {
    try {
      return await customersApi.update(customerId, data);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to update customer');
    }
  }
);

export const deleteCustomer = createAsyncThunk(
  'customers/delete',
  async (customerId: string, { rejectWithValue }) => {
    try {
      await customersApi.delete(customerId);
      return customerId;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to delete customer');
    }
  }
);
