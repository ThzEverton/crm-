import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import type { MessageService } from '../services/message.service.js'

const idFrom = (request: Request) => { const value = request.params.id; return Array.isArray(value) ? value[0] ?? '' : value ?? '' }

export class MessageController {
  constructor(private readonly service: MessageService) {}

  send = (request: Request, response: Response): void => {
    try {
      const message = this.service.send(request.body)
      response.redirect(`/messages?patient=${message.patientId}&notice=message-sent`)
    } catch (error) {
      if (error instanceof ZodError) { response.redirect('/messages?error=Escreva uma mensagem válida.'); return }
      throw error
    }
  }

  markRead = (request: Request, response: Response, next: NextFunction): void => {
    const patientId = idFrom(request)
    if (!this.service.markRead(patientId)) { next(); return }
    response.redirect(`/messages?patient=${patientId}&notice=messages-read`)
  }
}
