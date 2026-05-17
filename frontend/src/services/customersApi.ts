import api from './api';

export interface Customer {
  customerId: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  loyaltyPoints: number;
  totalVisits: number;
  totalSpent: number;
  lastVisit?: string;
  createdAt: string;
}

export const customersApi = {
  getAll: async (search?: string): Promise<Customer[]> => {
    const response = await api.get('/customers', { params: search ? { search } : {} });
    return response.data.customers;
  },

  getById: async (customerId: string): Promise<Customer> => {
    const response = await api.get(`/customers/${customerId}`);
    return response.data.customer;
  },

  getByPhone: async (phone: string): Promise<Customer | null> => {
    const response = await api.get(`/customers/phone/${phone}`);
    return response.data.customer;
  },

  create: async (data: { name: string; phone: string; email?: string; notes?: string }): Promise<Customer> => {
    const response = await api.post('/customers', data);
    return response.data.customer;
  },

  update: async (customerId: string, data: Partial<Customer>): Promise<Customer> => {
    const response = await api.put(`/customers/${customerId}`, data);
    return response.data.customer;
  },

  delete: async (customerId: string): Promise<void> => {
    await api.delete(`/customers/${customerId}`);
  },
};
