import type { LocalRepository } from '../repositories/local.repository.js'
import { feedbackSchema, mealLogSchema, waterSchema } from '../validators/patient-app.validator.js'

export class PatientAppService {
  constructor(private readonly repository: LocalRepository) {}
  state() { return this.repository.getPatientAppState() }
  addWater(payload: unknown) { return this.repository.addWater(waterSchema.parse(payload).amountMl) }
  toggleMeal(payload: unknown) { return this.repository.toggleMeal(mealLogSchema.parse(payload).mealId) }
  saveFeedback(payload: unknown) { return this.repository.saveFeedback(feedbackSchema.parse(payload)) }
  details(patientId?: string) {
    const patient = patientId ? this.repository.findPatient(patientId) : this.repository.listPatients()[0]
    if (!patient) return undefined
    return {
      patient: { id: patient.id, fullName: patient.fullName },
      plan: this.repository.listMealPlans().find((item) => item.patientId === patient.id && item.status === 'published'),
      assessments: this.repository.listAssessments(patient.id),
      payments: this.repository.listPayments().filter((item) => item.patientId === patient.id).map(({ amountCents: _amount, ...item }) => item),
    }
  }
}
