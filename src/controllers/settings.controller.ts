import type { Request, Response } from 'express'
import { ZodError } from 'zod'
import type { SettingsService } from '../services/settings.service.js'

export class SettingsController {
  constructor(private readonly service: SettingsService) {}
  update = (request: Request, response: Response): void => {
    try { this.service.update(request.body); response.redirect('/settings?notice=settings-saved') }
    catch (error) { if (error instanceof ZodError) { response.redirect('/settings?error=Revise os dados do perfil.'); return } throw error }
  }
}
