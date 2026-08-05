import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import type { PatientService } from '../services/patient.service.js'

export class PatientController {
  constructor(private readonly service: PatientService) {}

  create = (request: Request, response: Response): void => {
    try {
      const patient = this.service.create(request.body)
      response.redirect(`/patients?notice=created&patient=${encodeURIComponent(patient.fullName)}`)
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues[0]?.message ?? 'Revise os dados informados.'
        response.redirect(`/patients?error=${encodeURIComponent(message)}`)
        return
      }
      throw error
    }
  }

  toggleStatus = (request: Request, response: Response, next: NextFunction): void => {
    const rawId = request.params.id
    const id = Array.isArray(rawId) ? rawId[0] ?? '' : rawId ?? ''
    const patient = this.service.toggleStatus(id)
    if (!patient) {
      next()
      return
    }
    response.redirect(`/patients?notice=status&patient=${encodeURIComponent(patient.fullName)}`)
  }
}
