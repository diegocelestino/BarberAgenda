import { z } from 'zod';

export const createCustomerSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(8),
  email: z.string().email().optional(),
  notes: z.string().optional(),
});

export const updateCustomerSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().min(8).optional(),
  email: z.string().email().optional(),
  notes: z.string().optional(),
  loyaltyPoints: z.number().int().min(0).optional(),
});
