import { z } from 'zod'

export const waterSchema = z.object({ amountMl: z.coerce.number().int().min(50).max(5_000) })
export const mealLogSchema = z.object({ mealId: z.string().uuid() })
export const feedbackSchema = z.object({ hunger: z.coerce.number().int().min(1).max(5), energy: z.coerce.number().int().min(1).max(5), sleep: z.coerce.number().int().min(1).max(5), difficulty: z.string().trim().max(1_000).default('') })
