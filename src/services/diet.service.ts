import type { LocalRepository } from '../repositories/local.repository.js'
import { createFoodSchema, createMealPlanSchema, createMealSchema } from '../validators/diet.validator.js'

export class DietService {
  constructor(private readonly repository: LocalRepository) {}
  listFoods() { return this.repository.listFoods() }
  createFood(payload: unknown) { return this.repository.createFood(createFoodSchema.parse(payload)) }
  listPlans() { return this.repository.listMealPlans() }
  createPlan(payload: unknown) { return this.repository.createMealPlan(createMealPlanSchema.parse(payload)) }
  addMeal(payload: unknown) {
    const { planId, ...meal } = createMealSchema.parse(payload)
    return this.repository.addMeal(planId, meal)
  }
  publish(id: string) { return this.repository.publishMealPlan(id) }
}
