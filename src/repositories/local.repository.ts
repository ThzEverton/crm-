import { randomUUID } from 'node:crypto'
import type { CreatePatientInput, Patient } from '../models/patient.js'
import type { Assessment, CreateAssessmentInput } from '../models/assessment.js'
import type { CreateFoodInput, CreateMealInput, CreateMealPlanInput, FoodItem, MealPlan } from '../models/diet.js'
import type { Appointment, AppointmentStatus, ClinicalDocument, CreateAppointmentInput, CreateDocumentInput, CreatePaymentInput, Payment, PaymentStatus } from '../models/operations.js'

const now = new Date()

const patientSeeds: Patient[] = [
  { id: randomUUID(), fullName: 'Ana Martins', email: 'ana@example.local', phone: '(11) 99910-2020', birthDate: '1992-03-14', goal: 'Emagrecimento', activityLevel: 'Moderado', heightCm: 165, initialWeightKg: 73.6, notes: 'Priorizar rotina alimentar sustentável.', status: 'active', adherence: 92, progressKg: -5.2, plan: 'Trimestral', createdAt: now, updatedAt: now },
  { id: randomUUID(), fullName: 'Caio Souza', email: 'caio@example.local', phone: '(11) 99920-3030', birthDate: '1989-11-08', goal: 'Hipertrofia', activityLevel: 'Intenso', heightCm: 180, initialWeightKg: 76.2, notes: 'Treina musculação cinco vezes por semana.', status: 'active', adherence: 86, progressKg: 3.8, plan: 'Semestral', createdAt: now, updatedAt: now },
  { id: randomUUID(), fullName: 'Luiza Freitas', email: 'luiza@example.local', phone: '(11) 99930-4040', birthDate: '1998-06-21', goal: 'Reeducação alimentar', activityLevel: 'Leve', heightCm: 160, initialWeightKg: 68.1, notes: 'Acompanhar frequência de feedbacks.', status: 'attention', adherence: 74, progressKg: -2.1, plan: 'Mensal', createdAt: now, updatedAt: now },
  { id: randomUUID(), fullName: 'Rafael Mendes', email: 'rafael@example.local', phone: '(11) 99940-5050', birthDate: '1986-09-02', goal: 'Performance', activityLevel: 'Muito intenso', heightCm: 178, initialWeightKg: 81.4, notes: 'Pratica corrida e ciclismo.', status: 'active', adherence: 95, progressKg: 1.4, plan: 'Anual', createdAt: now, updatedAt: now },
  { id: randomUUID(), fullName: 'Bruna Ito', email: 'bruna@example.local', phone: '(11) 99950-6060', birthDate: '1995-01-27', goal: 'Saúde intestinal', activityLevel: 'Moderado', heightCm: 163, initialWeightKg: 64.8, notes: 'Observar tolerância alimentar.', status: 'attention', adherence: 68, progressKg: -1.7, plan: 'Trimestral', createdAt: now, updatedAt: now },
]

