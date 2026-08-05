import { z } from 'zod'

export const settingsSchema = z.object({
  name: z.string().trim().min(3).max(120),
  crn: z.string().trim().min(3).max(40),
  email: z.string().email(),
  phone: z.string().trim().min(8).max(30),
  consultationDuration: z.coerce.number().int().min(15).max(240),
  notifyAppointments: z.string().optional().transform(Boolean),
  notifyMessages: z.string().optional().transform(Boolean),
  notifyPayments: z.string().optional().transform(Boolean),
})
