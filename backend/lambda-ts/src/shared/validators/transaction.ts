import { z } from 'zod';

export const createTransactionSchema = z.object({
  type: z.enum(['revenue', 'expense', 'commission_payment']),
  amount: z.number().positive(),
  category: z.string().min(1),
  description: z.string().min(1),
  barberId: z.string().optional(),
  appointmentId: z.string().optional(),
  paymentMethod: z.string().optional(),
  date: z.string().optional(), // ISO date, defaults to today
});
