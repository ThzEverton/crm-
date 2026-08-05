import type { Request, Response } from 'express'

export function notFound(request: Request, response: Response): void {
  const wantsJson = request.accepts(['html', 'json']) === 'json'

  if (wantsJson) {
    response.status(404).json({ error: 'not_found', message: 'Rota não encontrada.' })
    return
  }

  response.status(404).render('errors/404', {
    pageTitle: 'Página não encontrada',
    activeNavigation: '',
    bodyClass: 'error-page',
  })
}
