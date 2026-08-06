export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
export type Appointment = { id: string; patientId: string; date: string; time: string; durationMinutes: number; mode: 'online' | 'in_person'; type: string; status: AppointmentStatus; notes: string; onlineLink?: string; reminderEnabled?: boolean; reminderHours?: number; createdAt: Date }
export type CreateAppointmentInput = Omit<Appointment, 'id' | 'status' | 'createdAt'>

export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'cancelled' | 'refunded'
export type Payment = { id: string; patientId: string; plan: string; amountCents: number; dueDate: string; paidOn: string; method: string; status: PaymentStatus; notes: string; createdAt: Date }
export type CreatePaymentInput = Omit<Payment, 'id' | 'createdAt'>

export type ClinicalDocument = { id: string; patientId: string; title: string; type: string; status: 'draft' | 'available'; createdOn: string; createdAt: Date }
export type CreateDocumentInput = Omit<ClinicalDocument, 'id' | 'status' | 'createdAt'>
