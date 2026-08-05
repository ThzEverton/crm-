import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import type { DietService } from '../services/diet.service.js'

export class DietController {
  constructor(private readonly service: DietService) {}
  createPlan = (request: Request, response: Response): void => {
    try { this.service.createPlan(request.body); response.redirect('/diets?notice=plan-created') }
    catch (error) { if (error instanceof ZodError) { response.redirect('/diets?error=Revise os dados do plano.'); return } throw error }
  }
  createFood = (request: Request, response: Response): void => {
    try { this.service.createFood(request.body); response.redirect('/foods?notice=food-created') }
    catch (error) { if (error instanceof ZodError) { response.redirect('/foods?error=Revise os dados do alimento.'); return } throw error }
  }
  addMeal = (request: Request, response: Response): void => {
    try { this.service.addMeal(request.body); response.redirect('/diets?notice=meal-created') }
    catch (error) { if (error instanceof ZodError) { response.redirect('/diets?error=Revise os dados da refeição.'); return } throw error }
  }
  publish = (request: Request, response: Response, next: NextFunction): void => {
    const rawId = request.params.id; const id = Array.isArray(rawId) ? rawId[0] ?? '' : rawId ?? ''
    if (!this.service.publish(id)) { next(); return }
    response.redirect('/diets?notice=published')
  }
}
