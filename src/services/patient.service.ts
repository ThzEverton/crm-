import type { LocalRepository } from '../repositories/local.repository.js'
import { createPatientSchema } from '../validators/patient.validator.js'

export class PatientService {
  constructor(private readonly repository: LocalRepository) {}

  list() {
    return this.repository.listPatients()
  }

  create(payload: unknown) {
    const input = createPatientSchema.parse(payload)
    return this.repository.createPatient(input)
  }

  toggleStatus(id: string) {
    return this.repository.togglePatientStatus(id)
  }
}