export class LocalRepository {
  private readonly patients = [...patientSeeds]
  private readonly assessments: Assessment[] = patientSeeds.flatMap((patient, index) => {
    const heightCm = patient.heightCm ?? 165
    const currentWeight = (patient.initialWeightKg ?? 70) + patient.progressKg
    const bodyFat = [24.8, 16.2, 29.1, 13.9, 27.4][index] ?? 22
    return [
      this.buildAssessment({ patientId: patient.id, assessedOn: '2026-07-28', weightKg: currentWeight, heightCm, bodyFatPercent: bodyFat, waistCm: 74 + index * 3, hipCm: 98 + index * 2, armCm: 29 + index, protocol: 'Bioimpedância', notes: 'Avaliação de acompanhamento.' }),
      this.buildAssessment({ patientId: patient.id, assessedOn: '2026-05-10', weightKg: patient.initialWeightKg ?? 70, heightCm, bodyFatPercent: bodyFat + (patient.progressKg < 0 ? 3.1 : -1.2), waistCm: 79 + index * 3, hipCm: 101 + index * 2, armCm: 28 + index, protocol: 'Bioimpedância', notes: 'Avaliação inicial.' }),
    ]
  })
  private readonly foods: FoodItem[] = [
    { id: randomUUID(), name: 'Arroz integral, cozido', source: 'TACO', servingGrams: 100, kcal: 124, proteinG: 2.6, carbsG: 25.8, fatG: 1, fiberG: 2.7, reviewed: true },
    { id: randomUUID(), name: 'Feijão carioca, cozido', source: 'TACO', servingGrams: 100, kcal: 76, proteinG: 4.8, carbsG: 13.6, fatG: 0.5, fiberG: 8.5, reviewed: true },
    { id: randomUUID(), name: 'Peito de frango, grelhado', source: 'TACO', servingGrams: 100, kcal: 159, proteinG: 32, carbsG: 0, fatG: 2.5, fiberG: 0, reviewed: true },
    { id: randomUUID(), name: 'Ovo de galinha, cozido', source: 'TACO', servingGrams: 100, kcal: 146, proteinG: 13.3, carbsG: 0.6, fatG: 9.5, fiberG: 0, reviewed: true },
    { id: randomUUID(), name: 'Banana prata', source: 'TACO', servingGrams: 100, kcal: 98, proteinG: 1.3, carbsG: 26, fatG: 0.1, fiberG: 2, reviewed: true },
    { id: randomUUID(), name: 'Iogurte natural integral', source: 'Personalizado', servingGrams: 170, kcal: 104, proteinG: 5.8, carbsG: 8.2, fatG: 5.3, fiberG: 0, reviewed: true },
  ]
  private readonly mealPlans: MealPlan[] = [
    {
      id: randomUUID(), patientId: patientSeeds[0]!.id, title: 'Plano de reeducação alimentar', goal: 'Emagrecimento sustentável', startsOn: '2026-08-01', endsOn: '2026-10-31', kcalTarget: 2100, proteinTargetG: 140, status: 'published', version: 1, createdAt: now, updatedAt: now,
      meals: [
        { id: randomUUID(), name: 'Café da manhã', scheduledTime: '07:30', description: 'Ovos mexidos, pão integral, mamão e café', kcal: 420, proteinG: 24, carbsG: 48, fatG: 14 },
        { id: randomUUID(), name: 'Lanche da manhã', scheduledTime: '10:30', description: 'Iogurte natural e castanhas', kcal: 180, proteinG: 12, carbsG: 16, fatG: 8 },
        { id: randomUUID(), name: 'Almoço', scheduledTime: '13:00', description: 'Arroz, feijão, frango grelhado e salada', kcal: 610, proteinG: 38, carbsG: 72, fatG: 16 },
        { id: randomUUID(), name: 'Lanche da tarde', scheduledTime: '16:30', description: 'Sanduíche natural e fruta', kcal: 250, proteinG: 18, carbsG: 34, fatG: 6 },
        { id: randomUUID(), name: 'Jantar', scheduledTime: '20:00', description: 'Batata-doce, peixe assado e legumes', kcal: 480, proteinG: 34, carbsG: 49, fatG: 13 },
      ],
    },
  ]
  private readonly appointments: Appointment[] = [
    { id: randomUUID(), patientId: patientSeeds[4]!.id, date: '2026-08-05', time: '08:30', durationMinutes: 50, mode: 'online', type: 'Retorno', status: 'confirmed', notes: '', createdAt: now },
    { id: randomUUID(), patientId: patientSeeds[3]!.id, date: '2026-08-05', time: '10:00', durationMinutes: 60, mode: 'in_person', type: 'Avaliação', status: 'scheduled', notes: '', createdAt: now },
    { id: randomUUID(), patientId: patientSeeds[0]!.id, date: '2026-08-05', time: '14:30', durationMinutes: 50, mode: 'in_person', type: 'Retorno', status: 'confirmed', notes: '', createdAt: now },
    { id: randomUUID(), patientId: patientSeeds[1]!.id, date: '2026-08-06', time: '09:00', durationMinutes: 50, mode: 'online', type: 'Retorno', status: 'scheduled', notes: '', createdAt: now },
  ]
  private readonly payments: Payment[] = [
    { id: randomUUID(), patientId: patientSeeds[0]!.id, plan: 'Trimestral', amountCents: 120000, dueDate: '2026-08-10', paidOn: '', method: 'Pix', status: 'pending', notes: '', createdAt: now },
    { id: randomUUID(), patientId: patientSeeds[1]!.id, plan: 'Semestral', amountCents: 210000, dueDate: '2026-08-02', paidOn: '', method: 'Cartão', status: 'overdue', notes: '', createdAt: now },
    { id: randomUUID(), patientId: patientSeeds[3]!.id, plan: 'Anual', amountCents: 420000, dueDate: '2026-07-05', paidOn: '2026-07-03', method: 'Pix', status: 'paid', notes: '', createdAt: now },
  ]
  private readonly documents: ClinicalDocument[] = [
    { id: randomUUID(), patientId: patientSeeds[0]!.id, title: 'Plano alimentar — agosto', type: 'Plano alimentar', status: 'available', createdOn: '2026-08-01', createdAt: now },
    { id: randomUUID(), patientId: patientSeeds[3]!.id, title: 'Relatório de evolução', type: 'Evolução', status: 'available', createdOn: '2026-07-28', createdAt: now },
  ]

