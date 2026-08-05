import { z } from 'zod'

const nullableMeasure = z.union([z.literal(''), z.undefined(), z.coerce.number().positive()]).transform((value) => value === '' || value === undefined ? null : value)
const protocolCodes = ['bioimpedance', 'jp3_male', 'jp3_female', 'jp7', 'faulkner4', 'custom'] as const

const measureFields = {
  neckCm: nullableMeasure, shouldersCm: nullableMeasure, chestCm: nullableMeasure, waistCm: nullableMeasure, abdomenCm: nullableMeasure, hipCm: nullableMeasure,
  rightArmCm: nullableMeasure, leftArmCm: nullableMeasure, rightForearmCm: nullableMeasure, leftForearmCm: nullableMeasure,
  rightThighCm: nullableMeasure, leftThighCm: nullableMeasure, rightCalfCm: nullableMeasure, leftCalfCm: nullableMeasure,
  skinfoldChestMm: nullableMeasure, skinfoldMidaxillaryMm: nullableMeasure, skinfoldTricepsMm: nullableMeasure, skinfoldSubscapularMm: nullableMeasure,
  skinfoldAbdomenMm: nullableMeasure, skinfoldSuprailiacMm: nullableMeasure, skinfoldThighMm: nullableMeasure,
  bodyFatPercent: nullableMeasure, waterPercent: nullableMeasure, muscleMassKg: nullableMeasure, boneMassKg: nullableMeasure,
}

export const createAssessmentSchema = z.object({
  patientId: z.string().uuid(), assessedOn: z.string().min(1, 'Informe a data da avaliação.'), weightKg: z.coerce.number().min(1).max(500), heightCm: z.coerce.number().min(30).max(260),
  protocolCode: z.enum(protocolCodes), sex: z.union([z.literal(''), z.enum(['male', 'female'])]).default('').transform((value) => value === '' ? null : value),
  ...measureFields,
  notes: z.string().trim().max(2_000).default(''),
}).superRefine((input, context) => {
  const requireFields = (fields: Array<keyof typeof input>) => fields.forEach((field) => { if (input[field] === null) context.addIssue({ code: 'custom', path: [field], message: 'Campo obrigatório para o protocolo selecionado.' }) })
  if (input.protocolCode === 'bioimpedance') requireFields(['bodyFatPercent'])
  if (input.protocolCode === 'jp3_male') requireFields(['skinfoldChestMm', 'skinfoldAbdomenMm', 'skinfoldThighMm'])
  if (input.protocolCode === 'jp3_female') requireFields(['skinfoldTricepsMm', 'skinfoldSuprailiacMm', 'skinfoldThighMm'])
  if (input.protocolCode === 'jp7') { requireFields(['sex', 'skinfoldChestMm', 'skinfoldMidaxillaryMm', 'skinfoldTricepsMm', 'skinfoldSubscapularMm', 'skinfoldAbdomenMm', 'skinfoldSuprailiacMm', 'skinfoldThighMm']) }
  if (input.protocolCode === 'faulkner4') requireFields(['bodyFatPercent', 'skinfoldTricepsMm', 'skinfoldSubscapularMm', 'skinfoldSuprailiacMm', 'skinfoldAbdomenMm'])
})
