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
  bodyDensity: number | null
  waterPercent: number | null
  muscleMassKg: number | null
  boneMassKg: number | null
  waistCm: number | null
  hipCm: number | null
  armCm: number | null
  protocol: string
  protocolCode?: string
  protocolVersion?: string
  sex?: 'male' | 'female' | null
  circumferences?: Record<string, number | null>
  skinfolds?: Record<string, number | null>
  intermediateResults?: Record<string, number>
  notes: string
  createdAt: Date
}

export type CreateAssessmentInput = Omit<Assessment, 'id' | 'bmi' | 'fatMassKg' | 'leanMassKg' | 'createdAt' | 'bodyDensity' | 'waterPercent' | 'muscleMassKg' | 'boneMassKg'>
  & Partial<Pick<Assessment, 'bodyDensity' | 'waterPercent' | 'muscleMassKg' | 'boneMassKg'>>
