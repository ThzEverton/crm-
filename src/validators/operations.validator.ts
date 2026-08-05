import { z } from 'zod'

export const appointmentSchema = z.object({ patientId: z.string().uuid(), date: z.string().min(1), time: z.string().min(1), durationMinutes: z.coerce.number().int().min(15).max(240), mode: z.enum(['online','in_person']), type: z.string().trim().min(2), notes: z.string().trim().max(2_000).default('') })
export const appointmentStatusSchema = z.object({ status: z.enum(['scheduled','confirmed','completed','cancelled','no_show']) })
export const paymentSchema = z.object({ patientId: z.string().uuid(), plan: z.string().trim().min(2), amount: z.coerce.number().positive(), dueDate: z.string().min(1), paidOn: z.string().default(''), method: z.string().trim().min(2), status: z.enum(['pending','paid','overdue','cancelled','refunded']), notes: z.string().trim().max(2_000).default('') })
export const paymentStatusSchema = z.object({ status: z.enum(['pending','paid','overdue','cancelled','refunded']) })
export const documentSchema = z.object({ patientId: z.string().uuid(), title: z.string().trim().min(3), type: z.string().trim().min(2), createdOn: z.string().min(1) })
