import { z } from 'zod'

const optionalNumber = z.union([z.literal(''), z.coerce.number().positive()]).transform((value) => value === '' ? null : value)

export const createPatientSchema = z.object({
  fullName: z.string().trim().min(3, 'Informe o nome completo.').max(120),
  email: z.string().trim().email('Informe um e-mail válido.'),
  phone: z.string().trim().min(8, 'Informe um telefone válido.').max(30),
  birthDate: z.string().trim().min(1, 'Informe a data de nascimento.'),
  goal: z.string().trim().min(2, 'Informe o objetivo.'),
  activityLevel: z.string().trim().min(2, 'Informe o nível de atividade.'),
  heightCm: optionalNumber,
  initialWeightKg: optionalNumber,
  notes: z.string().trim().max(2_000).default(''),
})

export type CreatePatientPayload = z.infer<typeof createPatientSchema>
