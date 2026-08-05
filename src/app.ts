import { randomUUID } from 'node:crypto'
import path from 'node:path'
import compression from 'compression'
import express, { type Express } from 'express'
import expressLayouts from 'express-ejs-layouts'
import helmet from 'helmet'
import { pinoHttp } from 'pino-http'
import { env } from './config/env.js'
import { databasePool } from './config/database.js'
import { HealthController } from './controllers/health.controller.js'
import { HomeController } from './controllers/home.controller.js'
import { PatientController } from './controllers/patient.controller.js'
import { AssessmentController } from './controllers/assessment.controller.js'
import { DietController } from './controllers/diet.controller.js'
import { OperationsController } from './controllers/operations.controller.js'
import { MessageController } from './controllers/message.controller.js'
import { SettingsController } from './controllers/settings.controller.js'
import { PatientAppController } from './controllers/patient-app.controller.js'
import { errorHandler } from './middlewares/error-handler.js'
import { notFound } from './middlewares/not-found.js'
import { HealthRepository } from './repositories/health.repository.js'
import { localRepository } from './repositories/local.repository.js'
import { createHealthRouter } from './routes/health.routes.js'
import { createWebRouter } from './routes/index.js'
import { HealthService } from './services/health.service.js'
import { PatientService } from './services/patient.service.js'
import { AssessmentService } from './services/assessment.service.js'
import { DietService } from './services/diet.service.js'
import { OperationsService } from './services/operations.service.js'
import { MessageService } from './services/message.service.js'
import { SettingsService } from './services/settings.service.js'
import { PatientAppService } from './services/patient-app.service.js'
import { logger } from './utils/logger.js'

export type AppDependencies = {
  healthService?: HealthService
}

export function createApp(dependencies: AppDependencies = {}): Express {
  const app = express()
  const viewsPath = path.join(process.cwd(), 'src', 'views')
  const publicPath = path.join(process.cwd(), 'public')

  if (env.TRUST_PROXY) app.set('trust proxy', 1)
  app.disable('x-powered-by')
  app.set('view engine', 'ejs')
  app.set('views', viewsPath)
  app.set('layout', 'layouts/main')
  app.use(expressLayouts)

  app.use(pinoHttp({
    logger,
    genReqId: (request, response) => {
      const incomingId = request.headers['x-request-id']
      const requestId = typeof incomingId === 'string' ? incomingId : randomUUID()
      response.setHeader('x-request-id', requestId)
      return requestId
    },
    serializers: {
      req: (request) => ({ id: request.id, method: request.method, url: request.url }),
      res: (response) => ({ statusCode: response.statusCode }),
    },
  }))
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", 'data:'],
        fontSrc: ["'self'"],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }))
  app.use(compression())
  app.use(express.urlencoded({ extended: false, limit: '100kb' }))
  app.use(express.json({ limit: '100kb' }))
  app.use(express.static(publicPath, {
    maxAge: env.NODE_ENV === 'production' ? '7d' : 0,
    index: false,
  }))

  app.use((request, response, next) => {
    request.id = request.id || response.getHeader('x-request-id')?.toString() || randomUUID()
    response.locals.requestId = request.id
    response.locals.currentYear = new Date().getFullYear()
    next()
  })

  const healthService = dependencies.healthService
    ?? new HealthService(new HealthRepository(databasePool))

  const patientService = new PatientService(localRepository)
  const assessmentService = new AssessmentService(localRepository)
  const dietService = new DietService(localRepository)
  const operationsService = new OperationsService(localRepository)
  const messageService = new MessageService(localRepository)
  const settingsService = new SettingsService(localRepository)
  const patientAppService = new PatientAppService(localRepository)
  app.use(createHealthRouter(new HealthController(healthService)))
  app.use(createWebRouter(
    new HomeController(patientService, assessmentService, dietService, operationsService, messageService, settingsService, patientAppService),
    new PatientController(patientService),
    new AssessmentController(assessmentService),
    new DietController(dietService),
    new OperationsController(operationsService),
    new MessageController(messageService),
    new SettingsController(settingsService),
    new PatientAppController(patientAppService),
  ))
  app.use(notFound)
  app.use(errorHandler)

  return app
}

export const app = createApp()
