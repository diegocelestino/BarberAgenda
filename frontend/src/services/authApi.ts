import api from './api';

export interface User {
  username: string;
  email: string;
  role: string;
  createdAt: number;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  email: string;
  role?: string;
}

export const authApi = {
  // Login
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Get current user
  getCurrentUser: async (username: string): Promise<User> => {
    const response = await api.get('/auth/me', { params: { username } });
    return response.data.user;
  },

  // Register new user
  register: async (data: RegisterData): Promise<User> => {
    const response = await api.post('/auth/register', data);
    return response.data.user;
  },
};
