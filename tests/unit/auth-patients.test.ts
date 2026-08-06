import { describe, expect, it } from 'vitest'
import { AuthService } from '../../src/services/auth.service.js'

describe('acesso padrão dos pacientes', () => {
  it('usa o e-mail cadastrado e cria acesso também para pacientes novos', () => {
    const patients = [{ id: 'p1', email: 'ana@example.local', fullName: 'Ana Martins' }]
    const service = new AuthService(() => patients)
    expect(service.authenticate('ana@example.local', 'Paciente@2026')?.patientId).toBe('p1')
    patients.push({ id: 'p2', email: 'caio@example.local', fullName: 'Caio Souza' })
    expect(service.authenticate('caio@example.local', 'Paciente@2026')?.patientId).toBe('p2')
  })
})
