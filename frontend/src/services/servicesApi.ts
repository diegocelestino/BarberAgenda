import api from './api';

export interface Service {
  serviceId: string;
  title: string;
  durationMinutes: number;
}

export interface CreateServiceData {
  title: string;
  durationMinutes: number;
}

export interface UpdateServiceData {
  title?: string;
  durationMinutes?: number;
}

export const servicesApi = {
  // Get all services
  getAll: async (): Promise<Service[]> => {
    const response = await api.get('/services');
    return response.data;
  },

  // Get service by ID
  getById: async (serviceId: string): Promise<Service> => {
    const response = await api.get(`/services/${serviceId}`);
    return response.data;
  },

  // Create service
  create: async (data: CreateServiceData): Promise<Service> => {
    const response = await api.post('/services', data);
    return response.data;
  },

  // Update service
  update: async (serviceId: string, data: UpdateServiceData): Promise<Service> => {
    const response = await api.put(`/services/${serviceId}`, data);
    return response.data;
  },

  // Delete service
  delete: async (serviceId: string): Promise<void> => {
    await api.delete(`/services/${serviceId}`);
  },
};
