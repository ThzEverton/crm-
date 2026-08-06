import { Router } from 'express'
import type { HomeController } from '../controllers/home.controller.js'
import type { PatientController } from '../controllers/patient.controller.js'
import type { AssessmentController } from '../controllers/assessment.controller.js'
import type { DietController } from '../controllers/diet.controller.js'
import type { OperationsController } from '../controllers/operations.controller.js'
import type { SettingsController } from '../controllers/settings.controller.js'
import type { PatientAppController } from '../controllers/patient-app.controller.js'
import type { AuthController } from '../controllers/auth.controller.js'
import { requireAuth, requireNutritionist } from '../middlewares/auth.js'
import { loginRateLimit } from '../middlewares/login-rate-limit.js'

export function createWebRouter(controller: HomeController, patientController: PatientController, assessmentController: AssessmentController, dietController: DietController, operationsController: OperationsController, settingsController: SettingsController, patientAppController: PatientAppController, authController: AuthController): Router {
  const router = Router()
  router.get('/login', authController.loginPage)
  router.post('/login', loginRateLimit, authController.login)
  router.post('/logout', authController.logout)
  router.get('/forgot-password', authController.forgotPage)
  router.post('/forgot-password', authController.forgot)
  router.get('/reset-password', authController.resetPage)
  router.post('/reset-password', authController.reset)
  router.use(requireAuth)
  router.get('/patient-app', controller.patientApp)
  router.post('/patient-app/water', patientAppController.addWater)
  router.post('/patient-app/meals', patientAppController.toggleMeal)
  router.post('/patient-app/feedback', patientAppController.feedback)
  router.get('/api/patient-app/details', patientAppController.details)
  router.get('/documents/:id/download', operationsController.downloadDocument)
  router.use(requireNutritionist)
  router.get('/diets/:id/print', controller.printPlan)
  router.get('/', controller.dashboard)
  router.post('/patients', patientController.create)
  router.post('/patients/:id/status', patientController.toggleStatus)
  router.get('/api/patients/:id/assessments', patientController.assessments)
  router.post('/assessments', assessmentController.create)
  router.post('/diets', dietController.createPlan)
  router.post('/diets/:id/duplicate', dietController.duplicatePlan)
  router.post('/foods', dietController.createFood)
  router.get('/api/foods/search', dietController.searchFoods)
  router.post('/diets/meals', dietController.addMeal)
  router.post('/diets/:planId/meals/:mealId/delete', dietController.deleteMeal)
  router.post('/diets/:id/publish', dietController.publish)
  router.post('/appointments', operationsController.createAppointment)
  router.get('/api/appointments/availability', operationsController.availability)
  router.get('/appointments/:id/whatsapp', operationsController.whatsappReminder)
  router.post('/appointments/:id/status', operationsController.appointmentStatus)
  router.post('/payments', operationsController.createPayment)
  router.post('/payments/:id/status', operationsController.paymentStatus)
  router.post('/documents', operationsController.createDocument)
  router.post('/settings', settingsController.update)
  router.get('/:module', controller.module)
  return router
}
