import { randomUUID } from 'node:crypto'
import type { CreatePatientInput, Patient } from '../models/patient.js'
import type { Assessment, CreateAssessmentInput } from '../models/assessment.js'
import type { CreateFoodInput, CreateMealInput, CreateMealPlanInput, FoodItem, MealPlan } from '../models/diet.js'
import type { Appointment, AppointmentStatus, ClinicalDocument, CreateAppointmentInput, CreateDocumentInput, CreatePaymentInput, Payment, PaymentStatus } from '../models/operations.js'
import { fetchTacoFoods } from '../integrations/taco-catalog.js'
import { fetchOpenFoodFactsFoods, searchOpenFoodFactsFoods } from '../integrations/open-food-facts.js'
import { searchUsdaFoods } from '../integrations/usda-food-data.js'
import { logger } from '../utils/logger.js'

const now = new Date()

const patientSeeds: Patient[] = [
  { id: randomUUID(), fullName: 'Ana Martins', email: 'ana@example.local', phone: '(11) 99910-2020', birthDate: '1992-03-14', goal: 'Emagrecimento', activityLevel: 'Moderado', heightCm: 165, initialWeightKg: 73.6, notes: 'Priorizar rotina alimentar sustentável.', status: 'active', adherence: 92, progressKg: -5.2, plan: 'Trimestral', createdAt: now, updatedAt: now },
  { id: randomUUID(), fullName: 'Caio Souza', email: 'caio@example.local', phone: '(11) 99920-3030', birthDate: '1989-11-08', goal: 'Hipertrofia', activityLevel: 'Intenso', heightCm: 180, initialWeightKg: 76.2, notes: 'Treina musculação cinco vezes por semana.', status: 'active', adherence: 86, progressKg: 3.8, plan: 'Semestral', createdAt: now, updatedAt: now },
  { id: randomUUID(), fullName: 'Luiza Freitas', email: 'luiza@example.local', phone: '(11) 99930-4040', birthDate: '1998-06-21', goal: 'Reeducação alimentar', activityLevel: 'Leve', heightCm: 160, initialWeightKg: 68.1, notes: 'Acompanhar frequência de feedbacks.', status: 'attention', adherence: 74, progressKg: -2.1, plan: 'Mensal', createdAt: now, updatedAt: now },
  { id: randomUUID(), fullName: 'Rafael Mendes', email: 'rafael@example.local', phone: '(11) 99940-5050', birthDate: '1986-09-02', goal: 'Performance', activityLevel: 'Muito intenso', heightCm: 178, initialWeightKg: 81.4, notes: 'Pratica corrida e ciclismo.', status: 'active', adherence: 95, progressKg: 1.4, plan: 'Anual', createdAt: now, updatedAt: now },
  { id: randomUUID(), fullName: 'Bruna Ito', email: 'bruna@example.local', phone: '(11) 99950-6060', birthDate: '1995-01-27', goal: 'Saúde intestinal', activityLevel: 'Moderado', heightCm: 163, initialWeightKg: 64.8, notes: 'Observar tolerância alimentar.', status: 'attention', adherence: 68, progressKg: -1.7, plan: 'Trimestral', createdAt: now, updatedAt: now },
]

