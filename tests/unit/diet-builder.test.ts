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
})
