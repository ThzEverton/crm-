import { Pool } from 'pg'
import { env } from './env.js'

const globalForDatabase = globalThis as unknown as { databasePool?: Pool }

export const databasePool = globalForDatabase.databasePool ?? new Pool({
  connectionString: env.DATABASE_URL,
  max: 5,
  connectionTimeoutMillis: 5_000,
  idleTimeoutMillis: 10_000,
})

if (env.NODE_ENV !== 'production') globalForDatabase.databasePool = databasePool

export async function disconnectDatabase(): Promise<void> {
  await databasePool.end()
}
