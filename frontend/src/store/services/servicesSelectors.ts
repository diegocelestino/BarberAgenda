import { RootState } from '../store';

export const selectAllServices = (state: RootState) => state.services.services;
export const selectServicesLoading = (state: RootState) => state.services.loading;
export const selectServicesError = (state: RootState) => state.services.error;
export const selectServiceById = (serviceId: string) => (state: RootState) =>
  state.services.services.find(s => s.serviceId === serviceId);
