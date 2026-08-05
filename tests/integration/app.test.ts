import request from 'supertest'
import { describe, expect, it, vi } from 'vitest'
import { createApp } from '../../src/app.js'
import type { HealthService } from '../../src/services/health.service.js'

function healthService(status: 'ready' | 'not_ready'): HealthService {
  return {
    readiness: vi.fn().mockResolvedValue({
      status,
      database: status === 'ready' ? 'up' : 'down',
    }),
  } as unknown as HealthService
}

describe('aplicação HTTP', () => {
  it('renderiza a fundação em EJS', async () => {
    const response = await request(createApp({ healthService: healthService('ready') })).get('/')
    expect(response.status).toBe(200)
    expect(response.type).toContain('html')
    expect(response.text).toContain('Bom dia, Marina.')
    expect(response.text).toContain('Planos alimentares')
  })

  it('renderiza a casca PWA do paciente', async () => {
    const response = await request(createApp({ healthService: healthService('ready') })).get('/patient-app')
    expect(response.status).toBe(200)
    expect(response.text).toContain('nenhum dado sensível é salvo offline')
  })

  it('expõe liveness sem depender do banco', async () => {
    const response = await request(createApp({ healthService: healthService('not_ready') })).get('/health')
    expect(response.status).toBe(200)
    expect(response.body.status).toBe('ok')
  })

  it('retorna 503 quando o banco não está pronto', async () => {
    const response = await request(createApp({ healthService: healthService('not_ready') })).get('/ready')
    expect(response.status).toBe(503)
    expect(response.body).toEqual({ status: 'not_ready', database: 'down' })
  })

  it('renderiza 404 sem vazar detalhes', async () => {
    const response = await request(createApp({ healthService: healthService('ready') })).get('/rota-inexistente')
    expect(response.status).toBe(404)
    expect(response.text).toContain('Esta página ainda não existe.')
  })

  it('mantém os módulos principais navegáveis', async () => {
    const response = await request(createApp({ healthService: healthService('ready') })).get('/patients')
    expect(response.status).toBe(200)
    expect(response.text).toContain('Ana Martins')
    expect(response.text).toContain('Adicionar paciente')
  })

  it('salva um novo paciente no repositório local pelo formulário', async () => {
    const app = createApp({ healthService: healthService('ready') })
    const createResponse = await request(app).post('/patients').type('form').send({
      fullName: 'Paciente de Teste',
      email: 'paciente.teste@example.local',
      phone: '(11) 99999-0000',
      birthDate: '1990-01-01',
      goal: 'Melhorar hábitos',
      activityLevel: 'Moderado',
      heightCm: '170',
      initialWeightKg: '70',
      notes: 'Criado pelo teste de integração.',
    })
    expect(createResponse.status).toBe(302)
    expect(createResponse.headers.location).toContain('/patients?notice=created')

    const listResponse = await request(app).get('/patients')
    expect(listResponse.text).toContain('Paciente de Teste')
  })
})
