import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;
const ENV = process.env.REACT_APP_ENV || process.env.NODE_ENV;

// Validate API URL is configured
if (!API_URL) {
  console.error('REACT_APP_API_URL is not configured!');
  throw new Error('API URL is not configured. Please check your .env file.');
}

console.log(`🌐 API Environment: ${ENV}`);
console.log(`🔗 API URL: ${API_URL}`);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor for debugging and adding auth token
api.interceptors.request.use(
  (config) => {
    console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
    
    // Add JWT token to requests if available
    const tokens = localStorage.getItem('authTokens');
    if (tokens) {
      try {
        const { idToken } = JSON.parse(tokens);
        config.headers.Authorization = `Bearer ${idToken}`;
      } catch (error) {
        console.error('Failed to parse auth tokens:', error);
      }
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response.status}`);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('❌ No response received:', error.message);
    } else {
      console.error('❌ Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

export interface BarberSchedule {
  openTime: string;       // "HH:MM" e.g. "09:00"
  closeTime: string;      // "HH:MM" e.g. "18:00"
  lunchStart: string;     // "HH:MM" e.g. "12:00"
  lunchEnd: string;       // "HH:MM" e.g. "13:00"
  workDays: number[];     // 0=Sun, 1=Mon ... 6=Sat
  slotInterval: number;   // minutes e.g. 30
}

export interface Barber {
  barberId: string;
  name: string;
  serviceIds: string[];
  rating: number;
  photoUrl?: string;
  createdAt: number;
  schedule?: BarberSchedule;
}

export interface CreateBarberData {
  name: string;
  serviceIds: string[];
  rating?: number;
  photoUrl?: string;
  schedule?: BarberSchedule;
}

export interface UpdateBarberData {
  name?: string;
  serviceIds?: string[];
  rating?: number;
  photoUrl?: string;
  schedule?: BarberSchedule;
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

  // Get available time slots for a barber on a specific date
  getAvailableSlots: async (barberId: string, date: string, duration: number): Promise<string[]> => {
    const response = await api.get(`/barbers/${barberId}/available-slots`, {
      params: { date, duration },
    });
    return response.data.slots;
  },

  // Get barber extract/report
  getExtract: async (barberId: string, startDate: number, endDate: number): Promise<any> => {
    const response = await api.get(`/barbers/${barberId}/extract`, {
      params: { startDate, endDate, format: 'json' },
    });
    return response.data;
  },
};

export default api;
