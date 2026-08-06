(() => {
  const normalizeSearch = (value) => value.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim()
  const matchesSearch = (value, term) => {
    const normalizedValue = normalizeSearch(value)
    return normalizeSearch(term).split(' ').filter(Boolean).every((word) => normalizedValue.includes(word))
  }
  const sidebar = document.querySelector('[data-sidebar]')
  const scrim = document.querySelector('.scrim')
  const openButton = document.querySelector('[data-menu-open]')
  const closeButtons = document.querySelectorAll('[data-menu-close]')
  const setMenu = (open) => {
    if (!sidebar || !scrim || !openButton) return
    sidebar.classList.toggle('is-open', open)
    scrim.hidden = !open
    openButton.setAttribute('aria-expanded', String(open))
    document.body.style.overflow = open ? 'hidden' : ''
  }
  openButton?.addEventListener('click', () => setMenu(true))
  closeButtons.forEach((button) => button.addEventListener('click', () => setMenu(false)))
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') setMenu(false) })
  document.querySelectorAll('[data-dialog-close]').forEach((button) => {
    button.addEventListener('click', () => button.closest('dialog')?.close())
  })

  document.querySelectorAll('[data-dialog-open]').forEach((button) => {
    button.addEventListener('click', () => {
      const dialog = document.getElementById(button.dataset.dialogOpen)
      if (dialog instanceof HTMLDialogElement) dialog.showModal()
    })
  })

  document.querySelectorAll('dialog').forEach((dialog) => {
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close()
    })
  })

  document.querySelectorAll('dialog form').forEach((form) => {
    form.addEventListener('submit', () => {
      const submitButton = form.querySelector('[type="submit"]')
      if (!submitButton) return
      submitButton.disabled = true
      submitButton.dataset.originalLabel = submitButton.textContent
      submitButton.textContent = 'Salvando…'
    })
  })

  document.querySelectorAll('[data-toast]').forEach((toast) => {
    const closeToast = () => toast.remove()
    toast.querySelector('[data-toast-close]')?.addEventListener('click', closeToast)
    window.setTimeout(closeToast, 6000)
  })

  const patientSearch = document.querySelector('[data-patient-search]')
  let patientStatus = 'all'
  const filterPatients = () => {
    const term = patientSearch?.value.trim() ?? ''
    document.querySelectorAll('[data-patient-name]').forEach((card) => {
      card.hidden = !matchesSearch(card.dataset.patientName, term) || (patientStatus !== 'all' && card.dataset.patientStatus !== patientStatus)
    })
  }
  patientSearch?.addEventListener('input', filterPatients)
  document.querySelectorAll('[data-patient-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      patientStatus = button.dataset.patientFilter
      document.querySelectorAll('[data-patient-filter]').forEach((item) => item.classList.toggle('active', item === button))
      filterPatients()
    })
  })

  const newPlanGrid = document.querySelector('#new-plan .form-grid')
  if (newPlanGrid) {
    const addPlanTextArea = (name, label, placeholder) => {
      const field = document.createElement('label'); field.className = 'form-field form-span-2'
      const title = document.createElement('span'); title.textContent = label
      const input = document.createElement('textarea'); input.name = name; input.rows = 5; input.maxLength = 10000; input.placeholder = placeholder
      field.append(title, input); newPlanGrid.append(field)
    }
    addPlanTextArea('generalGuidelines', 'Orientações gerais', 'Uma orientação por linha: água, atividade física, frutas, cafeína…')
    addPlanTextArea('specialInstructions', 'Situações especiais e refeições livres', 'Ex.: dias com churrasco, refeições livres, bebidas e recomendações específicas.')
  }

  document.querySelectorAll('.plan-dialog').forEach((dialog) => {
    const planId = dialog.id.replace('plan-', '')
    const footer = dialog.querySelector('.dialog-footer')
    if (!footer || !planId) return
    const printLink = document.createElement('a'); printLink.className = 'button button-secondary'; printLink.href = `/diets/${planId}/print`; printLink.target = '_blank'; printLink.textContent = 'Gerar PDF / Imprimir'
    footer.prepend(printLink)
  })

  const foodSearch = document.querySelector('[data-food-search]')
  let foodSource = 'all'
  const filterFoods = () => {
    const term = foodSearch?.value.trim() ?? ''
    document.querySelectorAll('[data-food-name]').forEach((row) => {
      row.hidden = !matchesSearch(row.dataset.foodName, term) || (foodSource !== 'all' && row.dataset.foodSource !== foodSource)
    })
  }
  foodSearch?.addEventListener('input', filterFoods)
  document.querySelectorAll('[data-food-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      foodSource = button.dataset.foodFilter
      document.querySelectorAll('[data-food-filter]').forEach((item) => item.classList.toggle('active', item === button))
      filterFoods()
    })
  })
  const externalFoodSearch = document.querySelector('[data-external-food-search]')
  const searchExternalFoods = async () => {
    const term = foodSearch?.value.trim() ?? ''
    if (term.length < 2 || !externalFoodSearch) return
    externalFoodSearch.disabled = true; externalFoodSearch.textContent = 'Buscando…'
    try {
      const response = await fetch(`/api/foods/search?q=${encodeURIComponent(term)}`, { headers: { accept: 'application/json' } })
      if (!response.ok) throw new Error('Falha na busca externa')
      const { foods = [] } = await response.json()
      const table = document.querySelector('.food-table')
      foods.forEach((food) => {
        const normalizedName = food.name.toLocaleLowerCase('pt-BR')
        if (document.querySelector(`[data-food-source="${CSS.escape(food.source)}"][data-food-name="${CSS.escape(normalizedName)}"]`)) return
        const row = document.createElement('article')
        row.dataset.foodName = normalizedName; row.dataset.foodSource = food.source
        const identity = document.createElement('span'); const name = document.createElement('strong'); const review = document.createElement('small')
        name.textContent = food.name; review.textContent = 'Dados colaborativos'; identity.append(name, review)
        const source = document.createElement('b'); source.className = 'food-source'; source.textContent = food.source
        const values = [`${food.servingGrams} g`, `${food.kcal} kcal`, `${food.proteinG} g`, `${food.carbsG} g`, `${food.fatG} g`].map((value) => { const span = document.createElement('span'); span.textContent = value; return span })
        row.append(identity, source, ...values); table?.append(row)
      })
      foodSource = 'all'
      document.querySelectorAll('[data-food-filter]').forEach((button) => button.classList.toggle('active', button.dataset.foodFilter === foodSource))
      filterFoods()
      externalFoodSearch.textContent = foods.length ? `${foods.length} encontrados` : 'Nenhum resultado'
    } catch {
      externalFoodSearch.textContent = 'Tentar novamente'
    } finally {
      externalFoodSearch.disabled = false
    }
  }
  externalFoodSearch?.addEventListener('click', searchExternalFoods)
  foodSearch?.addEventListener('keydown', (event) => { if (event.key === 'Enter') { event.preventDefault(); void searchExternalFoods() } })

  const protocolGuides = {
    bioimpedance: ['BIO', 'Bioimpedância selecionada', 'Informe os resultados exibidos pelo equipamento.'],
    jp3_male: ['JP3', '3 dobras · masculino', 'Peitoral, abdominal e coxa. O resultado é calculado pela idade.'],
    jp3_female: ['JPW', '3 dobras · feminino', 'Tríceps, supra-ilíaca e coxa. O resultado é calculado pela idade.'],
    jp7: ['JP7', '7 dobras cutâneas', 'Selecione o sexo da equação e informe os sete pontos anatômicos.'],
    faulkner4: ['F4', 'Faulkner · registro assistido', 'As quatro dobras são registradas; o percentual permanece manual até validação clínica.'],
    custom: ['CUS', 'Protocolo personalizado', 'Registre as medidas disponíveis e informe o percentual quando aplicável.'],
  }
  document.querySelectorAll('[data-protocol-select]').forEach((select) => {
    const form = select.closest('form')
    const updateProtocol = () => {
      const protocol = select.value
      form?.querySelectorAll('[data-protocols]').forEach((field) => {
        const visible = field.dataset.protocols.split(' ').includes(protocol)
        field.hidden = !visible
        field.querySelectorAll('input,select').forEach((input) => {
          const requiredFor = input.dataset.requiredProtocols?.split(' ') ?? []
          input.required = visible && requiredFor.includes(protocol)
          if (!visible) input.value = ''
        })
      })
      const guide = form?.querySelector('[data-protocol-guide]')
      const content = protocolGuides[protocol]
      if (guide && content) {
        guide.querySelector('b').textContent = content[0]
        guide.querySelector('strong').textContent = content[1]
        guide.querySelector('small').textContent = content[2]
      }
    }
    select.addEventListener('change', updateProtocol)
    updateProtocol()
  })

  document.querySelectorAll('[data-meal-builder]').forEach((builder) => {
    const notesLabel = builder.elements.notes?.closest('label')?.querySelector('span')
    if (notesLabel) notesLabel.textContent = 'Opções, substituições e orientações'
    const selections = new Map()
    let activeOption = 'option-1'
    let pendingSubstitutionGroup = ''
    let sequence = 1
    const basket = builder.querySelector('[data-meal-basket]')
    const empty = builder.querySelector('[data-meal-empty]')
    const hidden = builder.querySelector('[data-meal-items]')
    const search = builder.querySelector('[data-meal-food-search]')
    const mealIdInput = document.createElement('input')
    mealIdInput.type = 'hidden'; mealIdInput.name = 'mealId'; builder.append(mealIdInput)
    const number = (value) => Number.parseFloat(value || '0')
    const format = (value) => Number(value.toFixed(1)).toLocaleString('pt-BR')
    const optionBar = document.createElement('nav')
    optionBar.className = 'meal-option-bar'
    builder.querySelector('.meal-builder-grid')?.before(optionBar)
    const optionIds = () => [...new Set([...selections.values()].map((item) => item.optionId).concat(activeOption))]
    const renderOptions = () => {
      optionBar.replaceChildren()
      optionIds().forEach((optionId, index) => {
        const button = document.createElement('button'); button.type = 'button'; button.textContent = `Opção ${index + 1}`; button.className = optionId === activeOption ? 'is-active' : ''
        button.addEventListener('click', () => { activeOption = optionId; pendingSubstitutionGroup = ''; renderAll() })
        optionBar.append(button)
      })
      const add = document.createElement('button'); add.type = 'button'; add.textContent = '+ Nova opção'; add.className = 'add-option'
      add.addEventListener('click', () => { activeOption = `option-${Date.now()}`; pendingSubstitutionGroup = ''; renderAll() })
      optionBar.append(add)
    }
    const updateTotals = () => {
      const totals = { kcal: 0, protein: 0, carbs: 0, fat: 0 }
      const visible = [...selections.values()].filter((item) => item.optionId === optionIds()[0])
      const primary = visible.filter((item, index) => visible.findIndex((candidate) => candidate.choiceGroupId === item.choiceGroupId) === index)
      primary.forEach((item) => {
        const factor = item.quantityGrams / item.serving
        totals.kcal += item.kcal * factor
        totals.protein += item.protein * factor
        totals.carbs += item.carbs * factor
        totals.fat += item.fat * factor
      })
      builder.querySelector('[data-total-kcal]').textContent = `${format(totals.kcal)} kcal`
      builder.querySelector('[data-total-protein]').textContent = `${format(totals.protein)} g`
      builder.querySelector('[data-total-carbs]').textContent = `${format(totals.carbs)} g`
      builder.querySelector('[data-total-fat]').textContent = `${format(totals.fat)} g`
      const currentCount = [...selections.values()].filter((item) => item.optionId === activeOption).length
      builder.querySelector('[data-meal-count]').textContent = `${currentCount} ${currentCount === 1 ? 'item' : 'itens'}`
      empty.hidden = currentCount > 0
      hidden.value = JSON.stringify([...selections.values()].map(({ foodId, quantityGrams, optionId, choiceGroupId }) => ({ foodId, quantityGrams, optionId, choiceGroupId })))
    }
    const renderItem = (item) => {
      if (item.optionId !== activeOption) return
      const row = document.createElement('article')
      row.className = 'meal-basket-item'
      row.dataset.selectedFood = item.key
      const identity = document.createElement('span')
      const name = document.createElement('strong')
      const details = document.createElement('small')
      name.textContent = item.name
      details.textContent = item.unitGrams ? `${format(item.kcal * item.unitGrams / item.serving)} kcal por ${item.unitLabel}` : `${item.kcal} kcal por ${item.serving} g`
      identity.append(name, details)
      const alternatives = [...selections.values()].filter((candidate) => candidate.optionId === item.optionId && candidate.choiceGroupId === item.choiceGroupId)
      if (alternatives.indexOf(item) > 0) { const or = document.createElement('b'); or.className = 'meal-or'; or.textContent = 'OU'; identity.prepend(or) }
      const substitute = document.createElement('button'); substitute.type = 'button'; substitute.className = 'meal-substitute'; substitute.textContent = '+ Substituição'
      substitute.addEventListener('click', () => { pendingSubstitutionGroup = item.choiceGroupId; builder.querySelectorAll('.meal-substitute').forEach((button) => button.classList.remove('is-active')); substitute.classList.add('is-active'); search?.focus() })
      identity.append(substitute)
      const quantity = document.createElement('label')
      const quantityInput = document.createElement('input')
      quantityInput.type = 'number'; quantityInput.min = '1'; quantityInput.max = item.unitGrams ? '100' : '5000'; quantityInput.step = item.unitGrams ? '1' : '1'; quantityInput.value = String(item.unitGrams ? Number((item.quantityGrams / item.unitGrams).toFixed(1)) : item.quantityGrams); quantityInput.setAttribute('aria-label', `Quantidade de ${item.name} em ${item.unitLabel || 'gramas'}`)
      const unit = document.createElement('span'); unit.textContent = item.unitGrams ? 'un' : 'g'
      quantity.append(quantityInput, unit)
      const remove = document.createElement('button')
      remove.type = 'button'; remove.textContent = '×'; remove.setAttribute('aria-label', `Remover ${item.name}`)
      quantityInput.addEventListener('input', () => { item.quantityGrams = Math.max(1, number(quantityInput.value)) * (item.unitGrams || 1); updateTotals() })
      remove.addEventListener('click', () => { selections.delete(item.key); renderAll() })
      row.append(identity, quantity, remove)
      basket.append(row)
    }
    const renderAll = () => {
      basket.replaceChildren()
      ;[...selections.values()].filter((item) => item.optionId === activeOption).forEach(renderItem)
      builder.querySelectorAll('[data-add-food]').forEach((button) => { button.disabled = false })
      renderOptions(); updateTotals()
    }
    const resetBuilder = () => {
      selections.clear(); basket.replaceChildren(); builder.reset(); mealIdInput.value = ''; activeOption = 'option-1'; pendingSubstitutionGroup = ''; sequence = 1
      builder.querySelectorAll('[data-add-food]').forEach((button) => { button.disabled = false; button.hidden = false })
      renderAll()
    }
    const selectFood = (button, quantityGrams, structure = {}) => {
      const wholeEgg = button.dataset.foodName.toLocaleLowerCase('pt-BR').includes('ovo') && (button.dataset.foodName.toLocaleLowerCase('pt-BR').includes('inteiro') || button.dataset.foodName.toLocaleLowerCase('pt-BR').includes('galinha, cozido'))
      const serving = number(button.dataset.serving)
      const resolvedQuantity = quantityGrams ?? (wholeEgg ? 50 : serving)
      const optionId = structure.optionId || activeOption
      const choiceGroupId = structure.choiceGroupId || pendingSubstitutionGroup || `group-${Date.now()}-${sequence}`
      const key = `${optionId}:${choiceGroupId}:${button.dataset.foodId}:${sequence++}`
      const item = { key, foodId: button.dataset.foodId, name: button.dataset.foodName, quantityGrams: resolvedQuantity, serving, kcal: number(button.dataset.kcal), protein: number(button.dataset.protein), carbs: number(button.dataset.carbs), fat: number(button.dataset.fat), fiber: number(button.dataset.fiber), unitGrams: wholeEgg ? 50 : 0, unitLabel: wholeEgg ? 'ovo' : '', optionId, choiceGroupId }
      selections.set(key, item); pendingSubstitutionGroup = ''; activeOption = optionId; renderAll()
    }
    builder.querySelectorAll('[data-add-food]').forEach((button) => {
      button.addEventListener('click', () => selectFood(button))
    })
    const dialogId = builder.closest('dialog')?.id
    document.querySelectorAll(`[data-dialog-open="${dialogId}"][data-new-meal]`).forEach((button) => button.addEventListener('click', resetBuilder))
    document.querySelectorAll(`[data-dialog-open="${dialogId}"][data-edit-meal]`).forEach((button) => button.addEventListener('click', () => {
      resetBuilder()
      mealIdInput.value = button.dataset.mealId || ''
      builder.elements.name.value = button.dataset.mealName || ''
      builder.elements.scheduledTime.value = button.dataset.mealTime || ''
      builder.elements.notes.value = button.dataset.mealNotes || ''
      const savedItems = JSON.parse(button.dataset.mealFoods || '[]')
      savedItems.forEach((selection) => {
        const foodButton = builder.querySelector(`[data-add-food][data-food-id="${selection.foodId}"]`)
        if (foodButton) selectFood(foodButton, number(selection.quantityGrams), selection)
      })
    }))
    search?.addEventListener('input', () => {
      const term = search.value.trim()
      builder.querySelectorAll('[data-add-food]').forEach((button) => { button.hidden = !matchesSearch(button.dataset.foodName, term) })
    })
    builder.addEventListener('submit', (event) => {
      updateTotals()
      if (!selections.size) {
        event.preventDefault()
        const submit = builder.querySelector('[type="submit"]')
        if (submit) { submit.disabled = false; submit.textContent = submit.dataset.originalLabel || 'Salvar refeição' }
        search?.focus()
      }
    })
    renderAll()
  })
  document.querySelectorAll('.meal-row-actions form').forEach((form) => {
    form.addEventListener('submit', (event) => {
      if (!window.confirm('Excluir esta refeição?')) {
        event.preventDefault()
        const submit = form.querySelector('[type="submit"]')
        if (submit) { submit.disabled = false; submit.textContent = submit.dataset.originalLabel || 'Excluir' }
      }
    })
  })

  const patientSource = document.querySelector('#new-plan select[name="patientId"]')
  if (patientSource) {
    document.querySelectorAll('.plan-dialog').forEach((planDialog) => {
      const planId = planDialog.id.replace('plan-', '')
      const title = planDialog.querySelector('.dialog-header h2')?.textContent?.trim() || 'Plano alimentar'
      const footer = planDialog.querySelector('.dialog-footer')
      const reuse = document.createElement('button')
      reuse.type = 'button'; reuse.className = 'button button-secondary'; reuse.textContent = '⧉ Reaproveitar plano'
      reuse.addEventListener('click', () => {
        const dialog = document.createElement('dialog'); dialog.className = 'app-dialog reuse-plan-dialog'
        const today = new Date(); const end = new Date(today); end.setDate(end.getDate() + 30)
        dialog.innerHTML = `<form method="post" action="/diets/${planId}/duplicate"><header class="dialog-header"><div><p class="eyebrow">MODELO REUTILIZÁVEL</p><h2>Copiar planejamento</h2></div><button class="dialog-close" type="button">×</button></header><div class="dialog-body"><p class="reuse-explanation">Todas as refeições, opções, substituições e orientações serão copiadas. O plano original não será alterado.</p><div class="form-grid"><label class="form-field form-span-2"><span>Novo paciente</span><select name="patientId" required>${patientSource.innerHTML}</select></label><label class="form-field form-span-2"><span>Título da nova cópia</span><input name="title" required value="${title.replaceAll('&', '&amp;').replaceAll('"', '&quot;')}"></label><label class="form-field"><span>Início</span><input name="startsOn" type="date" required value="${today.toISOString().slice(0, 10)}"></label><label class="form-field"><span>Término</span><input name="endsOn" type="date" required value="${end.toISOString().slice(0, 10)}"></label></div></div><footer class="dialog-footer"><button class="button button-secondary" type="button" data-cancel>Cancelar</button><button class="button button-primary" type="submit">Criar cópia editável</button></footer></form>`
        document.body.append(dialog)
        const close = () => { dialog.close(); dialog.remove() }
        dialog.querySelector('.dialog-close')?.addEventListener('click', close)
        dialog.querySelector('[data-cancel]')?.addEventListener('click', close)
        dialog.addEventListener('cancel', (event) => { event.preventDefault(); close() })
        dialog.showModal()
      })
      footer?.prepend(reuse)
    })
  }

  const appointmentForm = document.querySelector('#new-appointment form')
  if (appointmentForm) {
    const dateInput = appointmentForm.elements.date
    const timeInput = appointmentForm.elements.time
    const duration = appointmentForm.elements.durationMinutes
    const mode = appointmentForm.elements.mode
    dateInput.min = new Date().toISOString().slice(0, 10)
    const oldType = appointmentForm.elements.type
    const typeSelect = document.createElement('select'); typeSelect.name = 'type'; typeSelect.required = true
    ;['Primeira consulta', 'Retorno', 'Avaliação', 'Consulta de acompanhamento'].forEach((label) => { const option = document.createElement('option'); option.value = label; option.textContent = label; if (label === oldType.value) option.selected = true; typeSelect.append(option) })
    oldType.replaceWith(typeSelect)
    const onlineField = document.createElement('label'); onlineField.className = 'form-field form-span-2'; onlineField.hidden = true; onlineField.innerHTML = '<span>Link da consulta online</span><input name="onlineLink" type="url" placeholder="https://meet.google.com/..."><small>Será incluído no lembrete do WhatsApp.</small>'
    const reminderField = document.createElement('label'); reminderField.className = 'form-field'; reminderField.innerHTML = '<span>Lembrete</span><span class="appointment-check"><input name="reminderEnabled" type="checkbox" checked> WhatsApp</span>'
    const reminderHours = document.createElement('label'); reminderHours.className = 'form-field'; reminderHours.innerHTML = '<span>Antecedência</span><select name="reminderHours"><option value="2">2 horas antes</option><option value="24" selected>1 dia antes</option><option value="48">2 dias antes</option><option value="168">1 semana antes</option></select>'
    const recurrence = document.createElement('label'); recurrence.className = 'form-field'; recurrence.innerHTML = '<span>Repetição</span><select name="recurrence"><option value="none">Não repetir</option><option value="weekly">Semanal</option><option value="biweekly">Quinzenal</option><option value="monthly">Mensal</option></select>'
    const count = document.createElement('label'); count.className = 'form-field'; count.hidden = true; count.innerHTML = '<span>Quantidade de consultas</span><input name="recurrenceCount" type="number" min="2" max="12" value="4">'
    appointmentForm.querySelector('.form-grid')?.append(onlineField, reminderField, reminderHours, recurrence, count)
    mode.addEventListener('change', () => { onlineField.hidden = mode.value !== 'online' })
    recurrence.querySelector('select').addEventListener('change', (event) => { count.hidden = event.target.value === 'none' })
    const slots = document.createElement('div'); slots.className = 'available-slots form-span-2'; slots.innerHTML = '<small>Selecione a data para ver os horários livres.</small>'
    timeInput.closest('label')?.after(slots)
    const loadSlots = async () => {
      if (!dateInput.value) return
      slots.innerHTML = '<small>Carregando horários...</small>'
      try {
        const response = await fetch(`/api/appointments/availability?date=${encodeURIComponent(dateInput.value)}&duration=${duration.value}`)
        const data = await response.json(); slots.replaceChildren()
        if (!data.slots.length) { slots.innerHTML = '<small>Nenhum horário livre para essa data.</small>'; return }
        const label = document.createElement('small'); label.textContent = 'Horários disponíveis'; slots.append(label)
        data.slots.forEach((slot) => { const button = document.createElement('button'); button.type = 'button'; button.textContent = slot; button.addEventListener('click', () => { timeInput.value = slot; slots.querySelectorAll('button').forEach((item) => item.classList.toggle('is-selected', item === button)) }); slots.append(button) })
      } catch { slots.innerHTML = '<small>Não foi possível consultar os horários.</small>' }
    }
    dateInput.addEventListener('change', loadSlots); duration.addEventListener('change', loadSlots)
  }
  document.querySelectorAll('.agenda-list article .row-actions').forEach((actions) => {
    const id = actions.getAttribute('action')?.match(/appointments\/([^/]+)\/status/)?.[1]
    if (!id) return
    const link = document.createElement('a'); link.className = 'whatsapp-reminder'; link.href = `/appointments/${id}/whatsapp`; link.target = '_blank'; link.rel = 'noopener'; link.textContent = 'WhatsApp'; actions.append(link)
  })
  const agendaList = document.querySelector('.agenda-list')
  if (agendaList) {
    const articles = [...agendaList.querySelectorAll(':scope > article')]
    const toolbar = document.createElement('section'); toolbar.className = 'agenda-toolbar'
    toolbar.innerHTML = '<label><span>⌕</span><input type="search" placeholder="Buscar paciente ou consulta..."></label><select data-agenda-status><option value="active">Próximas e ativas</option><option value="all">Todos os status</option><option value="scheduled">Agendadas</option><option value="confirmed">Confirmadas</option><option value="completed">Concluídas</option><option value="cancelled">Canceladas/faltas</option></select><select data-agenda-mode><option value="all">Todas as modalidades</option><option value="Presencial">Presencial</option><option value="Online">Online</option></select><small data-agenda-results></small>'
    agendaList.before(toolbar)
    const parseDate = (text) => { const [day, month, year] = text.split('/').map(Number); return new Date(year, month - 1, day) }
    const today = new Date(); today.setHours(0, 0, 0, 0)
    let nextFound = false
    articles.forEach((article) => {
      const statusNode = article.querySelector('.operation-status'); const status = [...statusNode.classList].find((name) => ['scheduled','confirmed','completed','cancelled','no_show'].includes(name)) || 'scheduled'
      const dateText = article.querySelector('time small')?.textContent.trim() || ''; const date = parseDate(dateText)
      article.dataset.agendaStatus = status; article.dataset.agendaDate = dateText; article.dataset.agendaMode = article.querySelector('div p')?.textContent.includes('Online') ? 'Online' : 'Presencial'
      if (!nextFound && date >= today && !['completed','cancelled','no_show'].includes(status)) { article.classList.add('is-next-appointment'); nextFound = true }
      const select = article.querySelector('.row-actions select'); const apply = article.querySelector('.row-actions button')
      if (select) {
        const current = document.createElement('option'); current.value = status; current.textContent = `Status atual: ${statusNode.textContent.trim()}`; current.selected = true; current.disabled = true; select.prepend(current); select.setAttribute('aria-label', `Ações para ${article.querySelector('div strong')?.textContent || 'consulta'}`)
      }
      if (apply) apply.textContent = 'Aplicar'
    })
    const groupHeadings = () => {
      agendaList.querySelectorAll('.agenda-day-heading').forEach((heading) => heading.remove())
      let previous = ''
      articles.forEach((article) => {
        if (article.hidden) return
        const dateText = article.dataset.agendaDate
        if (dateText === previous) return
        const date = parseDate(dateText); const difference = Math.round((date - today) / 86400000)
        const label = difference === 0 ? 'Hoje' : difference === 1 ? 'Amanhã' : date.toLocaleDateString('pt-BR', { weekday: 'long' })
        const heading = document.createElement('header'); heading.className = 'agenda-day-heading'; heading.innerHTML = `<strong>${label}</strong><span>${dateText}</span>`; article.before(heading); previous = dateText
      })
    }
    const filterAgenda = () => {
      const term = toolbar.querySelector('input').value; const statusFilter = toolbar.querySelector('[data-agenda-status]').value; const modeFilter = toolbar.querySelector('[data-agenda-mode]').value
      let visible = 0
      articles.forEach((article) => {
        const status = article.dataset.agendaStatus
        const statusMatches = statusFilter === 'all' || statusFilter === status || (statusFilter === 'active' && !['completed','cancelled','no_show'].includes(status)) || (statusFilter === 'cancelled' && ['cancelled','no_show'].includes(status))
        const show = matchesSearch(article.textContent, term) && statusMatches && (modeFilter === 'all' || article.dataset.agendaMode === modeFilter)
        article.hidden = !show; if (show) visible += 1
      })
      toolbar.querySelector('[data-agenda-results]').textContent = `${visible} ${visible === 1 ? 'consulta' : 'consultas'}`
      groupHeadings()
    }
    toolbar.querySelector('input').addEventListener('input', filterAgenda); toolbar.querySelectorAll('select').forEach((select) => select.addEventListener('change', filterAgenda)); filterAgenda()
  }
  document.querySelectorAll('.assessment-history').forEach((history) => {
    const rows = [...history.querySelectorAll('article')]
    if (!rows.length) return
    const controls = document.createElement('div'); controls.className = 'assessment-compare-controls'; controls.innerHTML = '<span><strong>Comparar avaliações</strong><small>Marque duas datas do histórico</small></span><button type="button">Comparar mais recente × anterior</button>'
    history.querySelector('header')?.after(controls)
    const panel = document.createElement('section'); panel.className = 'assessment-comparison'; panel.hidden = true; controls.after(panel)
    const numberFrom = (text) => { const match = text?.replace(',', '.').match(/-?\d+(?:\.\d+)?/); return match ? Number(match[0]) : null }
    const assessments = rows.map((row) => {
      const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.className = 'assessment-selector'; checkbox.setAttribute('aria-label', `Selecionar avaliação de ${row.querySelector('time')?.textContent}`); row.prepend(checkbox)
      const spans = row.querySelectorAll(':scope > span')
      return { row, checkbox, date: row.querySelector('time')?.textContent.trim() || '', timestamp: (() => { const [d, m, y] = (row.querySelector('time')?.textContent || '').split('/').map(Number); return new Date(y, m - 1, d).getTime() })(), weight: numberFrom(spans[0]?.querySelector('b')?.textContent), bmi: numberFrom(spans[1]?.querySelector('b')?.textContent), fat: numberFrom(spans[2]?.querySelector('b')?.textContent) }
    })
    const formatDelta = (value, suffix = '') => `${value > 0 ? '+' : ''}${value.toFixed(1).replace('.', ',')}${suffix}`
    const renderComparison = () => {
      const selected = assessments.filter((item) => item.checkbox.checked).sort((a, b) => a.timestamp - b.timestamp)
      if (selected.length !== 2) { panel.hidden = true; return }
      const [before, after] = selected; const metrics = [{ key: 'weight', label: 'Peso', suffix: ' kg' }, { key: 'bmi', label: 'IMC', suffix: '' }, { key: 'fat', label: 'Gordura corporal', suffix: '%' }, { key: 'fatMassKg', label: 'Massa gorda', suffix: ' kg' }, { key: 'leanMassKg', label: 'Massa magra', suffix: ' kg' }, { key: 'waterPercent', label: 'Água corporal', suffix: '%' }, { key: 'muscleMassKg', label: 'Massa muscular', suffix: ' kg' }, { key: 'waistCm', label: 'Cintura', suffix: ' cm' }, { key: 'hipCm', label: 'Quadril', suffix: ' cm' }]
      panel.replaceChildren(); panel.hidden = false
      const heading = document.createElement('header'); heading.innerHTML = `<span><small>AVALIAÇÃO ANTERIOR</small><strong>${before.date}</strong></span><b>→</b><span><small>AVALIAÇÃO MAIS NOVA</small><strong>${after.date}</strong></span>`; panel.append(heading)
      const grid = document.createElement('div'); grid.className = 'assessment-comparison-grid'
      metrics.filter(({ key }) => before[key] !== undefined || after[key] !== undefined).forEach(({ key, label, suffix }) => {
        const previous = before[key]; const current = after[key]; const card = document.createElement('article')
        if (previous === null || current === null) card.innerHTML = `<small>${label}</small><strong>Sem dados suficientes</strong>`
        else { const delta = current - previous; card.innerHTML = `<small>${label}</small><div><span>${String(previous).replace('.', ',')}${suffix}</span><b>→</b><span>${String(current).replace('.', ',')}${suffix}</span></div><strong class="${delta < 0 ? 'delta-down' : delta > 0 ? 'delta-up' : ''}">${formatDelta(delta, suffix)}</strong><progress max="${Math.max(previous, current, 1)}" value="${current}"></progress>` }
        grid.append(card)
      })
      panel.append(grid)
    }
    assessments.forEach((item) => item.checkbox.addEventListener('change', () => { const selected = assessments.filter((entry) => entry.checkbox.checked); if (selected.length > 2) selected[0].checkbox.checked = false; renderComparison() }))
    controls.querySelector('button').addEventListener('click', () => { assessments.forEach((item, index) => { item.checkbox.checked = index < 2 }); renderComparison() })
    const patientId = history.closest('.patient-dialog')?.id.replace('patient-', '')
    if (patientId) fetch(`/api/patients/${patientId}/assessments`).then((response) => response.json()).then(({ assessments: fullAssessments }) => {
      const labels = { weightKg: ['Peso', 'kg'], heightCm: ['Altura', 'cm'], bmi: ['IMC', ''], bodyFatPercent: ['Gordura corporal', '%'], fatMassKg: ['Massa gorda', 'kg'], leanMassKg: ['Massa magra', 'kg'], bodyDensity: ['Densidade corporal', ''], waterPercent: ['Água corporal', '%'], muscleMassKg: ['Massa muscular', 'kg'], boneMassKg: ['Massa óssea', 'kg'], waistCm: ['Cintura', 'cm'], hipCm: ['Quadril', 'cm'], armCm: ['Braço', 'cm'] }
      assessments.forEach((item) => {
        const isoDate = item.date.split('/').reverse().join('-'); const full = fullAssessments.find((assessment) => assessment.assessedOn === isoDate)
        if (!full) return
        Object.assign(item, { fatMassKg: full.fatMassKg, leanMassKg: full.leanMassKg, waterPercent: full.waterPercent, muscleMassKg: full.muscleMassKg, waistCm: full.waistCm, hipCm: full.hipCm })
        const detailsButton = document.createElement('button'); detailsButton.type = 'button'; detailsButton.className = 'assessment-details-button'; detailsButton.textContent = 'Ver ficha completa'
        detailsButton.addEventListener('click', () => {
          const dialog = document.createElement('dialog'); dialog.className = 'app-dialog assessment-details-dialog'
          const shell = document.createElement('div'); shell.className = 'patient-dialog-shell'; shell.innerHTML = `<header class="dialog-header"><div><p class="eyebrow">AVALIAÇÃO ARQUIVADA</p><h2>Ficha de ${item.date}</h2></div><button class="dialog-close" type="button">×</button></header><div class="dialog-body"><section class="archived-assessment-meta"><span><small>PROTOCOLO</small><strong></strong></span><span><small>VERSÃO</small><strong></strong></span></section><div class="archived-assessment-grid"></div><section class="archived-measures"><h3>Medidas e dobras</h3><div></div></section><section class="archived-notes"><h3>Observações da avaliação</h3><p></p></section></div><footer class="dialog-footer"><button class="button button-primary" type="button">Fechar</button></footer>`
          const meta = shell.querySelectorAll('.archived-assessment-meta strong'); meta[0].textContent = full.protocol || 'Não informado'; meta[1].textContent = full.protocolVersion || '—'
          const grid = shell.querySelector('.archived-assessment-grid')
          Object.entries(labels).forEach(([key, [label, unit]]) => { const value = full[key]; if (value === null || value === undefined) return; const card = document.createElement('span'); const small = document.createElement('small'); const strong = document.createElement('strong'); small.textContent = label; strong.textContent = `${Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}${unit ? ` ${unit}` : ''}`; card.append(small, strong); grid.append(card) })
          const measureGrid = shell.querySelector('.archived-measures div'); const measures = { ...(full.circumferences || {}), ...(full.skinfolds || {}) }
          Object.entries(measures).forEach(([name, value]) => { if (value === null || value === undefined) return; const span = document.createElement('span'); span.textContent = `${name.replaceAll('_', ' ')}: ${value} mm/cm`; measureGrid.append(span) })
          if (!measureGrid.children.length) shell.querySelector('.archived-measures').hidden = true
          shell.querySelector('.archived-notes p').textContent = full.notes || 'Nenhuma observação registrada.'
          dialog.append(shell); document.body.append(dialog); const close = () => { dialog.close(); dialog.remove() }; shell.querySelector('.dialog-close').addEventListener('click', close); shell.querySelector('footer button').addEventListener('click', close); dialog.addEventListener('cancel', (event) => { event.preventDefault(); close() }); dialog.showModal()
        })
        item.row.append(detailsButton)
      })
      renderComparison()
    }).catch(() => {})
  })
  const patientPortal = document.querySelector('.patient-app-live')
  if (patientPortal) {
    const openPatientDetails = (title, eyebrow, sections) => {
      const dialog = document.createElement('dialog'); dialog.className = 'app-dialog patient-portal-details'
      const shell = document.createElement('div'); shell.className = 'patient-dialog-shell'; shell.innerHTML = `<header class="dialog-header"><div><p class="eyebrow"></p><h2></h2></div><button class="dialog-close" type="button">×</button></header><div class="dialog-body"></div><footer class="dialog-footer"><button class="button button-primary" type="button">Fechar</button></footer>`
      shell.querySelector('.eyebrow').textContent = eyebrow; shell.querySelector('h2').textContent = title; const body = shell.querySelector('.dialog-body')
      sections.forEach(({ heading, content }) => { const section = document.createElement('section'); section.className = 'patient-detail-section'; const h3 = document.createElement('h3'); h3.textContent = heading; section.append(h3); if (typeof content === 'string') { const p = document.createElement('p'); p.textContent = content; section.append(p) } else section.append(content); body.append(section) })
      dialog.append(shell); document.body.append(dialog); const close = () => { dialog.close(); dialog.remove() }; shell.querySelector('.dialog-close').addEventListener('click', close); shell.querySelector('footer button').addEventListener('click', close); dialog.addEventListener('cancel', (event) => { event.preventDefault(); close() }); dialog.showModal()
    }
    const dietSubtitle = patientPortal.querySelector('.patient-section-head p:last-child')
    if (patientPortal.querySelector('.patient-meal-list') && dietSubtitle) dietSubtitle.textContent = dietSubtitle.textContent.split('·')[0].trim()
    const financeSection = [...patientPortal.querySelectorAll('.patient-account-section')].find((section) => section.querySelector(':scope > strong')?.textContent.trim() === 'Financeiro')
    if (financeSection) { financeSection.classList.add('patient-finance-private'); financeSection.querySelectorAll(':scope > div > span').forEach((span) => { span.textContent = 'Situação do acompanhamento' }) }
    fetch('/api/patient-app/details').then((response) => response.json()).then((details) => {
      const mealCards = patientPortal.querySelectorAll('.patient-meal-list > article')
      mealCards.forEach((card, index) => {
        const meal = details.plan?.meals[index]; if (!meal) return
        const button = document.createElement('button'); button.type = 'button'; button.className = 'patient-meal-details-button'; button.textContent = 'Ver alimentos e opções'
        button.addEventListener('click', () => {
          const optionIds = [...new Set(meal.items.map((item) => item.optionId || 'option-1'))]
          const options = document.createElement('div'); options.className = 'patient-food-options'
          if (!meal.items.length) { const p = document.createElement('p'); p.textContent = meal.description; options.append(p) }
          optionIds.forEach((optionId, optionIndex) => {
            const option = document.createElement('article'); const heading = document.createElement('strong'); heading.textContent = optionIds.length > 1 ? `Opção ${optionIndex + 1}` : 'Composição da refeição'; option.append(heading)
            const optionItems = meal.items.filter((item) => (item.optionId || 'option-1') === optionId); const groups = [...new Set(optionItems.map((item) => item.choiceGroupId || item.foodId))]
            groups.forEach((groupId) => { const group = document.createElement('div'); optionItems.filter((item) => (item.choiceGroupId || item.foodId) === groupId).forEach((item, itemIndex) => { if (itemIndex) { const or = document.createElement('b'); or.textContent = 'OU'; group.append(or) }; const span = document.createElement('span'); const quantity = item.displayQuantity && item.displayUnit ? `${item.displayQuantity} ${item.displayQuantity === 1 ? item.displayUnit : `${item.displayUnit}s`}` : `${item.quantityGrams} g`; span.textContent = `${quantity} — ${item.name}`; group.append(span) }); option.append(group) }); options.append(option)
          })
          const sections = [{ heading: 'O que consumir', content: options }]
          if (meal.notes) sections.push({ heading: 'Orientações e substituições', content: meal.notes })
          const macros = document.createElement('div'); macros.className = 'patient-friendly-macros'; [['Proteína', meal.proteinG, 'g'], ['Carboidratos', meal.carbsG, 'g'], ['Gorduras', meal.fatG, 'g'], ['Fibras', meal.fiberG, 'g']].forEach(([label, value, unit]) => { const span = document.createElement('span'); span.innerHTML = `<small>${label}</small><strong>${value} ${unit}</strong>`; macros.append(span) }); sections.push({ heading: 'Informações nutricionais da refeição', content: macros })
          openPatientDetails(`${meal.scheduledTime} · ${meal.name}`, 'DETALHES DA REFEIÇÃO', sections)
        })
        card.querySelector('form')?.before(button)
      })
      const evolutionInfo = patientPortal.querySelector('.evolution-grid')
      if (evolutionInfo && details.assessments?.length) {
        const history = document.createElement('section'); history.className = 'patient-evolution-history'; const heading = document.createElement('header'); heading.innerHTML = '<div><small>HISTÓRICO</small><strong>Minhas avaliações</strong></div><span>Toque para ver detalhes</span>'; history.append(heading)
        details.assessments.forEach((assessment, index) => {
          const row = document.createElement('button'); row.type = 'button'; row.innerHTML = `<time>${assessment.assessedOn.split('-').reverse().join('/')}</time><span><small>Peso</small><strong>${Number(assessment.weightKg).toLocaleString('pt-BR')} kg</strong></span><span><small>Gordura</small><strong>${assessment.bodyFatPercent === null ? '—' : `${Number(assessment.bodyFatPercent).toLocaleString('pt-BR')}%`}</strong></span><b>${index === 0 ? 'Mais recente' : 'Ver detalhes'} →</b>`
          row.addEventListener('click', () => { const values = document.createElement('div'); values.className = 'patient-assessment-details-grid'; const fields = [['Peso', assessment.weightKg, 'kg'], ['IMC', assessment.bmi, ''], ['Gordura corporal', assessment.bodyFatPercent, '%'], ['Massa gorda', assessment.fatMassKg, 'kg'], ['Massa magra', assessment.leanMassKg, 'kg'], ['Água corporal', assessment.waterPercent, '%'], ['Massa muscular', assessment.muscleMassKg, 'kg'], ['Cintura', assessment.waistCm, 'cm'], ['Quadril', assessment.hipCm, 'cm']]; fields.forEach(([label, value, unit]) => { if (value === null || value === undefined) return; const span = document.createElement('span'); const small = document.createElement('small'); const strong = document.createElement('strong'); small.textContent = label; strong.textContent = `${Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}${unit ? ` ${unit}` : ''}`; span.append(small, strong); values.append(span) }); openPatientDetails(`Avaliação de ${assessment.assessedOn.split('-').reverse().join('/')}`, 'MINHA EVOLUÇÃO', [{ heading: 'Resultados publicados', content: values }, { heading: 'Observações do nutricionista', content: assessment.notes || 'Nenhuma observação publicada.' }]) }); history.append(row)
        }); evolutionInfo.after(history)
      }
      if (financeSection) financeSection.querySelectorAll(':scope > div').forEach((row, index) => { const payment = details.payments?.[index]; if (!payment) return; row.querySelector('span').textContent = payment.plan; row.querySelector('small').textContent = `${payment.status === 'paid' ? 'Pagamento confirmado' : 'Situação pendente'} · vencimento ${payment.dueDate.split('-').reverse().join('/')}` })
    }).catch(() => {})
  }

  const patientShell = document.querySelector('[data-patient-theme]')
  const themeButton = document.querySelector('[data-theme-toggle]')
  const savedTheme = localStorage.getItem('patient-theme')
  if (patientShell && savedTheme === 'dark') patientShell.classList.add('is-dark')
  themeButton?.addEventListener('click', () => {
    const dark = patientShell?.classList.toggle('is-dark') ?? false
    localStorage.setItem('patient-theme', dark ? 'dark' : 'light')
  })
})()
