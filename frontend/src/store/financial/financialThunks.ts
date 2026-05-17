import { createAsyncThunk } from '@reduxjs/toolkit';
import { financialApi, Transaction } from '../../services/financialApi';

export const fetchFinancialSummary = createAsyncThunk(
  'financial/fetchSummary',
  async ({ startDate, endDate }: { startDate: string; endDate: string }, { rejectWithValue }) => {
    try {
      return await financialApi.getSummary(startDate, endDate);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch summary');
    }
  }
);

export const fetchTransactions = createAsyncThunk(
  'financial/fetchTransactions',
  async (params: { startDate: string; endDate: string; type?: string; barberId?: string }, { rejectWithValue }) => {
    try {
      return await financialApi.getTransactions(params);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch transactions');
    }
  }
);

export const createTransaction = createAsyncThunk(
  'financial/createTransaction',
  async (data: Omit<Transaction, 'transactionId' | 'createdAt'>, { rejectWithValue }) => {
    try {
      return await financialApi.createTransaction(data);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to create transaction');
    }
  }
);
