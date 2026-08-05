import type { HealthRepository } from '../repositories/health.repository.js'

export type Readiness = {
  status: 'ready' | 'not_ready'
  database: 'up' | 'down'
}

export class HealthService {
  constructor(private readonly repository: HealthRepository) {}

  async readiness(): Promise<Readiness> {
    try {
      await this.repository.ping()
      return { status: 'ready', database: 'up' }
    } catch {
      return { status: 'not_ready', database: 'down' }
    }
  }
}
