import { RootState } from '../store';

export const selectAllAppointments = (state: RootState) => state.appointments.appointments;
export const selectSelectedAppointment = (state: RootState) => state.appointments.selectedAppointment;
export const selectAppointmentsLoading = (state: RootState) => state.appointments.loading;
export const selectAppointmentsError = (state: RootState) => state.appointments.error;
