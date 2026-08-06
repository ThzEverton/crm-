import { describe, expect, it } from 'vitest'
import { LocalRepository } from '../../src/repositories/local.repository.js'
import { DietService } from '../../src/services/diet.service.js'

describe('composição de refeições', () => {
  it('recalcula os nutrientes no servidor a partir dos alimentos e quantidades', () => {
    const repository = new LocalRepository()
    const service = new DietService(repository)
    const plan = service.listPlans()[0]!
    const [food] = service.listFoods().filter((item) => item.name.includes('Arroz integral'))
    const updated = service.addMeal({ planId: plan.id, name: 'Refeição calculada', scheduledTime: '22:00', notes: '', itemsJson: JSON.stringify([{ foodId: food!.id, quantityGrams: 200 }]) })
    const meal = updated!.meals.find((item) => item.name === 'Refeição calculada')!
    expect(meal.kcal).toBe(248)
    expect(meal.proteinG).toBe(5.2)
    expect(meal.description).toContain('200 g de Arroz integral')
  })

  it('permite atualizar e excluir uma refeição existente', () => {
    const repository = new LocalRepository()
    const service = new DietService(repository)
    const plan = service.listPlans()[0]!
    const food = service.listFoods().find((item) => item.name.includes('Banana'))!
    const created = service.addMeal({ planId: plan.id, name: 'Lanche', scheduledTime: '15:00', notes: '', itemsJson: JSON.stringify([{ foodId: food.id, quantityGrams: 100 }]) })!
    const meal = created.meals.find((item) => item.name === 'Lanche')!

    service.addMeal({ planId: plan.id, mealId: meal.id, name: 'Lanche alterado', scheduledTime: '16:00', notes: 'Nova orientação', itemsJson: JSON.stringify([{ foodId: food.id, quantityGrams: 150 }]) })
    expect(plan.meals.find((item) => item.id === meal.id)?.name).toBe('Lanche alterado')
    expect(service.deleteMeal(plan.id, meal.id)).toBeTruthy()
    expect(plan.meals.some((item) => item.id === meal.id)).toBe(false)
  })

  it('duplica um planejamento para outro paciente sem alterar o original', () => {
    const repository = new LocalRepository()
    const service = new DietService(repository)
    const source = service.listPlans()[0]!
    const target = repository.listPatients().find((patient) => patient.id !== source.patientId)!
    const copy = service.duplicatePlan(source.id, { patientId: target.id, title: 'Plano padrão adaptável', startsOn: '2026-09-01', endsOn: '2026-10-01' })!
    expect(copy.patientId).toBe(target.id)
    expect(copy.status).toBe('draft')
    expect(copy.meals).toHaveLength(source.meals.length)
    expect(copy.meals[0]?.id).not.toBe(source.meals[0]?.id)
    copy.meals[0]!.name = 'Alterado somente na cópia'
    expect(source.meals[0]?.name).not.toBe(copy.meals[0]?.name)
  })
})
