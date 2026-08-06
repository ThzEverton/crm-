import { randomUUID } from 'node:crypto'
import type { FoodItem } from '../models/diet.js'

type UsdaNutrient = { nutrientId?: number; nutrientName?: string; unitName?: string; value?: number }
type UsdaFood = { description?: string; brandName?: string; foodNutrients?: UsdaNutrient[] }
type UsdaResponse = { foods?: UsdaFood[] }

function nutrient(food: UsdaFood, id: number, name?: string): number {
  const item = food.foodNutrients?.find((entry) => entry.nutrientId === id || (name && entry.nutrientName === name))
  return Number.isFinite(item?.value) ? item!.value! : 0
}

export async function searchUsdaFoods(term: string): Promise<FoodItem[]> {
  const url = new URL('https://api.nal.usda.gov/fdc/v1/foods/search')
  url.search = new URLSearchParams({ api_key: process.env.USDA_API_KEY || 'DEMO_KEY', query: term, pageSize: '25' }).toString()
  const response = await fetch(url, { signal: AbortSignal.timeout(15_000), headers: { accept: 'application/json' } })
  if (!response.ok) throw new Error(`USDA respondeu HTTP ${response.status}`)
  const data = await response.json() as UsdaResponse

  return (data.foods ?? []).flatMap((food) => {
    const description = food.description?.trim()
    if (!description) return []
    const kcal = nutrient(food, 1008, 'Energy')
    if (kcal <= 0) return []
    const brand = food.brandName?.trim()
    return [{ id: randomUUID(), name: brand ? `${description} — ${brand}` : description, source: 'USDA' as const, servingGrams: 100, kcal, proteinG: nutrient(food, 1003), carbsG: nutrient(food, 1005), fatG: nutrient(food, 1004), fiberG: nutrient(food, 1079), reviewed: true }]
  })
}
