import { Router } from 'express'
import type { HomeController } from '../controllers/home.controller.js'
import type { PatientController } from '../controllers/patient.controller.js'
import type { AssessmentController } from '../controllers/assessment.controller.js'
import type { DietController } from '../controllers/diet.controller.js'
import type { OperationsController } from '../controllers/operations.controller.js'

export function createWebRouter(controller: HomeController, patientController: PatientController, assessmentController: AssessmentController, dietController: DietController, operationsController: OperationsController): Router {
  const router = Router()
  router.get('/', controller.dashboard)
  router.get('/patient-app', controller.patientApp)
  router.post('/patients', patientController.create)
  router.post('/patients/:id/status', patientController.toggleStatus)
  router.post('/assessments', assessmentController.create)
  router.post('/diets', dietController.createPlan)
  router.post('/foods', dietController.createFood)
  router.post('/diets/meals', dietController.addMeal)
  router.post('/diets/:id/publish', dietController.publish)
  router.post('/appointments', operationsController.createAppointment)
  router.post('/appointments/:id/status', operationsController.appointmentStatus)
  router.post('/payments', operationsController.createPayment)
  router.post('/payments/:id/status', operationsController.paymentStatus)
  router.post('/documents', operationsController.createDocument)
  router.get('/documents/:id/download', operationsController.downloadDocument)
  router.get('/:module', controller.module)
  return router
}
