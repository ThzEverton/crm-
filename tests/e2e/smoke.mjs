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
  await desktop.locator('[data-patient-name^="paciente e2e "] [data-dialog-open]').click()
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
  await desktop.locator('[data-patient-filter="attention"]').click()
  if (await desktop.locator('[data-patient-name]:visible').count() !== 2) throw new Error('Filtro de pacientes que precisam de atenção não funcionou.')
  if (await desktop.locator('[data-patient-name]:visible').evaluateAll((cards) => cards.some((card) => card.dataset.patientStatus !== 'attention'))) throw new Error('Filtro de atenção manteve pacientes ativos visíveis.')
  await desktop.locator('[data-patient-filter="all"]').click()
  await desktop.locator('[data-patient-search]').fill('caio@example.local')
  if (await desktop.locator('[data-patient-name]:visible').count() !== 1 || !await desktop.locator('[data-patient-name]:visible h2').getByText('Caio Souza', { exact: true }).isVisible()) throw new Error('Busca de pacientes por e-mail não funcionou.')
  await desktop.locator('[data-patient-search]').fill('99920 3030')
  if (await desktop.locator('[data-patient-name]:visible').count() !== 1) throw new Error('Busca de pacientes por telefone não funcionou.')

  const moduleChecks = [
    ['/foods', 'Banco de alimentos'],
    ['/diets', 'Planos alimentares'],
    ['/agenda', 'Nova consulta'],
    ['/finance', 'Novo lançamento'],
    ['/documents', 'Novo documento'],
    ['/settings', 'Dados do consultório'],
  ]
  for (const [route, expectedText] of moduleChecks) {
    await desktop.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' })
    if (!await desktop.getByText(expectedText, { exact: false }).first().isVisible()) throw new Error(`Módulo ${route} não renderizou ${expectedText}.`)
    if (await desktop.getByText('Esta página ainda não existe.', { exact: true }).count()) throw new Error(`Módulo ${route} caiu no 404.`)
  }
  if (await desktop.locator('.sidebar').getByText('Mensagens', { exact: true }).count()) throw new Error('Módulo de mensagens ainda aparece na navegação.')
  const removedMessagesStatus = (await desktop.request.get(`${baseUrl}/messages`)).status()
  if (removedMessagesStatus !== 404) throw new Error('Rota removida de mensagens ainda está acessível.')

  await desktop.goto(`${baseUrl}/foods`, { waitUntil: 'networkidle' })
  await desktop.locator('[data-food-filter="Personalizado"]').click()
  const visiblePersonalized = desktop.locator('[data-food-source="Personalizado"]:visible')
  if (await visiblePersonalized.count() !== 1) throw new Error('Filtro de alimentos personalizados não ocultou as outras fontes.')
  if (await desktop.locator('[data-food-source="TACO"]:visible').count() !== 0) throw new Error('Filtro personalizado manteve alimentos TACO visíveis.')
  await desktop.locator('[data-food-filter="all"]').click()
  await desktop.locator('[data-food-search]').fill('banana')
  if (await desktop.locator('[data-food-name]:visible').count() === 0) throw new Error('Busca de alimentos não encontrou banana.')
  if (await desktop.locator('[data-food-name]:visible').evaluateAll((rows) => rows.some((row) => !row.dataset.foodName.includes('banana')))) {
    throw new Error('Busca de alimentos manteve resultados que não correspondem ao termo.')
  }
  await desktop.locator('[data-food-search]').fill('pao frances')
  if (await desktop.locator('[data-food-name]:visible').filter({ hasText: 'Pão, trigo, francês' }).count() !== 1) {
    throw new Error('Busca sem acentos não encontrou pão francês da TACO.')
  }
  await desktop.locator('[data-food-search]').fill('whey')
  await desktop.locator('[data-external-food-search]').click()
  await desktop.waitForFunction(() => !document.querySelector('[data-external-food-search]')?.disabled)
  if (await desktop.locator('[data-food-source]:visible').filter({ hasText: /whey/i }).count() === 0) {
    throw new Error('Busca externa não carregou whey das fontes nutricionais.')
  }

  await desktop.goto(`${baseUrl}/diets`, { waitUntil: 'networkidle' })
  await desktop.locator('[data-dialog-open="new-plan"]').click()
  if (await desktop.locator('#new-plan [name="generalGuidelines"]').count() !== 1 || await desktop.locator('#new-plan [name="specialInstructions"]').count() !== 1) throw new Error('Novo plano não oferece orientações clínicas estruturadas.')
  await desktop.locator('#new-plan [data-dialog-close]').first().click()
  await desktop.locator('.plan-card [data-dialog-open]').first().click()
  const printPlanHref = await desktop.locator('.plan-dialog[open] a').filter({ hasText: 'Gerar PDF' }).getAttribute('href')
  const printPlanResponse = await desktop.request.get(`${baseUrl}${printPlanHref}`)
  if (!printPlanResponse.ok() || !(await printPlanResponse.text()).includes('Orientações gerais')) throw new Error('Documento imprimível do plano não foi gerado com as orientações.')
  await desktop.locator('.plan-dialog[open] [data-edit-meal][data-meal-name="Café da manhã"]').click()
  const legacyMealBuilder = desktop.locator('dialog[open] form[data-meal-builder]')
  if (await legacyMealBuilder.locator('.meal-basket-item').count() === 0) throw new Error('Editor não carregou os alimentos da refeição demonstrativa.')
  const eggItem = legacyMealBuilder.locator('.meal-basket-item').filter({ hasText: /Ovo, de galinha, inteiro/i })
  if (await eggItem.locator('input').inputValue() !== '2' || await eggItem.locator('label span').textContent() !== 'un') throw new Error('Ovo não foi apresentado em unidades no editor.')
  await legacyMealBuilder.locator('[data-dialog-close]').first().click()
  await desktop.locator('.plan-dialog[open] [data-new-meal]').click()
  const mealBuilder = desktop.locator('dialog[open] form[data-meal-builder]')
  await mealBuilder.locator('[name="name"]').fill('Ceia E2E')
  await mealBuilder.locator('[name="scheduledTime"]').fill('22:00')
  await mealBuilder.locator('[data-meal-food-search]').fill('pao frances')
  if (await mealBuilder.locator('[data-add-food]:visible').filter({ hasText: 'Pão, trigo, francês' }).count() !== 1) throw new Error('Busca do montador não encontrou pão francês sem acentos.')
  await mealBuilder.locator('[data-meal-food-search]').fill('banana')
  const visibleMealFoods = mealBuilder.locator('[data-add-food]:visible')
  if (await visibleMealFoods.count() === 0) throw new Error('Busca do montador não encontrou banana.')
  if (await visibleMealFoods.evaluateAll((buttons) => buttons.some((button) => !button.dataset.foodName.toLocaleLowerCase('pt-BR').includes('banana')))) {
    throw new Error('Busca do montador manteve alimentos que não correspondem ao termo.')
  }
  await mealBuilder.locator('[data-add-food]:visible').first().click()
  await mealBuilder.locator('.meal-basket-item input').fill('150')
  if (!await mealBuilder.locator('[data-total-kcal]').textContent().then((text) => text !== '0 kcal')) throw new Error('Totais da refeição não foram calculados no editor.')
  await Promise.all([desktop.waitForURL(/notice=meal-created/), mealBuilder.locator('[type="submit"]').click()])
  if (!await desktop.getByText('Refeição adicionada', { exact: true }).isVisible()) throw new Error('Refeição montada com alimento não foi salva.')

  await desktop.locator('.plan-card [data-dialog-open]').first().click()
  await desktop.locator('.plan-dialog[open] [data-edit-meal][data-meal-name="Ceia E2E"]').click()
  const editMealBuilder = desktop.locator('dialog[open] form[data-meal-builder]')
  if (await editMealBuilder.locator('.meal-basket-item').count() !== 1) throw new Error('Editor não carregou os alimentos da refeição existente.')
  await editMealBuilder.locator('[name="name"]').fill('Ceia atualizada E2E')
  await Promise.all([desktop.waitForURL(/notice=meal-updated/), editMealBuilder.locator('[type="submit"]').click()])

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true })
  mobile.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
  mobile.on('pageerror', (error) => errors.push(error.message))
  await mobile.goto(`${baseUrl}/login`, { waitUntil: 'networkidle' })
  await mobile.locator('[name="email"]').fill('ana@example.local')
  await mobile.locator('[name="password"]').fill('Paciente@2026')
  await Promise.all([mobile.waitForURL(/patient-app/), mobile.locator('[type="submit"]').click()])
  const overflows = await mobile.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
  if (overflows) throw new Error('A PWA possui rolagem horizontal no viewport mobile.')
  if (await mobile.locator('.patient-nav > *').count() !== 4) throw new Error('Navegação mobile incompleta.')
  await mobile.screenshot({ path: path.join(outputDir, 'foundation-mobile.png'), fullPage: true })

  if (errors.length) throw new Error(`Erros no console: ${errors.join(' | ')}`)
  console.info('E2E concluído: desktop e mobile sem erros de console ou overflow.')
} finally {
  await browser?.close()
  server.kill('SIGTERM')
}
