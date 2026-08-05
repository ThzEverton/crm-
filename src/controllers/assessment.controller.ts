import type { Request, Response } from 'express'
import { ZodError } from 'zod'
import type { AssessmentService } from '../services/assessment.service.js'

export class AssessmentController {
  constructor(private readonly service: AssessmentService) {}

  create = (request: Request, response: Response): void => {
    try {
      this.service.create(request.body)
      response.redirect('/patients?notice=assessment')
    } catch (error) {
      if (error instanceof ZodError) {
        response.redirect(`/patients?error=${encodeURIComponent(error.issues[0]?.message ?? 'Revise a avaliação.')}`)
        return
      }
      throw error
    }
  }
}
