import { configureStore } from '@reduxjs/toolkit';
import barbersReducer from './barbers/barbersSlice';
import appointmentsReducer from './appointments/appointmentsSlice';
import servicesReducer from './services/servicesSlice';
import customersReducer from './customers/customersSlice';
import financialReducer from './financial/financialSlice';
import configReducer from './config/configSlice';

export const store = configureStore({
  reducer: {
    barbers: barbersReducer,
    appointments: appointmentsReducer,
    services: servicesReducer,
    customers: customersReducer,
    financial: financialReducer,
    config: configReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
