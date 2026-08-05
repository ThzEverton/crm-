export type Assessment = {
  id: string
  patientId: string
  assessedOn: string
  weightKg: number
  heightCm: number
  bmi: number
  bodyFatPercent: number | null
  fatMassKg: number | null
  leanMassKg: number | null
  waistCm: number | null
  hipCm: number | null
  armCm: number | null
  protocol: string
  notes: string
  createdAt: Date
}

export type CreateAssessmentInput = Omit<Assessment, 'id' | 'bmi' | 'fatMassKg' | 'leanMassKg' | 'createdAt'>