export class LocalRepository {
  private settings = { name: 'Marina Nunes', crn: 'CRN-3 48321', email: 'marina@consultorio.local', phone: '(11) 98888-2026', consultationDuration: 60, notifyAppointments: true, notifyPayments: true }
  private patientAppState = { waterMl: 1250, completedMealIds: new Set<string>(), feedbacks: [] as Array<{ hunger: number; energy: number; sleep: number; difficulty: string; createdAt: Date }> }
  private readonly patients = [...patientSeeds]
  private readonly assessments: Assessment[] = patientSeeds.flatMap((patient, index) => {
    const heightCm = patient.heightCm ?? 165
    const currentWeight = (patient.initialWeightKg ?? 70) + patient.progressKg
    const bodyFat = [24.8, 16.2, 29.1, 13.9, 27.4][index] ?? 22
    return [
      this.buildAssessment({ patientId: patient.id, assessedOn: '2026-07-02', weightKg: Number(((patient.initialWeightKg ?? 70) + patient.progressKg * .82).toFixed(1)), heightCm, bodyFatPercent: Number((bodyFat + (patient.progressKg < 0 ? .7 : -.3)).toFixed(1)), bodyDensity: 1.052, waterPercent: 52.1 + index, muscleMassKg: Number((currentWeight * .37).toFixed(1)), boneMassKg: 2.8 + index * .1, waistCm: 75 + index * 3, hipCm: 98.8 + index * 2, armCm: 29.1 + index, protocol: 'Bioimpedância', protocolCode: 'bioimpedance', protocolVersion: '2026.1', circumferences: { waist: 75 + index * 3, hip: 98.8 + index * 2, rightArm: 29.1 + index, rightThigh: 53 + index, rightCalf: 35 + index }, skinfolds: {}, intermediateResults: { evolutionPercent: 82 }, notes: 'Evolução consistente nas últimas quatro semanas.' }),
      this.buildAssessment({ patientId: patient.id, assessedOn: '2026-06-12', weightKg: Number(((patient.initialWeightKg ?? 70) + patient.progressKg * .63).toFixed(1)), heightCm, bodyFatPercent: Number((bodyFat + (patient.progressKg < 0 ? 1.3 : -.6)).toFixed(1)), bodyDensity: 1.048, waterPercent: 51.4 + index, muscleMassKg: Number((currentWeight * .365).toFixed(1)), boneMassKg: 2.8 + index * .1, waistCm: 76.2 + index * 3, hipCm: 99.4 + index * 2, armCm: 28.8 + index, protocol: 'Jackson & Pollock — 3 dobras', protocolCode: 'jp3_female', protocolVersion: '2026.1', circumferences: { waist: 76.2 + index * 3, hip: 99.4 + index * 2, rightArm: 28.8 + index, rightThigh: 52.5 + index, rightCalf: 34.7 + index }, skinfolds: { triceps: 20 + index, suprailiac: 21 + index, thigh: 25 + index }, intermediateResults: { sumSkinfoldsMm: 66 + index * 3 }, notes: 'Medidas revisadas após ajuste do plano alimentar.' }),
      this.buildAssessment({ patientId: patient.id, assessedOn: '2026-05-29', weightKg: Number(((patient.initialWeightKg ?? 70) + patient.progressKg * .43).toFixed(1)), heightCm, bodyFatPercent: Number((bodyFat + (patient.progressKg < 0 ? 2 : -.8)).toFixed(1)), bodyDensity: 1.044, waterPercent: 50.5 + index, muscleMassKg: Number((currentWeight * .36).toFixed(1)), boneMassKg: 2.7 + index * .1, waistCm: 77.1 + index * 3, hipCm: 100 + index * 2, armCm: 28.5 + index, protocol: 'Bioimpedância', protocolCode: 'bioimpedance', protocolVersion: '2026.1', circumferences: { waist: 77.1 + index * 3, hip: 100 + index * 2, rightArm: 28.5 + index }, skinfolds: {}, intermediateResults: { evolutionPercent: 43 }, notes: 'Retorno intermediário com avaliação antropométrica.' }),
      this.buildAssessment({ patientId: patient.id, assessedOn: '2026-04-15', weightKg: patient.initialWeightKg ?? 70, heightCm, bodyFatPercent: bodyFat + (patient.progressKg < 0 ? 3.5 : -1.4), bodyDensity: 1.039, waterPercent: 48.8 + index, muscleMassKg: Number(((patient.initialWeightKg ?? 70) * .35).toFixed(1)), boneMassKg: 2.7 + index * .1, waistCm: 80 + index * 3, hipCm: 102 + index * 2, armCm: 28 + index, protocol: 'Bioimpedância', protocolCode: 'bioimpedance', protocolVersion: '2026.1', circumferences: { waist: 80 + index * 3, hip: 102 + index * 2, rightArm: 28 + index, rightThigh: 51 + index, rightCalf: 34 + index }, skinfolds: {}, intermediateResults: { evolutionPercent: 0 }, notes: 'Avaliação inicial completa.' }),
      this.buildAssessment({ patientId: patient.id, assessedOn: '2026-07-28', weightKg: currentWeight, heightCm, bodyFatPercent: bodyFat, waistCm: 74 + index * 3, hipCm: 98 + index * 2, armCm: 29 + index, protocol: 'Bioimpedância', notes: 'Avaliação de acompanhamento.' }),
      this.buildAssessment({ patientId: patient.id, assessedOn: '2026-05-10', weightKg: patient.initialWeightKg ?? 70, heightCm, bodyFatPercent: bodyFat + (patient.progressKg < 0 ? 3.1 : -1.2), waistCm: 79 + index * 3, hipCm: 101 + index * 2, armCm: 28 + index, protocol: 'Bioimpedância', notes: 'Avaliação inicial.' }),
    ]
  })
  private readonly foods: FoodItem[] = [
    { id: randomUUID(), name: 'Arroz integral, cozido', source: 'TACO', servingGrams: 100, kcal: 124, proteinG: 2.6, carbsG: 25.8, fatG: 1, fiberG: 2.7, reviewed: true },
    { id: randomUUID(), name: 'Feijão carioca, cozido', source: 'TACO', servingGrams: 100, kcal: 76, proteinG: 4.8, carbsG: 13.6, fatG: 0.5, fiberG: 8.5, reviewed: true },
    { id: randomUUID(), name: 'Peito de frango, grelhado', source: 'TACO', servingGrams: 100, kcal: 159, proteinG: 32, carbsG: 0, fatG: 2.5, fiberG: 0, reviewed: true },
    { id: randomUUID(), name: 'Ovo de galinha, cozido', source: 'TACO', servingGrams: 100, kcal: 146, proteinG: 13.3, carbsG: 0.6, fatG: 9.5, fiberG: 0, reviewed: true, unitLabel: 'ovo', unitGrams: 50 },
    { id: randomUUID(), name: 'Banana prata', source: 'TACO', servingGrams: 100, kcal: 98, proteinG: 1.3, carbsG: 26, fatG: 0.1, fiberG: 2, reviewed: true },
    { id: randomUUID(), name: 'Iogurte natural integral', source: 'Personalizado', servingGrams: 170, kcal: 104, proteinG: 5.8, carbsG: 8.2, fatG: 5.3, fiberG: 0, reviewed: true },
  ]
  private tacoCatalogPromise: Promise<void> | undefined
  private readonly mealPlans: MealPlan[] = [
    {
      id: randomUUID(), patientId: patientSeeds[0]!.id, title: 'Plano de reeducação alimentar', goal: 'Emagrecimento sustentável', startsOn: '2026-08-01', endsOn: '2026-10-31', kcalTarget: 2100, proteinTargetG: 140, generalGuidelines: 'Consumir no mínimo 2 porções de frutas por dia.\nManter ingestão adequada de água ao longo do dia.\nEvitar cafeína após as 14h.\nManter a rotina de atividade física combinada com o profissional responsável.', specialInstructions: 'Em dias com refeições fora da rotina, monte o prato antes de começar e evite beliscar. Mantenha as demais refeições e a hidratação normalmente.', status: 'published', version: 1, createdAt: now, updatedAt: now,
      meals: [
        { id: randomUUID(), name: 'Café da manhã', scheduledTime: '07:30', description: 'Ovos mexidos, pão integral, mamão e café', kcal: 420, proteinG: 24, carbsG: 48, fatG: 14, fiberG: 5, items: [], notes: '' },
        { id: randomUUID(), name: 'Lanche da manhã', scheduledTime: '10:30', description: 'Iogurte natural e castanhas', kcal: 180, proteinG: 12, carbsG: 16, fatG: 8, fiberG: 2, items: [], notes: '' },
        { id: randomUUID(), name: 'Almoço', scheduledTime: '13:00', description: 'Arroz, feijão, frango grelhado e salada', kcal: 610, proteinG: 38, carbsG: 72, fatG: 16, fiberG: 12, items: [], notes: '' },
        { id: randomUUID(), name: 'Lanche da tarde', scheduledTime: '16:30', description: 'Sanduíche natural e fruta', kcal: 250, proteinG: 18, carbsG: 34, fatG: 6, fiberG: 4, items: [], notes: '' },
        { id: randomUUID(), name: 'Jantar', scheduledTime: '20:00', description: 'Batata-doce, peixe assado e legumes', kcal: 480, proteinG: 34, carbsG: 49, fatG: 13, fiberG: 8, items: [], notes: '' },
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
      bodyDensity: input.bodyDensity ?? null,
      waterPercent: input.waterPercent ?? null,
      muscleMassKg: input.muscleMassKg ?? null,
      boneMassKg: input.boneMassKg ?? null,
      bmi: Number(bmi.toFixed(2)),
      fatMassKg: fatMassKg === null ? null : Number(fatMassKg.toFixed(2)),
      leanMassKg: fatMassKg === null ? null : Number((input.weightKg - fatMassKg).toFixed(2)),
      createdAt: new Date(),
    }
  }

  listFoods(): FoodItem[] {
    return [...this.foods].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  }

  async loadExternalCatalogs(): Promise<void> {
    this.tacoCatalogPromise ??= Promise.allSettled([fetchTacoFoods(), fetchOpenFoodFactsFoods()])
      .then(([tacoResult, openFoodFactsResult]) => {
        const customFoods = this.foods.filter((food) => food.source === 'Personalizado')
        const tacoFoods = tacoResult.status === 'fulfilled'
          ? tacoResult.value
          : this.foods.filter((food) => food.source === 'TACO')
        const openFoodFactsFoods = openFoodFactsResult.status === 'fulfilled' ? openFoodFactsResult.value : []
        this.foods.splice(0, this.foods.length, ...tacoFoods, ...openFoodFactsFoods, ...customFoods)
        this.hydrateLegacyMeals()
        if (tacoResult.status === 'rejected') logger.warn({ err: tacoResult.reason }, 'Não foi possível carregar o catálogo TACO')
        if (openFoodFactsResult.status === 'rejected') logger.warn({ err: openFoodFactsResult.reason }, 'Não foi possível carregar o Open Food Facts')
        logger.info({ taco: tacoFoods.length, openFoodFacts: openFoodFactsFoods.length }, 'Catálogos de alimentos carregados')
      })
      .catch((error: unknown) => {
        logger.warn({ err: error }, 'Não foi possível carregar os catálogos; usando catálogo local')
      })

    await this.tacoCatalogPromise
  }

  private hydrateLegacyMeals(): void {
    const recipes: Record<string, Array<[string, number]>> = {
      'Café da manhã': [['Ovo, de galinha, inteiro, cozido/10minutos', 100], ['Pão, trigo, forma, integral', 50], ['Mamão, Papaia, cru', 120], ['Café, infusão 10%', 100]],
      'Lanche da manhã': [['Iogurte natural integral', 170], ['Castanha-do-Brasil, crua', 15]],
      'Almoço': [['Arroz, integral, cozido', 150], ['Feijão, carioca, cozido', 100], ['Frango, peito, sem pele, grelhado', 120], ['Alface, crespa, crua', 50]],
      'Lanche da tarde': [['Pão, trigo, forma, integral', 70], ['Frango, peito, sem pele, cozido', 60], ['Banana, prata, crua', 100]],
      'Jantar': [['Batata, doce, cozida', 180], ['Pescada, filé, cru', 140], ['Cenoura, cozida', 100]],
    }

    this.mealPlans.flatMap((plan) => plan.meals).forEach((meal) => {
      if (meal.items.length) return
      const recipe = recipes[meal.name]
      if (!recipe) return
      const items = recipe.flatMap(([foodName, quantityGrams]) => {
        const food = this.foods.find((item) => item.name === foodName)
        if (!food) return []
        const factor = quantityGrams / food.servingGrams
        const scaled = (value: number) => Number((value * factor).toFixed(1))
        return [{ foodId: food.id, name: food.name, quantityGrams, kcal: scaled(food.kcal), proteinG: scaled(food.proteinG), carbsG: scaled(food.carbsG), fatG: scaled(food.fatG), fiberG: scaled(food.fiberG), ...(food.unitGrams && food.unitLabel ? { displayQuantity: Number((quantityGrams / food.unitGrams).toFixed(1)), displayUnit: food.unitLabel } : {}) }]
      })
      if (!items.length) return
      const total = (field: 'kcal' | 'proteinG' | 'carbsG' | 'fatG' | 'fiberG') => Number(items.reduce((sum, item) => sum + item[field], 0).toFixed(1))
      meal.items = items
      meal.description = items.map((item) => item.displayQuantity && item.displayUnit ? `${item.displayQuantity} ${item.displayQuantity === 1 ? item.displayUnit : item.displayUnit + 's'} de ${item.name}` : `${item.quantityGrams} g de ${item.name}`).join(' · ')
      meal.kcal = total('kcal'); meal.proteinG = total('proteinG'); meal.carbsG = total('carbsG'); meal.fatG = total('fatG'); meal.fiberG = total('fiberG')
    })
  }

  findFood(id: string): FoodItem | undefined { return this.foods.find((food) => food.id === id) }

  async searchExternalFoods(term: string): Promise<FoodItem[]> {
    let results: FoodItem[]
    try {
      results = await searchOpenFoodFactsFoods(term)
    } catch (error) {
      logger.warn({ err: error }, 'Busca textual do Open Food Facts indisponível; usando USDA')
      results = await searchUsdaFoods(term)
    }
    if (!results.length) results = await searchUsdaFoods(term)
    results.forEach((food) => {
      if (!this.foods.some((item) => item.source === food.source && item.name.toLocaleLowerCase('pt-BR') === food.name.toLocaleLowerCase('pt-BR'))) this.foods.push(food)
    })
    return results
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

  duplicateMealPlan(sourceId: string, input: { patientId: string; title: string; startsOn: string; endsOn: string }): MealPlan | undefined {
    const source = this.findMealPlan(sourceId)
    if (!source) return undefined
    const now = new Date()
    const plan: MealPlan = {
      ...source,
      ...input,
      id: randomUUID(),
      status: 'draft',
      version: 1,
      meals: source.meals.map((meal) => ({ ...meal, id: randomUUID(), items: meal.items.map((item) => ({ ...item })) })),
      createdAt: now,
      updatedAt: now,
    }
    this.mealPlans.push(plan)
    return plan
  }

  updateMeal(planId: string, mealId: string, input: CreateMealInput): MealPlan | undefined {
    const plan = this.findMealPlan(planId)
    const mealIndex = plan?.meals.findIndex((meal) => meal.id === mealId) ?? -1
    if (!plan || mealIndex < 0) return undefined
    plan.meals[mealIndex] = { id: mealId, ...input }
    plan.meals.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime))
    plan.updatedAt = new Date()
    return plan
  }

