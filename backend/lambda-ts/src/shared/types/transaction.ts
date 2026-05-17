export interface Transaction {
  transactionId: string;
  date: string;
  type: 'revenue' | 'expense' | 'commission_payment';
  amount: number;
  category: string;
  description: string;

  // IDs (for linking/navigation)
  barberId?: string;
  appointmentId?: string;
  customerId?: string;
  serviceId?: string;

  // Denormalized names (for display)
  customerName?: string;
  serviceName?: string;
  barberName?: string;

  paymentMethod?: string;
  createdAt: string;
}
