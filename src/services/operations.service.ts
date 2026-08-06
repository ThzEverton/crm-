import type { LocalRepository } from '../repositories/local.repository.js'
import { appointmentSchema, appointmentStatusSchema, documentSchema, paymentSchema, paymentStatusSchema } from '../validators/operations.validator.js'

export class OperationsService {
  constructor(private readonly repository: LocalRepository) {}
  appointments() { return this.repository.listAppointments() }
  availability(date: string, durationMinutes: number) {
    const duration = Math.min(240, Math.max(15, durationMinutes || 60)); const slots: string[] = []
    for (let minute = 8 * 60; minute + duration <= 18 * 60; minute += 30) { const time = `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`; if (!this.hasConflict(date, time, duration)) slots.push(time) }
    return slots
  }
  private hasConflict(date: string, time: string, duration: number) {
    const start = Number(time.slice(0, 2)) * 60 + Number(time.slice(3)); const end = start + duration
    return this.repository.listAppointments().some((item) => { if (item.date !== date || ['cancelled','completed'].includes(item.status)) return false; const itemStart = Number(item.time.slice(0, 2)) * 60 + Number(item.time.slice(3)); return start < itemStart + item.durationMinutes && end > itemStart })
  }
  createAppointment(payload: unknown) {
    const { recurrence, recurrenceCount, ...input } = appointmentSchema.parse(payload)
    const today = new Date(); today.setHours(0, 0, 0, 0); const firstDate = new Date(`${input.date}T12:00:00`)
    if (firstDate < today) throw new Error('Não é possível agendar uma consulta em uma data passada.')
    const count = recurrence === 'none' ? 1 : recurrenceCount; const created = []
    for (let index = 0; index < count; index++) {
      const date = new Date(firstDate)
      if (recurrence === 'weekly') date.setDate(date.getDate() + index * 7)
      if (recurrence === 'biweekly') date.setDate(date.getDate() + index * 14)
      if (recurrence === 'monthly') date.setMonth(date.getMonth() + index)
      const dateText = date.toISOString().slice(0, 10)
      if (this.hasConflict(dateText, input.time, input.durationMinutes)) throw new Error(`Já existe uma consulta nesse horário em ${dateText.split('-').reverse().join('/')}.`)
      created.push(this.repository.createAppointment({ ...input, date: dateText }))
    }
    return created
  }
  whatsappReminder(id: string) {
    const appointment = this.repository.listAppointments().find((item) => item.id === id); if (!appointment) return undefined
    const patient = this.repository.findPatient(appointment.patientId); if (!patient) return undefined
    const phone = patient.phone.replace(/\D/g, ''); const national = phone.startsWith('55') ? phone : `55${phone}`
    const mode = appointment.mode === 'online' ? `online${appointment.onlineLink ? `: ${appointment.onlineLink}` : ''}` : 'presencial'
    const message = `Olá, ${patient.fullName}! Lembrete da sua consulta com a nutricionista em ${appointment.date.split('-').reverse().join('/')} às ${appointment.time}, atendimento ${mode}. Por favor, confirme o recebimento.`
    return `https://wa.me/${national}?text=${encodeURIComponent(message)}`
  }
  updateAppointmentStatus(id: string, payload: unknown) { return this.repository.updateAppointmentStatus(id, appointmentStatusSchema.parse(payload).status) }
  payments() { return this.repository.listPayments() }
  createPayment(payload: unknown) { const { amount, ...data } = paymentSchema.parse(payload); return this.repository.createPayment({ ...data, amountCents: Math.round(amount * 100) }) }
  updatePaymentStatus(id: string, payload: unknown) { return this.repository.updatePaymentStatus(id, paymentStatusSchema.parse(payload).status) }
  documents() { return this.repository.listDocuments() }
  document(id: string) { return this.repository.findDocument(id) }
  createDocument(payload: unknown) { return this.repository.createDocument(documentSchema.parse(payload)) }
}