  updateMealDetails(planId: string, mealId: string, input: Pick<CreateMealInput, 'name' | 'scheduledTime' | 'notes'>): MealPlan | undefined {
    const plan = this.findMealPlan(planId)
    const meal = plan?.meals.find((item) => item.id === mealId)
    if (!plan || !meal) return undefined
    Object.assign(meal, input)
    plan.meals.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime))
    plan.updatedAt = new Date()
    return plan
  }

  deleteMeal(planId: string, mealId: string): MealPlan | undefined {
    const plan = this.findMealPlan(planId)
    const mealIndex = plan?.meals.findIndex((meal) => meal.id === mealId) ?? -1
    if (!plan || mealIndex < 0) return undefined
    plan.meals.splice(mealIndex, 1)
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

  getSettings() { return { ...this.settings } }
  updateSettings(input: typeof this.settings) { this.settings = { ...input }; return this.getSettings() }
  getPatientAppState() { return { waterMl: this.patientAppState.waterMl, completedMealIds: [...this.patientAppState.completedMealIds], feedbacks: [...this.patientAppState.feedbacks] } }
  addWater(amountMl: number) { this.patientAppState.waterMl = Math.min(10_000, this.patientAppState.waterMl + amountMl); return this.getPatientAppState() }
  toggleMeal(mealId: string) { if (this.patientAppState.completedMealIds.has(mealId)) this.patientAppState.completedMealIds.delete(mealId); else this.patientAppState.completedMealIds.add(mealId); return this.getPatientAppState() }
  saveFeedback(input: { hunger: number; energy: number; sleep: number; difficulty: string }) { const item = { ...input, createdAt: new Date() }; this.patientAppState.feedbacks.push(item); return item }
}

export const localRepository = new LocalRepository()
