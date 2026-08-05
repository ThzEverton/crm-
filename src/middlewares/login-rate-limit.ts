import type { NextFunction, Request, Response } from 'express'

const attempts = new Map<string, { count: number; resetAt: number }>()
export function loginRateLimit(request: Request, response: Response, next: NextFunction): void {
  const key = request.ip ?? 'local'
  const now = Date.now()
  const current = attempts.get(key)
  if (!current || current.resetAt < now) { attempts.set(key, { count: 1, resetAt: now + 15 * 60_000 }); next(); return }
  if (current.count >= 10) { response.status(429).render('auth/login', { layout: false, pageTitle: 'Entrar', errorMessage: 'Muitas tentativas. Aguarde 15 minutos.', notice: '' }); return }
  current.count += 1
  next()
}
