import api from './api';

export interface Appointment {
  appointmentId: string;
  barberId: string;
  customerName: string;
  customerPhone: string;
  startTime: number;
  endTime: number;
  service: string;
  notes: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: number;
}

export interface CreateAppointmentData {
  customerName: string;
  customerPhone?: string;
  startTime: number;
  endTime: number;
  service?: string;
  notes?: string;
}

export interface UpdateAppointmentData {
  customerName?: string;
  customerPhone?: string;
  startTime?: number;
  endTime?: number;
  service?: string;
  notes?: string;
  status?: 'scheduled' | 'completed' | 'cancelled';
}

export interface GetAppointmentsParams {
  startDate?: number;
  endDate?: number;
}

// Appointments API functions
export const appointmentsApi = {
  // Get all appointments for a barber
  getByBarber: async (barberId: string, params?: GetAppointmentsParams): Promise<Appointment[]> => {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate.toString());
    if (params?.endDate) queryParams.append('endDate', params.endDate.toString());
    
    const url = `/barbers/${barberId}/appointments${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await api.get(url);
    return response.data.appointments;
  },

  // Get single appointment
  getById: async (barberId: string, appointmentId: string): Promise<Appointment> => {
    const response = await api.get(`/barbers/${barberId}/appointments/${appointmentId}`);
    return response.data.appointment;
  },

  // Create appointment
  create: async (barberId: string, data: CreateAppointmentData): Promise<Appointment> => {
    const response = await api.post(`/barbers/${barberId}/appointments`, data);
    return response.data.appointment;
  },

  // Update appointment
  update: async (barberId: string, appointmentId: string, data: UpdateAppointmentData): Promise<Appointment> => {
    const response = await api.put(`/barbers/${barberId}/appointments/${appointmentId}`, data);
    return response.data.appointment;
  },

  // Delete appointment
  delete: async (barberId: string, appointmentId: string): Promise<void> => {
    await api.delete(`/barbers/${barberId}/appointments/${appointmentId}`);
  },
};
