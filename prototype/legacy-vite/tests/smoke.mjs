import { chromium } from 'playwright-core'
import assert from 'node:assert/strict'

const browser = await chromium.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: true,
})

const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 })
const errors = []
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
page.on('pageerror', error => errors.push(error.message))

await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' })
await page.getByText('Bom dia, Marina.').waitFor()

await page.getByRole('button', { name: 'Ver como paciente' }).click()
await page.getByText('Prévia do paciente').waitFor()
await page.locator('.phone-nav').getByRole('button', { name: 'Dieta' }).click()
const firstMeal = page.locator('.diet-mobile-list > button').first()
const wasDone = await firstMeal.evaluate(el => el.classList.contains('done'))
await firstMeal.click()
assert.notEqual(await firstMeal.evaluate(el => el.classList.contains('done')), wasDone)
await page.screenshot({ path: 'crm-paciente.png', fullPage: true })

await page.locator('.preview-toolbar .icon-button').click()
await page.locator('.primary-nav').getByRole('button', { name: /Pacientes/ }).click()
await page.locator('.section-heading h2').getByText('Pacientes', { exact: true }).waitFor()
await page.locator('.topbar').getByRole('button', { name: 'Novo paciente' }).click()
await page.getByPlaceholder('Ex.: Camila Rodrigues').fill('Camila Rodrigues')
await page.getByLabel('Objetivo principal').selectOption('Performance')
await page.getByLabel('Plano').selectOption('Semestral')
await page.getByRole('button', { name: /Criar prontuário/ }).click()
await page.getByText('Camila Rodrigues').waitFor()

await page.reload({ waitUntil: 'networkidle' })
await page.locator('.primary-nav').getByRole('button', { name: /Pacientes/ }).click()
await page.getByText('Camila Rodrigues').waitFor()

const registration = await page.evaluate(async () => Boolean(await navigator.serviceWorker.getRegistration()))
assert.equal(registration, true)
assert.deepEqual(errors, [])

console.log(JSON.stringify({ dashboard: true, patientApp: true, mealInteraction: true, patientPersistence: true, serviceWorker: true, consoleErrors: errors.length }))
await browser.close()
