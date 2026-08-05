import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

describe('fundação Prisma', () => {
  it('está configurada exclusivamente para PostgreSQL e sem multiempresa', async () => {
    const schema = await readFile(path.join(process.cwd(), 'prisma', 'schema.prisma'), 'utf8')
    expect(schema).toContain('provider = "postgresql"')
    expect(schema).toContain('provider = "prisma-client"')
    expect(schema).not.toMatch(/^\s*clinic_id\s+/m)
    expect(schema).not.toMatch(/^model\s+/m)
  })

  it('mantém migration de fundação versionada', async () => {
    const migration = await readFile(path.join(process.cwd(), 'prisma', 'migrations', '20260805150000_foundation', 'migration.sql'), 'utf8')
    expect(migration).toContain('Nenhuma entidade de domínio')
  })
})
