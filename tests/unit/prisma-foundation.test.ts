import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

describe('fundação Prisma', () => {
  it('está configurada exclusivamente para PostgreSQL e sem multiempresa', async () => {
    const schema = await readFile(path.join(process.cwd(), 'prisma', 'schema.prisma'), 'utf8')
    expect(schema).toContain('provider = "postgresql"')
    expect(schema).toContain('provider = "prisma-client"')
    expect(schema).not.toMatch(/^\s*clinic_id\s+/m)
    expect(schema).toContain('model User')
    expect(schema).toContain('model Patient')
    expect(schema).toContain('model MealPlan')
    expect(schema).toContain('model AuditLog')
  })

  it('mantém migration de fundação versionada', async () => {
    const migration = await readFile(path.join(process.cwd(), 'prisma', 'migrations', '20260805150000_foundation', 'migration.sql'), 'utf8')
    expect(migration).toContain('Nenhuma entidade de domínio')
  })
  it('mantém a migration dos módulos centrais versionada', async () => {
    const migration = await readFile(path.join(process.cwd(), 'prisma', 'migrations', '20260805183921_core_modules', 'migration.sql'), 'utf8')
    expect(migration).toContain('CREATE TABLE "patients"')
    expect(migration).toContain('CREATE TABLE "meal_plans"')
    expect(migration).toContain('CREATE TABLE "audit_logs"')
  })
})
