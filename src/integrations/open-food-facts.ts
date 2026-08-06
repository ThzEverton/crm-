import { randomUUID } from 'node:crypto'
import type { FoodItem } from '../models/diet.js'

const SEARCH_URL = new URL('https://world.openfoodfacts.org/api/v2/search')
SEARCH_URL.search = new URLSearchParams({
  countries_tags_en: 'brazil',
  page_size: '100',
  sort_by: 'unique_scans_n',
  fields: 'code,product_name,brands,nutriments',
}).toString()

type Nutriments = Record<string, number | undefined>
type Product = { code?: string; product_name?: string; brands?: string; nutriments?: Nutriments }
type SearchResponse = { products?: Product[] }

function finite(value: number | undefined): number {
  return Number.isFinite(value) ? value! : 0
}

function mapProducts(products: Product[]): FoodItem[] {
  const names = new Set<string>()
  return products.flatMap((product) => {
    const nutrients = product.nutriments
    const productName = product.product_name?.trim()
    const normalizedName = productName?.toLocaleLowerCase('pt-BR')
    if (!nutrients || !productName || !normalizedName || names.has(normalizedName)) return []
    const kcal = finite(nutrients['energy-kcal_100g'])
    if (kcal <= 0) return []
    names.add(normalizedName)
    const brand = product.brands?.split(',')[0]?.trim()
    return [{ id: randomUUID(), name: brand && !normalizedName.includes(brand.toLocaleLowerCase('pt-BR')) ? `${productName} — ${brand}` : productName, source: 'Open Food Facts' as const, servingGrams: 100, kcal, proteinG: finite(nutrients.proteins_100g), carbsG: finite(nutrients.carbohydrates_100g), fatG: finite(nutrients.fat_100g), fiberG: finite(nutrients.fiber_100g), reviewed: false }]
  })
}

export async function fetchOpenFoodFactsFoods(): Promise<FoodItem[]> {
  const request = () => fetch(SEARCH_URL, {
    signal: AbortSignal.timeout(15_000),
    headers: { accept: 'application/json', 'user-agent': 'CRM-Nutricionista/0.1 (food-catalog)' },
  })
  let response = await request()
  if (response.status === 502 || response.status === 503) response = await request()
  if (!response.ok) throw new Error(`Open Food Facts respondeu HTTP ${response.status}`)

  const data = await response.json() as SearchResponse
  return mapProducts(data.products ?? [])
}

export async function searchOpenFoodFactsFoods(term: string): Promise<FoodItem[]> {
  const url = new URL('https://world.openfoodfacts.org/cgi/search.pl')
  url.search = new URLSearchParams({ search_terms: term, search_simple: '1', action: 'process', json: '1', page_size: '30', fields: 'code,product_name,brands,nutriments', tagtype_0: 'countries', tag_contains_0: 'contains', tag_0: 'Brazil' }).toString()
  const request = () => fetch(url, { signal: AbortSignal.timeout(15_000), headers: { accept: 'application/json', 'user-agent': 'CRM-Nutricionista/0.1 (food-search)' } })
  let response = await request()
  if (response.status === 502 || response.status === 503) response = await request()
  if (!response.ok) throw new Error(`Open Food Facts respondeu HTTP ${response.status}`)
  const data = await response.json() as SearchResponse
  return mapProducts(data.products ?? [])
}
