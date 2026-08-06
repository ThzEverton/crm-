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
    try { const editing = Boolean(request.body.mealId); this.service.addMeal(request.body); response.redirect(`/diets?notice=${editing ? 'meal-updated' : 'meal-created'}`) }
    catch (error) { if (error instanceof ZodError) { response.redirect('/diets?error=Revise os dados da refeição.'); return } throw error }
  }
  duplicatePlan = (request: Request, response: Response, next: NextFunction): void => {
    try {
      const id = String(request.params.id ?? '')
      if (!this.service.duplicatePlan(id, request.body)) { next(); return }
      response.redirect('/diets?notice=plan-duplicated')
    } catch (error) { if (error instanceof ZodError) { response.redirect('/diets?error=Revise os dados da cópia.'); return } throw error }
  }
  searchFoods = async (request: Request, response: Response): Promise<void> => {
    const foods = await this.service.searchFoods(request.query.q)
    response.json({ foods })
  }
  deleteMeal = (request: Request, response: Response, next: NextFunction): void => {
    const planId = String(request.params.planId ?? '')
    const mealId = String(request.params.mealId ?? '')
    if (!this.service.deleteMeal(planId, mealId)) { next(); return }
    response.redirect('/diets?notice=meal-deleted')
  }
  publish = (request: Request, response: Response, next: NextFunction): void => {
    const rawId = request.params.id; const id = Array.isArray(rawId) ? rawId[0] ?? '' : rawId ?? ''
    if (!this.service.publish(id)) { next(); return }
    response.redirect('/diets?notice=published')
  }
}
