import type { LocalRepository } from '../repositories/local.repository.js'
import { feedbackSchema, mealLogSchema, waterSchema } from '../validators/patient-app.validator.js'
import { messageSchema } from '../validators/message.validator.js'

export class PatientAppService {
  constructor(private readonly repository: LocalRepository) {}
  state() { return this.repository.getPatientAppState() }
  addWater(payload: unknown) { return this.repository.addWater(waterSchema.parse(payload).amountMl) }
  toggleMeal(payload: unknown) { return this.repository.toggleMeal(mealLogSchema.parse(payload).mealId) }
  saveFeedback(payload: unknown) { return this.repository.saveFeedback(feedbackSchema.parse(payload)) }
  sendMessage(payload: unknown) { return this.repository.createPatientMessage(messageSchema.parse(payload)) }
}
