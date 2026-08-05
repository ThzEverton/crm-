export type PatientStatus = 'active' | 'inactive' | 'attention'

export type Patient = {
  id: string
  fullName: string
  email: string
  phone: string
  birthDate: string
  goal: string
  activityLevel: string
  heightCm: number | null
  initialWeightKg: number | null
  notes: string
  status: PatientStatus
  adherence: number
  progressKg: number
  plan: string
  createdAt: Date
  updatedAt: Date
}

export type CreatePatientInput = Pick<Patient,
  'fullName' | 'email' | 'phone' | 'birthDate' | 'goal' | 'activityLevel' |
  'heightCm' | 'initialWeightKg' | 'notes'
>
