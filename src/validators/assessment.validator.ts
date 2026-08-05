import { z } from 'zod'

const nullableMeasure = z.union([z.literal(''), z.coerce.number().positive()]).transform((value) => value === '' ? null : value)

export const createAssessmentSchema = z.object({
  patientId: z.string().uuid(),
  assessedOn: z.string().min(1, 'Informe a data da avaliação.'),
  weightKg: z.coerce.number().min(1).max(500),
  heightCm: z.coerce.number().min(30).max(260),
  bodyFatPercent: nullableMeasure.refine((value) => value === null || value <= 80, 'Percentual de gordura inválido.'),
  waistCm: nullableMeasure,
  hipCm: nullableMeasure,
  armCm: nullableMeasure,
  protocol: z.string().trim().min(2, 'Informe o protocolo utilizado.'),
  notes: z.string().trim().max(2_000).default(''),
})
