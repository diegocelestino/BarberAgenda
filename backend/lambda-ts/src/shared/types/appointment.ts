export interface Appointment {
  appointmentId: string;
  barberId: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  service: string;
  startTime: number;
  endTime: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  paymentMethod?: 'pix' | 'dinheiro' | 'cartao_debito' | 'cartao_credito';
  paidAmount?: number;
  notes?: string;
  createdAt: number;
}
