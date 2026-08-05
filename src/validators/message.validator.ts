import { z } from 'zod'

export const messageSchema = z.object({
  patientId: z.string().uuid(),
  body: z.string().trim().min(1).max(2_000),
})
