export type FoodItem = {
  id: string
  name: string
  source: 'TACO' | 'Personalizado' | 'USDA' | 'Open Food Facts'
  servingGrams: number
  kcal: number
  proteinG: number
  carbsG: number
  fatG: number
  fiberG: number
  reviewed: boolean
  unitLabel?: string
  unitGrams?: number
}

export type Meal = {
  id: string
  name: string
  scheduledTime: string
  description: string
  kcal: number
  proteinG: number
  carbsG: number
  fatG: number
  fiberG: number
  items: MealFoodItem[]
  notes: string
}

export type MealFoodItem = {
  foodId: string
  name: string
  quantityGrams: number
  kcal: number
  proteinG: number
  carbsG: number
  fatG: number
  fiberG: number
  displayQuantity?: number
  displayUnit?: string
  optionId?: string
  choiceGroupId?: string
}

export type MealPlan = {
  id: string
  patientId: string
  title: string
  goal: string
  startsOn: string
  endsOn: string
  kcalTarget: number
  proteinTargetG: number
  generalGuidelines?: string
  specialInstructions?: string
  status: 'draft' | 'published'
  version: number
  meals: Meal[]
  createdAt: Date
  updatedAt: Date
}

export type CreateMealPlanInput = Omit<MealPlan, 'id' | 'status' | 'version' | 'meals' | 'createdAt' | 'updatedAt'>
export type CreateMealInput = Omit<Meal, 'id'>
export type CreateFoodInput = Omit<FoodItem, 'id' | 'source' | 'reviewed'>
