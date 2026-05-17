import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Customer } from '../../services/customersApi';
import { fetchCustomers, fetchCustomerById, createCustomer, updateCustomer, deleteCustomer } from './customersThunks';

interface CustomersState {
  customers: Customer[];
  selectedCustomer: Customer | null;
  loading: boolean;
  error: string | null;
}

const initialState: CustomersState = {
  customers: [],
  selectedCustomer: null,
  loading: false,
  error: null,
};

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    clearSelectedCustomer: (state) => { state.selectedCustomer = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => { state.loading = true; })
      .addCase(fetchCustomers.fulfilled, (state, action: PayloadAction<Customer[]>) => {
        state.loading = false;
        state.customers = action.payload;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchCustomerById.fulfilled, (state, action: PayloadAction<Customer>) => {
        state.selectedCustomer = action.payload;
      });

    builder
      .addCase(createCustomer.fulfilled, (state, action: PayloadAction<Customer>) => {
        state.customers.push(action.payload);
      });

    builder
      .addCase(updateCustomer.fulfilled, (state, action: PayloadAction<Customer>) => {
        const idx = state.customers.findIndex((c) => c.customerId === action.payload.customerId);
        if (idx !== -1) state.customers[idx] = action.payload;
        if (state.selectedCustomer?.customerId === action.payload.customerId) {
          state.selectedCustomer = action.payload;
        }
      });

    builder
      .addCase(deleteCustomer.fulfilled, (state, action: PayloadAction<string>) => {
        state.customers = state.customers.filter((c) => c.customerId !== action.payload);
      });
  },
});

export const { clearSelectedCustomer } = customersSlice.actions;
export default customersSlice.reducer;
