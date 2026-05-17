import { z } from 'zod';

export const createAppointmentSchema = z.object({
  customerName: z.string().min(1),
  customerPhone: z.string().optional(),
  service: z.string().min(1),
  startTime: z.number(),
  endTime: z.number(),
  notes: z.string().optional(),
});

export const completeAppointmentSchema = z.object({
  status: z.literal('completed'),
  paymentMethod: z.enum(['pix', 'dinheiro', 'cartao_debito', 'cartao_credito']),
  paidAmount: z.number().positive(),
});
