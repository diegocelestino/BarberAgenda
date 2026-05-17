export interface Transaction {
  transactionId: string;
  date: string;
  type: 'revenue' | 'expense' | 'commission_payment';
  amount: number;
  category: string;
  description: string;
  barberId?: string;
  appointmentId?: string;
  paymentMethod?: string;
  createdAt: string;
}
