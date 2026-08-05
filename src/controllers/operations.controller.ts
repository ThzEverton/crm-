import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import type { OperationsService } from '../services/operations.service.js'

const idFrom = (request: Request) => { const value = request.params.id; return Array.isArray(value) ? value[0] ?? '' : value ?? '' }
export class OperationsController {
  constructor(private readonly service: OperationsService) {}
  createAppointment = (req: Request, res: Response): void => { try { this.service.createAppointment(req.body); res.redirect('/agenda?notice=appointment-created') } catch (e) { if (e instanceof ZodError) { res.redirect('/agenda?error=Revise os dados da consulta.'); return } throw e } }
  appointmentStatus = (req: Request, res: Response, next: NextFunction): void => { try { if (!this.service.updateAppointmentStatus(idFrom(req), req.body)) { next(); return }; res.redirect('/agenda?notice=appointment-status') } catch (e) { if (e instanceof ZodError) { res.redirect('/agenda?error=Status inválido.'); return } throw e } }
  createPayment = (req: Request, res: Response): void => { try { this.service.createPayment(req.body); res.redirect('/finance?notice=payment-created') } catch (e) { if (e instanceof ZodError) { res.redirect('/finance?error=Revise os dados do pagamento.'); return } throw e } }
  paymentStatus = (req: Request, res: Response, next: NextFunction): void => { try { if (!this.service.updatePaymentStatus(idFrom(req), req.body)) { next(); return }; res.redirect('/finance?notice=payment-status') } catch (e) { if (e instanceof ZodError) { res.redirect('/finance?error=Status inválido.'); return } throw e } }
  createDocument = (req: Request, res: Response): void => { try { this.service.createDocument(req.body); res.redirect('/documents?notice=document-created') } catch (e) { if (e instanceof ZodError) { res.redirect('/documents?error=Revise os dados do documento.'); return } throw e } }
  downloadDocument = (req: Request, res: Response, next: NextFunction): void => {
    const document = this.service.document(idFrom(req))
    if (!document) { next(); return }
    const safeName = document.title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9-_]+/g, '-').replace(/^-|-$/g, '') || 'documento'
    res.type('text/plain; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}.txt"`)
    res.send(`${document.title}\nTipo: ${document.type}\nData: ${document.createdOn.split('-').reverse().join('/')}\nStatus: disponível\n\nDocumento clínico gerado localmente pelo CRM Nutricionista.`)
  }
}
