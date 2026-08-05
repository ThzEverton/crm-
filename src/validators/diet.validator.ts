import { z } from 'zod'

export const createMealPlanSchema = z.object({
  patientId: z.string().uuid(), title: z.string().trim().min(3), goal: z.string().trim().min(3),
  startsOn: z.string().min(1), endsOn: z.string().min(1), kcalTarget: z.coerce.number().int().min(500).max(10_000), proteinTargetG: z.coerce.number().min(0).max(1_000),
})

const mealFoodSelectionSchema = z.array(z.object({
  foodId: z.string().uuid(),
  quantityGrams: z.coerce.number().positive().max(5_000),
})).min(1, 'Adicione pelo menos um alimento.')

export const createMealSchema = z.object({
  planId: z.string().uuid(),
  name: z.string().trim().min(2),
  scheduledTime: z.string().min(1),
  notes: z.string().trim().max(2_000).default(''),
  itemsJson: z.string().transform((value, context) => {
    try { return JSON.parse(value) as unknown }
    catch { context.addIssue({ code: 'custom', message: 'A seleção de alimentos é inválida.' }); return z.NEVER }
  }).pipe(mealFoodSelectionSchema),
})

export const createFoodSchema = z.object({
  name: z.string().trim().min(2), servingGrams: z.coerce.number().positive(), kcal: z.coerce.number().min(0),
  proteinG: z.coerce.number().min(0), carbsG: z.coerce.number().min(0), fatG: z.coerce.number().min(0), fiberG: z.coerce.number().min(0),
})
