import type { Request, Response } from 'express'
import type { HealthService } from '../services/health.service.js'

export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  liveness = (_request: Request, response: Response): void => {
    response.status(200).json({
      status: 'ok',
      service: 'crm-nutricionista',
      timestamp: new Date().toISOString(),
    })
  }

  readiness = async (_request: Request, response: Response): Promise<void> => {
    const readiness = await this.healthService.readiness()
    response.status(readiness.status === 'ready' ? 200 : 503).json(readiness)
  }
}
