import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FinancialSummary, Transaction } from '../../services/financialApi';
import { fetchFinancialSummary, fetchTransactions, createTransaction } from './financialThunks';

interface FinancialState {
  summary: FinancialSummary | null;
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
}

const initialState: FinancialState = {
  summary: null,
  transactions: [],
  loading: false,
  error: null,
};

const financialSlice = createSlice({
  name: 'financial',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFinancialSummary.pending, (state) => { state.loading = true; })
      .addCase(fetchFinancialSummary.fulfilled, (state, action: PayloadAction<FinancialSummary>) => {
        state.loading = false;
        state.summary = action.payload;
      })
      .addCase(fetchFinancialSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchTransactions.pending, (state) => { state.loading = true; })
      .addCase(fetchTransactions.fulfilled, (state, action: PayloadAction<Transaction[]>) => {
        state.loading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(createTransaction.fulfilled, (state, action: PayloadAction<Transaction>) => {
        state.transactions.unshift(action.payload);
      });
  },
});

export default financialSlice.reducer;
