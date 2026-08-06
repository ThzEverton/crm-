import type { LocalRepository } from '../repositories/local.repository.js'
import { createFoodSchema, createMealPlanSchema, createMealSchema, duplicateMealPlanSchema } from '../validators/diet.validator.js'

export class DietService {
  constructor(private readonly repository: LocalRepository) {}
  listFoods() { return this.repository.listFoods() }
  async loadFoods() { await this.repository.loadExternalCatalogs(); return this.repository.listFoods() }
  async searchFoods(term: unknown) { const query = String(term ?? '').trim(); return query.length >= 2 ? this.repository.searchExternalFoods(query) : [] }
  createFood(payload: unknown) { return this.repository.createFood(createFoodSchema.parse(payload)) }
  listPlans() { return this.repository.listMealPlans() }
  findPlan(id: string) { return this.repository.findMealPlan(id) }
  createPlan(payload: unknown) { return this.repository.createMealPlan(createMealPlanSchema.parse(payload)) }
  duplicatePlan(sourceId: string, payload: unknown) { return this.repository.duplicateMealPlan(sourceId, duplicateMealPlanSchema.parse(payload)) }
  addMeal(payload: unknown) {
    const { planId, mealId, itemsJson, ...input } = createMealSchema.parse(payload)
    if (mealId && itemsJson.length === 0) return this.repository.updateMealDetails(planId, mealId, input)
    if (itemsJson.length === 0) throw new Error('Adicione pelo menos um alimento.')
    const items = itemsJson.map((selection) => {
      const food = this.repository.findFood(selection.foodId)
      if (!food) throw new Error('Alimento não encontrado.')
      const factor = selection.quantityGrams / food.servingGrams
      const scaled = (value: number) => Number((value * factor).toFixed(1))
      return { foodId: food.id, name: food.name, quantityGrams: selection.quantityGrams, kcal: scaled(food.kcal), proteinG: scaled(food.proteinG), carbsG: scaled(food.carbsG), fatG: scaled(food.fatG), fiberG: scaled(food.fiberG), optionId: selection.optionId ?? 'option-1', choiceGroupId: selection.choiceGroupId ?? `group-${food.id}`, ...(food.unitGrams && food.unitLabel ? { displayQuantity: Number((selection.quantityGrams / food.unitGrams).toFixed(1)), displayUnit: food.unitLabel } : {}) }
    })
    const primaryOptionId = items[0]!.optionId
    const primaryItems = items.filter((item, index) => item.optionId === primaryOptionId && items.findIndex((candidate) => candidate.optionId === item.optionId && candidate.choiceGroupId === item.choiceGroupId) === index)
    const total = (field: 'kcal' | 'proteinG' | 'carbsG' | 'fatG' | 'fiberG') => Number(primaryItems.reduce((sum, item) => sum + item[field], 0).toFixed(1))
    const itemLabel = (item: typeof items[number]) => item.displayQuantity && item.displayUnit ? `${item.displayQuantity} ${item.displayQuantity === 1 ? item.displayUnit : item.displayUnit + 's'} de ${item.name}` : `${item.quantityGrams} g de ${item.name}`
    const optionIds = [...new Set(items.map((item) => item.optionId))]
    const description = optionIds.map((optionId, optionIndex) => {
      const optionItems = items.filter((item) => item.optionId === optionId)
      const groupIds = [...new Set(optionItems.map((item) => item.choiceGroupId))]
      return `${optionIds.length > 1 ? `OPÇÃO ${optionIndex + 1}: ` : ''}${groupIds.map((groupId) => optionItems.filter((item) => item.choiceGroupId === groupId).map(itemLabel).join(' OU ')).join(' + ')}`
    }).join(' | ')
    const meal = {
      ...input,
      items,
      description,
      kcal: total('kcal'), proteinG: total('proteinG'), carbsG: total('carbsG'), fatG: total('fatG'), fiberG: total('fiberG'),
    }
    return mealId ? this.repository.updateMeal(planId, mealId, meal) : this.repository.addMeal(planId, meal)
  }
  deleteMeal(planId: string, mealId: string) { return this.repository.deleteMeal(planId, mealId) }
  publish(id: string) { return this.repository.publishMealPlan(id) }
}
