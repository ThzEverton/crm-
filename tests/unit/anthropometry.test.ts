import { describe, expect, it } from 'vitest'
import { calculateBodyFat } from '../../src/services/anthropometry.service.js'
import { createAssessmentSchema } from '../../src/validators/assessment.validator.js'

describe('protocolos antropométricos', () => {
  it('calcula Jackson & Pollock de 3 dobras masculino com resultados intermediários', () => {
    const result = calculateBodyFat('jp3_male', 'male', 30, { chest: 15, abdomen: 18, thigh: 12 })
    expect(result.sumSkinfolds).toBe(45)
    expect(result.bodyDensity).toBeCloseTo(1.067697, 5)
    expect(result.bodyFatPercent).toBeCloseTo(13.62, 1)
  })

  it('exige somente as dobras correspondentes ao protocolo escolhido', () => {
    const common = { patientId: 'f946973c-bb69-4fe8-a700-798eb4568703', assessedOn: '2026-08-05', weightKg: '70', heightCm: '170', protocolCode: 'jp3_female', sex: '', notes: '' }
    expect(createAssessmentSchema.safeParse({ ...common, skinfoldTricepsMm: '18', skinfoldSuprailiacMm: '20', skinfoldThighMm: '24' }).success).toBe(true)
    expect(createAssessmentSchema.safeParse({ ...common, skinfoldChestMm: '18', skinfoldAbdomenMm: '20', skinfoldThighMm: '24' }).success).toBe(false)
  })
})
