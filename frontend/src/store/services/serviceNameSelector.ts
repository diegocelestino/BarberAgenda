import { createSelector } from '@reduxjs/toolkit';
import { selectAllServices } from './servicesSelectors';

export const selectServiceName = createSelector(
  [selectAllServices, (_state: any, serviceId: string) => serviceId],
  (services, serviceId) => services.find(s => s.serviceId === serviceId)?.title || serviceId
);
