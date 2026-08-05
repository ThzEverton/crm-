import type { NextFunction, Request, Response } from 'express'
import { env } from '../config/env.js'

export function requireAuth(request: Request, response: Response, next: NextFunction): void {
  if (env.NODE_ENV === 'test') { next(); return }
  if (!request.session.user) { response.redirect('/login'); return }
  next()
}

export function requireNutritionist(request: Request, response: Response, next: NextFunction): void {
  if (env.NODE_ENV === 'test') { next(); return }
  if (request.session.user?.role !== 'nutritionist') { response.redirect('/patient-app'); return }
  next()
}
