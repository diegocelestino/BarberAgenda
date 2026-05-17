import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

export interface AppConfig {
  shop: { name: string; address: string; phone: string; whatsapp: string };
  booking: { minAdvanceTimeMinutes: number; maxBookingDaysAhead: number; defaultSlotIntervalMinutes: number; allowSameDayBooking: boolean };
  defaultSchedule: { openTime: string; closeTime: string; lunchStart: string; lunchEnd: string; workDays: number[]; slotInterval: number };
  loyalty: { pointsPerReal: number; pointsForReward: number; rewardDescription: string };
  [key: string]: any;
}

export const fetchConfig = createAsyncThunk('config/fetch', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/config');
    return response.data as AppConfig;
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

export const updateConfig = createAsyncThunk('config/update', async (data: Partial<AppConfig>, { rejectWithValue }) => {
  try {
    const response = await api.put('/config', data);
    return response.data as AppConfig;
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

interface ConfigState {
  config: AppConfig | null;
  loading: boolean;
  error: string | null;
}

const initialState: ConfigState = { config: null, loading: false, error: null };

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchConfig.pending, (state) => { state.loading = true; })
      .addCase(fetchConfig.fulfilled, (state, action: PayloadAction<AppConfig>) => {
        state.loading = false;
        state.config = action.payload;
      })
      .addCase(fetchConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(updateConfig.fulfilled, (state, action: PayloadAction<AppConfig>) => {
        state.config = action.payload;
      });
  },
});

export default configSlice.reducer;
