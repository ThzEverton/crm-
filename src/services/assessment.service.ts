import type { LocalRepository } from '../repositories/local.repository.js'
import { createAssessmentSchema } from '../validators/assessment.validator.js'

export class AssessmentService {
  constructor(private readonly repository: LocalRepository) {}

  listByPatient(patientId: string) {
    return this.repository.listAssessments(patientId)
  }

  create(payload: unknown) {
    const input = createAssessmentSchema.parse(payload)
    if (!this.repository.findPatient(input.patientId)) throw new Error('Paciente não encontrado.')
    return this.repository.createAssessment(input)
  }
}
