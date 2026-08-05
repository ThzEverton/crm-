import { describe, expect, it } from 'vitest'
import { parseEnv } from '../../src/config/env.js'

const validEnv = {
  NODE_ENV: 'test',
  PORT: '3000',
  HOST: '0.0.0.0',
  DATABASE_URL: 'postgresql://test:test@localhost:5432/crm_test',
  SESSION_SECRET: 'a-valid-test-secret-with-32-characters',
  LOG_LEVEL: 'silent',
  TRUST_PROXY: 'false',
}

describe('parseEnv', () => {
  it('normaliza valores válidos', () => {
    const result = parseEnv(validEnv)
    expect(result.PORT).toBe(3000)
    expect(result.TRUST_PROXY).toBe(false)
  })

  it('rejeita segredo curto', () => {
    expect(() => parseEnv({ ...validEnv, SESSION_SECRET: 'curto' })).toThrow(/SESSION_SECRET/)
  })

  it('rejeita banco que não seja PostgreSQL', () => {
    expect(() => parseEnv({ ...validEnv, DATABASE_URL: 'mysql://localhost/crm' })).toThrow(/DATABASE_URL/)
  })
})
