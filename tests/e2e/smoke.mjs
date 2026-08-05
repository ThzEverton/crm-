import { spawn } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright-core'

const port = 3199
const baseUrl = `http://127.0.0.1:${port}`
const chromePath = process.env.CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const outputDir = path.join(process.cwd(), '.chrome-test')
const errors = []

const server = spawn(process.execPath, ['dist/server.js'], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    NODE_ENV: 'development',
    LOG_LEVEL: 'silent',
    PORT: String(port),
    DATABASE_URL: 'postgresql://test:test@localhost:5432/crm_nutricionista_test',
    SESSION_SECRET: 'e2e-session-secret-with-at-least-32-characters',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
})

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/health`)
      if (response.ok) return
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 150))
  }
  throw new Error('Servidor E2E não iniciou em tempo.')
}

let browser
try {
  await waitForServer()
  await mkdir(outputDir, { recursive: true })
  browser = await chromium.launch({ executablePath: chromePath, headless: true })

  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  desktop.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
  desktop.on('pageerror', (error) => errors.push(error.message))
  await desktop.goto(`${baseUrl}/login`, { waitUntil: 'networkidle' })
  await desktop.locator('[name="email"]').fill('marina@consultorio.local')
  await desktop.locator('[name="password"]').fill('Nutri@2026')
  await Promise.all([desktop.waitForURL(baseUrl + '/'), desktop.locator('[type="submit"]').click()])
  await desktop.evaluate(() => navigator.serviceWorker.ready)
  await desktop.reload({ waitUntil: 'networkidle' })
  if (await desktop.locator('h1').textContent() !== 'Bom dia, Marina.') {
    throw new Error('Título principal do desktop não corresponde ao esperado.')
  }
  if (await desktop.locator('.sidebar nav a').count() < 8) throw new Error('Navegação principal do nutricionista incompleta.')
  const statsLayout = await desktop.locator('.clinic-stats').evaluate((element) => getComputedStyle(element).display)
  if (statsLayout !== 'grid') throw new Error('CSS atualizado não foi aplicado após ativação do service worker.')
  if (await desktop.locator('.sidebar-close').isVisible()) {
    throw new Error('Botão de fechar menu apareceu no desktop.')
  }
  await desktop.screenshot({ path: path.join(outputDir, 'foundation-desktop.png'), fullPage: true })

  await desktop.goto(`${baseUrl}/patients`, { waitUntil: 'networkidle' })
  await desktop.locator('[data-dialog-open="new-patient"]').first().click()
  const newPatientDialog = desktop.locator('#new-patient')
  if (!await newPatientDialog.isVisible()) throw new Error('Modal de novo paciente não abriu.')
  await newPatientDialog.locator('[name="fullName"]').fill('Paciente E2E')
  await newPatientDialog.locator('[name="email"]').fill('paciente.e2e@example.local')
  await newPatientDialog.locator('[name="phone"]').fill('(11) 99999-1111')
  await newPatientDialog.locator('[name="birthDate"]').fill('1991-02-03')
  await newPatientDialog.locator('[name="activityLevel"]').selectOption({ label: 'Moderado' })
  await newPatientDialog.locator('[name="goal"]').fill('Validar fluxo local')
  await Promise.all([
    desktop.waitForURL(/notice=created/),
    newPatientDialog.locator('[type="submit"]').click(),
  ])
  if (!await desktop.getByText('Paciente E2E', { exact: true }).first().isVisible()) throw new Error('Paciente criado não apareceu na lista.')
  await desktop.locator('[data-patient-name="paciente e2e"] [data-dialog-open]').click()
  const patientDialog = desktop.locator('dialog[open]').filter({ has: desktop.getByRole('heading', { name: 'Paciente E2E' }) })
  if (!await patientDialog.isVisible()) throw new Error('Modal de prontuário não abriu.')
  await patientDialog.getByRole('button', { name: /Nova avaliação/ }).click()
  const assessmentDialog = desktop.locator('dialog[open]').filter({ has: desktop.getByText('AVALIAÇÃO FÍSICA') })
  await assessmentDialog.locator('[name="weightKg"]').fill('69.5')
  await assessmentDialog.locator('[name="heightCm"]').fill('170')
  await assessmentDialog.locator('[name="protocolCode"]').selectOption('jp3_male')
  if (!await assessmentDialog.locator('[name="skinfoldChestMm"]').isVisible()) throw new Error('Protocolo JP3 não exibiu a dobra peitoral.')
  if (await assessmentDialog.locator('[name="skinfoldTricepsMm"]').isVisible()) throw new Error('Protocolo JP3 masculino exibiu uma dobra de outro protocolo.')
  await assessmentDialog.locator('[name="skinfoldChestMm"]').fill('15')
  await assessmentDialog.locator('[name="skinfoldAbdomenMm"]').fill('18')
  await assessmentDialog.locator('[name="skinfoldThighMm"]').fill('12')
  await Promise.all([
    desktop.waitForURL(/notice=assessment/),
    assessmentDialog.locator('[type="submit"]').click(),
  ])
  if (!await desktop.getByText('Avaliação salva', { exact: true }).isVisible()) throw new Error('Avaliação local não foi salva.')

  const moduleChecks = [
    ['/foods', 'Banco de alimentos'],
    ['/diets', 'Planos alimentares'],
    ['/agenda', 'Nova consulta'],
    ['/finance', 'Novo lançamento'],
    ['/documents', 'Novo documento'],
    ['/messages', 'Conversas'],
    ['/settings', 'Dados do consultório'],
  ]
  for (const [route, expectedText] of moduleChecks) {
    await desktop.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' })
    if (!await desktop.getByText(expectedText, { exact: false }).first().isVisible()) throw new Error(`Módulo ${route} não renderizou ${expectedText}.`)
    if (await desktop.getByText('Esta página ainda não existe.', { exact: true }).count()) throw new Error(`Módulo ${route} caiu no 404.`)
  }

  await desktop.goto(`${baseUrl}/diets`, { waitUntil: 'networkidle' })
  await desktop.locator('.plan-card [data-dialog-open]').first().click()
  await desktop.locator('.plan-dialog[open] [data-dialog-open^="meal-"]').click()
  const mealBuilder = desktop.locator('dialog[open] form[data-meal-builder]')
  await mealBuilder.locator('[name="name"]').fill('Ceia E2E')
  await mealBuilder.locator('[name="scheduledTime"]').fill('22:00')
  await mealBuilder.locator('[data-meal-food-search]').fill('banana')
  await mealBuilder.locator('[data-add-food]:visible').first().click()
  await mealBuilder.locator('.meal-basket-item input').fill('150')
  if (!await mealBuilder.locator('[data-total-kcal]').textContent().then((text) => text !== '0 kcal')) throw new Error('Totais da refeição não foram calculados no editor.')
  await Promise.all([desktop.waitForURL(/notice=meal-created/), mealBuilder.locator('[type="submit"]').click()])
  if (!await desktop.getByText('Refeição adicionada', { exact: true }).isVisible()) throw new Error('Refeição montada com alimento não foi salva.')

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true })
  mobile.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
  mobile.on('pageerror', (error) => errors.push(error.message))
  await mobile.goto(`${baseUrl}/login`, { waitUntil: 'networkidle' })
  await mobile.locator('[name="email"]').fill('ana@example.local')
  await mobile.locator('[name="password"]').fill('Paciente@2026')
  await Promise.all([mobile.waitForURL(/patient-app/), mobile.locator('[type="submit"]').click()])
  const overflows = await mobile.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
  if (overflows) throw new Error('A PWA possui rolagem horizontal no viewport mobile.')
  if (await mobile.locator('.patient-nav > *').count() !== 5) throw new Error('Navegação mobile incompleta.')
  await mobile.screenshot({ path: path.join(outputDir, 'foundation-mobile.png'), fullPage: true })

  if (errors.length) throw new Error(`Erros no console: ${errors.join(' | ')}`)
  console.info('E2E concluído: desktop e mobile sem erros de console ou overflow.')
} finally {
  await browser?.close()
  server.kill('SIGTERM')
}
