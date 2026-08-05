import type { NextFunction, Request, Response } from 'express'
import { env } from '../config/env.js'

export function sameOrigin(request: Request, response: Response, next: NextFunction): void {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method) || env.NODE_ENV === 'test') { next(); return }
  const source = request.get('origin') ?? request.get('referer')
  if (!source) { response.status(403).send('Origem da requisição ausente.'); return }
  try { if (new URL(source).host !== request.get('host')) { response.status(403).send('Origem da requisição inválida.'); return } } catch { response.status(403).send('Origem da requisição inválida.'); return }
  next()
}
