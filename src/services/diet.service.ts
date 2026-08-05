import type { LocalRepository } from '../repositories/local.repository.js'
import { createFoodSchema, createMealPlanSchema, createMealSchema } from '../validators/diet.validator.js'

export class DietService {
  constructor(private readonly repository: LocalRepository) {}
  listFoods() { return this.repository.listFoods() }
  createFood(payload: unknown) { return this.repository.createFood(createFoodSchema.parse(payload)) }
  listPlans() { return this.repository.listMealPlans() }
  createPlan(payload: unknown) { return this.repository.createMealPlan(createMealPlanSchema.parse(payload)) }
  addMeal(payload: unknown) {
    const { planId, itemsJson, ...input } = createMealSchema.parse(payload)
    const items = itemsJson.map((selection) => {
      const food = this.repository.findFood(selection.foodId)
      if (!food) throw new Error('Alimento não encontrado.')
      const factor = selection.quantityGrams / food.servingGrams
      const scaled = (value: number) => Number((value * factor).toFixed(1))
      return { foodId: food.id, name: food.name, quantityGrams: selection.quantityGrams, kcal: scaled(food.kcal), proteinG: scaled(food.proteinG), carbsG: scaled(food.carbsG), fatG: scaled(food.fatG), fiberG: scaled(food.fiberG) }
    })
    const total = (field: 'kcal' | 'proteinG' | 'carbsG' | 'fatG' | 'fiberG') => Number(items.reduce((sum, item) => sum + item[field], 0).toFixed(1))
    return this.repository.addMeal(planId, {
      ...input,
      items,
      description: items.map((item) => `${item.quantityGrams} g de ${item.name}`).join(' · '),
      kcal: total('kcal'), proteinG: total('proteinG'), carbsG: total('carbsG'), fatG: total('fatG'), fiberG: total('fiberG'),
    })
  }
  publish(id: string) { return this.repository.publishMealPlan(id) }
}
