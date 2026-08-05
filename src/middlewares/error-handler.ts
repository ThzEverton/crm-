import type { ErrorRequestHandler } from 'express'
import { env } from '../config/env.js'
import { logger } from '../utils/logger.js'

export const errorHandler: ErrorRequestHandler = (error, request, response, next) => {
  logger.error({ err: error, requestId: request.id }, 'Falha não tratada na requisição')

  if (response.headersSent) {
    next(error)
    return
  }

  const wantsJson = request.accepts(['html', 'json']) === 'json'
  const message = env.NODE_ENV === 'production'
    ? 'Não foi possível concluir a solicitação.'
    : error instanceof Error ? error.message : 'Erro desconhecido'

  if (wantsJson) {
    response.status(500).json({ error: 'internal_error', message, requestId: request.id })
    return
  }

  response.status(500).render('errors/500', {
    pageTitle: 'Erro interno',
    activeNavigation: '',
    bodyClass: 'error-page',
    requestId: request.id,
  })
}
