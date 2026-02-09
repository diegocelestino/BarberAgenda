import { configureStore } from '@reduxjs/toolkit';
import barbersReducer from './barbers/barbersSlice';
import appointmentsReducer from './appointments/appointmentsSlice';
import servicesReducer from './services/servicesSlice';

export const store = configureStore({
  reducer: {
    barbers: barbersReducer,
    appointments: appointmentsReducer,
    services: servicesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
