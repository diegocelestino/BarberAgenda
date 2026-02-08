import { configureStore } from '@reduxjs/toolkit';
import barbersReducer from './barbers/barbersSlice';

export const store = configureStore({
  reducer: {
    barbers: barbersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
