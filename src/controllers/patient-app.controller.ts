import type { Request, Response } from 'express'
import { ZodError } from 'zod'
import type { PatientAppService } from '../services/patient-app.service.js'

export class PatientAppController {
  constructor(private readonly service: PatientAppService) {}
  addWater = (request: Request, response: Response): void => { try { this.service.addWater(request.body); response.redirect('/patient-app?notice=water') } catch (error) { if (error instanceof ZodError) { response.redirect('/patient-app?error=Quantidade inválida.'); return } throw error } }
  toggleMeal = (request: Request, response: Response): void => { try { this.service.toggleMeal(request.body); response.redirect('/patient-app?tab=diet&notice=meal') } catch (error) { if (error instanceof ZodError) { response.redirect('/patient-app?tab=diet&error=Refeição inválida.'); return } throw error } }
  feedback = (request: Request, response: Response): void => { try { this.service.saveFeedback(request.body); response.redirect('/patient-app?notice=feedback') } catch (error) { if (error instanceof ZodError) { response.redirect('/patient-app?error=Revise o feedback.'); return } throw error } }
  sendMessage = (request: Request, response: Response): void => { try { this.service.sendMessage(request.body); response.redirect('/patient-app?tab=chat&notice=message') } catch (error) { if (error instanceof ZodError) { response.redirect('/patient-app?tab=chat&error=Escreva uma mensagem válida.'); return } throw error } }
}
