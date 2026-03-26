import api from './api';

export interface SendEmailRequest {
  name: string;
  phoneNumber: string;
  barberName: string;
  serviceName: string;
  date: string;
  time: string;
}

export const sendAppointmentEmail = async (data: SendEmailRequest): Promise<void> => {
  await api.post('/notifications/email', data);
};
