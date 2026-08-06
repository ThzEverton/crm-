import type { Request, Response } from 'express'
import type { PatientService } from '../services/patient.service.js'
import type { AssessmentService } from '../services/assessment.service.js'
import type { DietService } from '../services/diet.service.js'
import type { OperationsService } from '../services/operations.service.js'
import type { SettingsService } from '../services/settings.service.js'
import type { PatientAppService } from '../services/patient-app.service.js'

export class HomeController {
  constructor(
    private readonly patientService: PatientService,
    private readonly assessmentService: AssessmentService,
    private readonly dietService: DietService,
    private readonly operationsService: OperationsService,
    private readonly settingsService: SettingsService,
    private readonly patientAppService: PatientAppService,
  ) {}

  dashboard = (_request: Request, response: Response): void => {
    response.render('dashboard/index', {
      pageTitle: 'Visão geral',
      activeNavigation: 'dashboard',
      bodyClass: 'dashboard-page',
      patients: this.patientService.list(),
    })
  }

  module = async (request: Request, response: Response): Promise<void> => {
    const modules = {
      patients: { title: 'Pacientes', phase: 'Fase 3', description: 'Prontuários, evolução e rotina de acompanhamento em um só lugar.' },
      agenda: { title: 'Agenda', phase: 'Fase 7', description: 'Consultas online e presenciais organizadas por dia.' },
      diets: { title: 'Planos alimentares', phase: 'Fase 6', description: 'Dietas, refeições, substituições e metas nutricionais.' },
      foods: { title: 'Banco de alimentos', phase: 'Fase 5', description: 'Composição nutricional, fontes e alimentos personalizados.' },
      finance: { title: 'Financeiro', phase: 'Fase 8', description: 'Receitas, planos e vencimentos do consultório.' },
      documents: { title: 'Documentos', phase: 'Fase 9', description: 'Relatórios, termos, avaliações e planos em PDF.' },
      settings: { title: 'Configurações', phase: 'Fase 2', description: 'Perfil profissional, segurança e preferências do sistema.' },
    } as const

    const moduleKey = request.params.module as keyof typeof modules
    const selectedModule = modules[moduleKey]
    if (!selectedModule) {
      response.status(404).render('errors/404', { pageTitle: 'Página não encontrada', activeNavigation: '', bodyClass: 'error-page' })
      return
    }

    const foods = moduleKey === 'foods' || moduleKey === 'diets'
      ? await this.dietService.loadFoods()
      : []

    const allPatients = this.patientService.list()

    response.render('dashboard/module', {
      pageTitle: selectedModule.title,
      activeNavigation: moduleKey,
      bodyClass: 'module-page',
      moduleKey,
      selectedModule,
      patients: moduleKey === 'patients'
        ? this.patientService.list().map((patient) => ({ ...patient, assessments: this.assessmentService.listByPatient(patient.id) }))
        : [],
      mealPlans: moduleKey === 'diets' ? this.dietService.listPlans() : [],
      foods,
      allPatients: ['diets', 'agenda', 'finance', 'documents'].includes(moduleKey) ? allPatients : [],
      appointments: moduleKey === 'agenda' ? this.operationsService.appointments() : [],
      payments: moduleKey === 'finance' ? this.operationsService.payments() : [],
      documents: moduleKey === 'documents' ? this.operationsService.documents() : [],
      settings: moduleKey === 'settings' ? this.settingsService.get() : undefined,
      notice: typeof request.query.notice === 'string' ? request.query.notice : '',
      errorMessage: typeof request.query.error === 'string' ? request.query.error : '',
      patientName: typeof request.query.patient === 'string' ? request.query.patient : '',
    })
  }

  patientApp = (request: Request, response: Response): void => {
    const patient = this.patientService.list()[0]
    const plan = this.dietService.listPlans().find((item) => item.patientId === patient?.id && item.status === 'published')
    response.render('patient-app/index', {
      layout: false,
      pageTitle: 'Aplicativo do paciente',
      tab: typeof request.query.tab === 'string' ? request.query.tab : 'home',
      notice: typeof request.query.notice === 'string' ? request.query.notice : '',
      errorMessage: typeof request.query.error === 'string' ? request.query.error : '',
      patient,
      plan,
      assessment: patient ? this.assessmentService.listByPatient(patient.id)[0] : undefined,
      appointments: patient ? this.operationsService.appointments().filter((item) => item.patientId === patient.id) : [],
      payments: patient ? this.operationsService.payments().filter((item) => item.patientId === patient.id) : [],
      documents: patient ? this.operationsService.documents().filter((item) => item.patientId === patient.id) : [],
      patientState: this.patientAppService.state(),
    })
  }

  printPlan = (request: Request, response: Response): void => {
    const plan = this.dietService.findPlan(String(request.params.id ?? ''))
    if (!plan) { response.status(404).render('errors/404', { pageTitle: 'Plano não encontrado', activeNavigation: '', bodyClass: 'error-page' }); return }
    const patient = this.patientService.list().find((item) => item.id === plan.patientId)
    const assessment = patient ? this.assessmentService.listByPatient(patient.id)[0] : undefined
    response.render('diets/print', { layout: false, pageTitle: plan.title, plan, patient, assessment, settings: this.settingsService.get() })
  }
}
