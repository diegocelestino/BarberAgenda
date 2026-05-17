import api from './api';

export interface Transaction {
  transactionId: string;
  date: string;
  type: 'revenue' | 'expense' | 'commission_payment';
  amount: number;
  category: string;
  description: string;
  barberId?: string;
  appointmentId?: string;
  customerId?: string;
  serviceId?: string;
  customerName?: string;
  serviceName?: string;
  barberName?: string;
  paymentMethod?: string;
  createdAt: string;
}

export interface FinancialSummary {
  startDate: string;
  endDate: string;
  revenue: number;
  expenses: number;
  commissionsPaid: number;
  profit: number;
  transactionCount: number;
}

export const financialApi = {
  getSummary: async (startDate: string, endDate: string): Promise<FinancialSummary> => {
    const response = await api.get('/financial/summary', { params: { startDate, endDate } });
    return response.data.summary;
  },

  getTransactions: async (params: { startDate: string; endDate: string; type?: string; barberId?: string }): Promise<Transaction[]> => {
    const response = await api.get('/financial/transactions', { params });
    return response.data.transactions;
  },

  createTransaction: async (data: Omit<Transaction, 'transactionId' | 'createdAt'>): Promise<Transaction> => {
    const response = await api.post('/financial/transactions', data);
    return response.data.transaction;
  },

  getCommissions: async (barberId: string, startDate: string, endDate: string) => {
    const response = await api.get('/financial/commissions', { params: { barberId, startDate, endDate } });
    return response.data;
  },

  payCommission: async (barberId: string, amount: number, description?: string): Promise<Transaction> => {
    const response = await api.post('/financial/commissions/pay', { barberId, amount, description });
    return response.data.transaction;
  },
};
