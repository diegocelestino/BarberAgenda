import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Barber {
  barberId: string;
  name: string;
  specialties: string[];
  rating: number;
  photoUrl?: string;
  createdAt: number;
}

export interface CreateBarberData {
  name: string;
  specialties: string[];
  rating?: number;
  photoUrl?: string;
}

export interface UpdateBarberData {
  name?: string;
  specialties?: string[];
  rating?: number;
  photoUrl?: string;
}

// Barber API functions
export const barberApi = {
  // Get all barbers
  getAll: async (): Promise<Barber[]> => {
    const response = await api.get('/barbers');
    return response.data.barbers;
  },

  // Get single barber
  getById: async (barberId: string): Promise<Barber> => {
    const response = await api.get(`/barbers/${barberId}`);
    return response.data.barber;
  },

  // Create barber
  create: async (data: CreateBarberData): Promise<Barber> => {
    const response = await api.post('/barbers', data);
    return response.data.barber;
  },

  // Update barber
  update: async (barberId: string, data: UpdateBarberData): Promise<Barber> => {
    const response = await api.put(`/barbers/${barberId}`, data);
    return response.data.barber;
  },

  // Delete barber
  delete: async (barberId: string): Promise<void> => {
    await api.delete(`/barbers/${barberId}`);
  },
};

export default api;