  listPatients(): Patient[] {
    return [...this.patients].sort((a, b) => a.fullName.localeCompare(b.fullName, 'pt-BR'))
  }

  findPatient(id: string): Patient | undefined {
    return this.patients.find((patient) => patient.id === id)
  }

  createPatient(input: CreatePatientInput): Patient {
    const patient: Patient = {
      id: randomUUID(),
      ...input,
      status: 'active',
      adherence: 0,
      progressKg: 0,
      plan: 'Sem plano',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.patients.push(patient)
    return patient
  }

  togglePatientStatus(id: string): Patient | undefined {
    const patient = this.findPatient(id)
    if (!patient) return undefined
    patient.status = patient.status === 'inactive' ? 'active' : 'inactive'
    patient.updatedAt = new Date()
    return patient
  }

  listAssessments(patientId: string): Assessment[] {
    return this.assessments
      .filter((assessment) => assessment.patientId === patientId)
      .sort((a, b) => b.assessedOn.localeCompare(a.assessedOn))
  }

  createAssessment(input: CreateAssessmentInput): Assessment {
    const assessment = this.buildAssessment(input)
    this.assessments.push(assessment)
    return assessment
  }

  private buildAssessment(input: CreateAssessmentInput): Assessment {
    const heightM = input.heightCm / 100
    const bmi = input.weightKg / (heightM * heightM)
    const fatMassKg = input.bodyFatPercent === null ? null : input.weightKg * input.bodyFatPercent / 100
    return {
      id: randomUUID(),
      ...input,
      bmi: Number(bmi.toFixed(2)),
      fatMassKg: fatMassKg === null ? null : Number(fatMassKg.toFixed(2)),
      leanMassKg: fatMassKg === null ? null : Number((input.weightKg - fatMassKg).toFixed(2)),
      createdAt: new Date(),
    }
  }

  listFoods(): FoodItem[] {
    return [...this.foods].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  }

  createFood(input: CreateFoodInput): FoodItem {
    const food: FoodItem = { id: randomUUID(), ...input, source: 'Personalizado', reviewed: true }
    this.foods.push(food)
    return food
  }

  listMealPlans(): MealPlan[] {
    return [...this.mealPlans].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  }

  findMealPlan(id: string): MealPlan | undefined {
    return this.mealPlans.find((plan) => plan.id === id)
  }

  createMealPlan(input: CreateMealPlanInput): MealPlan {
    const plan: MealPlan = { id: randomUUID(), ...input, status: 'draft', version: 1, meals: [], createdAt: new Date(), updatedAt: new Date() }
    this.mealPlans.push(plan)
    return plan
  }

  addMeal(planId: string, input: CreateMealInput): MealPlan | undefined {
    const plan = this.findMealPlan(planId)
    if (!plan) return undefined
    plan.meals.push({ id: randomUUID(), ...input })
    plan.meals.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime))
    plan.updatedAt = new Date()
    return plan
  }

  publishMealPlan(id: string): MealPlan | undefined {
    const plan = this.findMealPlan(id)
    if (!plan) return undefined
    plan.status = 'published'
    plan.updatedAt = new Date()
    return plan
  }

  listAppointments(): Appointment[] { return [...this.appointments].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)) }
  createAppointment(input: CreateAppointmentInput): Appointment { const item: Appointment = { id: randomUUID(), ...input, status: 'scheduled', createdAt: new Date() }; this.appointments.push(item); return item }
  updateAppointmentStatus(id: string, status: AppointmentStatus): Appointment | undefined { const item = this.appointments.find((entry) => entry.id === id); if (!item) return undefined; item.status = status; return item }

  listPayments(): Payment[] { return [...this.payments].sort((a, b) => b.dueDate.localeCompare(a.dueDate)) }
  createPayment(input: CreatePaymentInput): Payment { const item: Payment = { id: randomUUID(), ...input, createdAt: new Date() }; this.payments.push(item); return item }
  updatePaymentStatus(id: string, status: PaymentStatus): Payment | undefined { const item = this.payments.find((entry) => entry.id === id); if (!item) return undefined; item.status = status; if (status === 'paid' && !item.paidOn) item.paidOn = new Date().toISOString().slice(0, 10); return item }

  listDocuments(): ClinicalDocument[] { return [...this.documents].sort((a, b) => b.createdOn.localeCompare(a.createdOn)) }
  findDocument(id: string): ClinicalDocument | undefined { return this.documents.find((entry) => entry.id === id) }
  createDocument(input: CreateDocumentInput): ClinicalDocument { const item: ClinicalDocument = { id: randomUUID(), ...input, status: 'available', createdAt: new Date() }; this.documents.push(item); return item }
}

export const localRepository = new LocalRepository()
