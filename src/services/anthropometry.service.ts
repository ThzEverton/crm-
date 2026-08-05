export type ProtocolCode = 'bioimpedance' | 'jp3_male' | 'jp3_female' | 'jp7' | 'faulkner4' | 'custom'

export const PROTOCOL_LABELS: Record<ProtocolCode, string> = {
  bioimpedance: 'Bioimpedância',
  jp3_male: 'Jackson & Pollock — 3 dobras masculino',
  jp3_female: 'Jackson, Pollock & Ward — 3 dobras feminino',
  jp7: 'Jackson & Pollock — 7 dobras',
  faulkner4: 'Faulkner — 4 dobras (resultado manual)',
  custom: 'Protocolo personalizado',
}

type Skinfolds = Record<string, number | null>

export function calculateBodyFat(protocol: ProtocolCode, sex: 'male' | 'female' | null, age: number, skinfolds: Skinfolds) {
  let sum = 0
  let density: number | null = null
  if (protocol === 'jp3_male') {
    sum = requiredSum(skinfolds, ['chest', 'abdomen', 'thigh'])
    density = 1.10938 - 0.0008267 * sum + 0.0000016 * sum ** 2 - 0.0002574 * age
  } else if (protocol === 'jp3_female') {
    sum = requiredSum(skinfolds, ['triceps', 'suprailiac', 'thigh'])
    density = 1.0994921 - 0.0009929 * sum + 0.0000023 * sum ** 2 - 0.0001392 * age
  } else if (protocol === 'jp7') {
    sum = requiredSum(skinfolds, ['chest', 'midaxillary', 'triceps', 'subscapular', 'abdomen', 'suprailiac', 'thigh'])
    density = sex === 'female'
      ? 1.097 - 0.00046971 * sum + 0.00000056 * sum ** 2 - 0.00012828 * age
      : 1.112 - 0.00043499 * sum + 0.00000055 * sum ** 2 - 0.00028826 * age
  }
  if (density === null) return { bodyFatPercent: null, bodyDensity: null, sumSkinfolds: null }
  return { bodyFatPercent: Number((495 / density - 450).toFixed(2)), bodyDensity: Number(density.toFixed(6)), sumSkinfolds: Number(sum.toFixed(2)) }
}

function requiredSum(values: Skinfolds, keys: string[]): number {
  return keys.reduce((total, key) => {
    const value = values[key]
    if (value === null || value === undefined) throw new Error(`Dobra obrigatória ausente: ${key}.`)
    return total + value
  }, 0)
}
