import type { LocalRepository } from '../repositories/local.repository.js'
import { createPatientSchema } from '../validators/patient.validator.js'

export class PatientService {
  constructor(private readonly repository: LocalRepository) {}

  list() {
    return this.repository.listPatients()
  }
  find(id: string) { return this.repository.findPatient(id) }
  assessments(id: string) { return this.repository.findPatient(id) ? this.repository.listAssessments(id) : undefined }

  create(payload: unknown) {
    const input = createPatientSchema.parse(payload)
    return this.repository.createPatient(input)
  }

  toggleStatus(id: string) {
    return this.repository.togglePatientStatus(id)
  }
}
