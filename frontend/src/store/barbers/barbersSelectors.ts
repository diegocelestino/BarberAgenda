import { RootState } from '../store';

export const selectAllBarbers = (state: RootState) => state.barbers.barbers;
export const selectSelectedBarber = (state: RootState) => state.barbers.selectedBarber;
export const selectBarbersLoading = (state: RootState) => state.barbers.loading;
export const selectBarbersError = (state: RootState) => state.barbers.error;
