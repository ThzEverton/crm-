import { randomUUID } from 'node:crypto'
import type { FoodItem } from '../models/diet.js'

const TACO_DATA_BASE_URL = 'https://raw.githubusercontent.com/raulfdm/taco-api/main/references/csv'
const REQUEST_TIMEOUT_MS = 8_000

function parseCsvLine(line: string): string[] {
  const fields: string[] = []
  let field = ''
  let quoted = false

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index]!
    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        field += '"'
        index += 1
      } else {
        quoted = !quoted
      }
    } else if (character === ',' && !quoted) {
      fields.push(field)
      field = ''
    } else {
      field += character
    }
  }

  fields.push(field)
  return fields
}

function rows(csv: string): string[][] {
  return csv
    .replaceAll('\r', '')
    .split('\n')
    .filter(Boolean)
    .slice(1)
    .map(parseCsvLine)
}

function number(value: string | undefined): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

async function download(filename: string): Promise<string> {
  const response = await fetch(`${TACO_DATA_BASE_URL}/${filename}`, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    headers: { accept: 'text/csv' },
  })
  if (!response.ok) throw new Error(`TACO respondeu HTTP ${response.status}`)
  return response.text()
}

export async function fetchTacoFoods(): Promise<FoodItem[]> {
  const [foodCsv, nutrientCsv] = await Promise.all([
    download('food.csv'),
    download('nutrients.csv'),
  ])

  const nutrientsByFoodId = new Map(rows(nutrientCsv).map((row) => [row[0], row]))

  return rows(foodCsv).flatMap((foodRow) => {
    const nutrientRow = nutrientsByFoodId.get(foodRow[0])
    const name = foodRow[2]?.trim()
    if (!nutrientRow || !name) return []

    const isWholeEgg = name === 'Ovo, de galinha, inteiro, cozido/10minutos' || name === 'Ovo, de galinha, inteiro, cru' || name === 'Ovo, de galinha, inteiro, frito'
    return [{
      id: randomUUID(),
      name,
      source: 'TACO' as const,
      servingGrams: 100,
      kcal: number(nutrientRow[2]),
      proteinG: number(nutrientRow[4]),
      fatG: number(nutrientRow[5]),
      carbsG: number(nutrientRow[7]),
      fiberG: number(nutrientRow[8]),
      reviewed: true,
      ...(isWholeEgg ? { unitLabel: 'ovo', unitGrams: 50 } : {}),
    }]
  })
}
