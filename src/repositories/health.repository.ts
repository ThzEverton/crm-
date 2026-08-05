import type { Pool } from 'pg'

export class HealthRepository {
  constructor(private readonly database: Pool) {}

  async ping(): Promise<void> {
    await this.database.query('SELECT 1')
  }
}
