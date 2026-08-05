import type { LocalRepository } from '../repositories/local.repository.js'
import { appointmentSchema, appointmentStatusSchema, documentSchema, paymentSchema, paymentStatusSchema } from '../validators/operations.validator.js'

export class OperationsService {
  constructor(private readonly repository: LocalRepository) {}
  appointments() { return this.repository.listAppointments() }
  createAppointment(payload: unknown) { return this.repository.createAppointment(appointmentSchema.parse(payload)) }
  updateAppointmentStatus(id: string, payload: unknown) { return this.repository.updateAppointmentStatus(id, appointmentStatusSchema.parse(payload).status) }
  payments() { return this.repository.listPayments() }
  createPayment(payload: unknown) { const { amount, ...data } = paymentSchema.parse(payload); return this.repository.createPayment({ ...data, amountCents: Math.round(amount * 100) }) }
  updatePaymentStatus(id: string, payload: unknown) { return this.repository.updatePaymentStatus(id, paymentStatusSchema.parse(payload).status) }
  documents() { return this.repository.listDocuments() }
  document(id: string) { return this.repository.findDocument(id) }
  createDocument(payload: unknown) { return this.repository.createDocument(documentSchema.parse(payload)) }
}
