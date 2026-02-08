import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Barber } from '../../services/api';
import {
  fetchBarbers,
  fetchBarberById,
  createBarber,
  updateBarber,
  deleteBarber,
} from './barbersThunks';

interface BarbersState {
  barbers: Barber[];
  selectedBarber: Barber | null;
  loading: boolean;
  error: string | null;
}

const initialState: BarbersState = {
  barbers: [],
  selectedBarber: null,
  loading: false,
  error: null,
};

const barbersSlice = createSlice({
  name: 'barbers',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedBarber: (state) => {
      state.selectedBarber = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all barbers
    builder
      .addCase(fetchBarbers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBarbers.fulfilled, (state, action: PayloadAction<Barber[]>) => {
        state.loading = false;
        state.barbers = action.payload;
      })
      .addCase(fetchBarbers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch barber by ID
    builder
      .addCase(fetchBarberById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBarberById.fulfilled, (state, action: PayloadAction<Barber>) => {
        state.loading = false;
        state.selectedBarber = action.payload;
      })
      .addCase(fetchBarberById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create barber
    builder
      .addCase(createBarber.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBarber.fulfilled, (state, action: PayloadAction<Barber>) => {
        state.loading = false;
        state.barbers.push(action.payload);
      })
      .addCase(createBarber.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update barber
    builder
      .addCase(updateBarber.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBarber.fulfilled, (state, action: PayloadAction<Barber>) => {
        state.loading = false;
        const index = state.barbers.findIndex((b) => b.barberId === action.payload.barberId);
        if (index !== -1) {
          state.barbers[index] = action.payload;
        }
        if (state.selectedBarber?.barberId === action.payload.barberId) {
          state.selectedBarber = action.payload;
        }
      })
      .addCase(updateBarber.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete barber
    builder
      .addCase(deleteBarber.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBarber.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.barbers = state.barbers.filter((b) => b.barberId !== action.payload);
        if (state.selectedBarber?.barberId === action.payload) {
          state.selectedBarber = null;
        }
      })
      .addCase(deleteBarber.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearSelectedBarber } = barbersSlice.actions;
export default barbersSlice.reducer;
