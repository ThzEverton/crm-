(() => {
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
  patientSearch?.addEventListener('input', (event) => {
    const term = event.target.value.trim().toLocaleLowerCase('pt-BR')
    document.querySelectorAll('[data-patient-name]').forEach((card) => {
      card.hidden = !card.dataset.patientName.includes(term)
    })
  })

  const foodSearch = document.querySelector('[data-food-search]')
  foodSearch?.addEventListener('input', (event) => {
    const term = event.target.value.trim().toLocaleLowerCase('pt-BR')
    document.querySelectorAll('[data-food-name]').forEach((row) => {
      row.hidden = !row.dataset.foodName.includes(term)
    })
  })

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
    const selections = new Map()
    const basket = builder.querySelector('[data-meal-basket]')
    const empty = builder.querySelector('[data-meal-empty]')
    const hidden = builder.querySelector('[data-meal-items]')
    const search = builder.querySelector('[data-meal-food-search]')
    const number = (value) => Number.parseFloat(value || '0')
    const format = (value) => Number(value.toFixed(1)).toLocaleString('pt-BR')
    const updateTotals = () => {
      const totals = { kcal: 0, protein: 0, carbs: 0, fat: 0 }
      selections.forEach((item) => {
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
      builder.querySelector('[data-meal-count]').textContent = `${selections.size} ${selections.size === 1 ? 'item' : 'itens'}`
      empty.hidden = selections.size > 0
      hidden.value = JSON.stringify([...selections.values()].map(({ foodId, quantityGrams }) => ({ foodId, quantityGrams })))
    }
    const renderItem = (item) => {
      const row = document.createElement('article')
      row.className = 'meal-basket-item'
      row.dataset.selectedFood = item.foodId
      const identity = document.createElement('span')
      const name = document.createElement('strong')
      const details = document.createElement('small')
      name.textContent = item.name
      details.textContent = `${item.kcal} kcal por ${item.serving} g`
      identity.append(name, details)
      const quantity = document.createElement('label')
      const quantityInput = document.createElement('input')
      quantityInput.type = 'number'; quantityInput.min = '1'; quantityInput.max = '5000'; quantityInput.step = '1'; quantityInput.value = String(item.quantityGrams); quantityInput.setAttribute('aria-label', `Quantidade de ${item.name} em gramas`)
      const unit = document.createElement('span'); unit.textContent = 'g'
      quantity.append(quantityInput, unit)
      const remove = document.createElement('button')
      remove.type = 'button'; remove.textContent = '×'; remove.setAttribute('aria-label', `Remover ${item.name}`)
      quantityInput.addEventListener('input', () => { item.quantityGrams = Math.max(1, number(quantityInput.value)); updateTotals() })
      remove.addEventListener('click', () => { selections.delete(item.foodId); row.remove(); builder.querySelector(`[data-add-food][data-food-id="${item.foodId}"]`)?.removeAttribute('disabled'); updateTotals() })
      row.append(identity, quantity, remove)
      basket.append(row)
    }
    builder.querySelectorAll('[data-add-food]').forEach((button) => {
      button.addEventListener('click', () => {
        if (selections.has(button.dataset.foodId)) return
        const item = { foodId: button.dataset.foodId, name: button.dataset.foodName, quantityGrams: number(button.dataset.serving), serving: number(button.dataset.serving), kcal: number(button.dataset.kcal), protein: number(button.dataset.protein), carbs: number(button.dataset.carbs), fat: number(button.dataset.fat), fiber: number(button.dataset.fiber) }
        selections.set(item.foodId, item); button.disabled = true; renderItem(item); updateTotals()
      })
    })
    search?.addEventListener('input', () => {
      const term = search.value.trim().toLocaleLowerCase('pt-BR')
      builder.querySelectorAll('[data-add-food]').forEach((button) => { button.hidden = !button.dataset.foodName.toLocaleLowerCase('pt-BR').includes(term) })
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
    updateTotals()
  })

  const patientShell = document.querySelector('[data-patient-theme]')
  const themeButton = document.querySelector('[data-theme-toggle]')
  const savedTheme = localStorage.getItem('patient-theme')
  if (patientShell && savedTheme === 'dark') patientShell.classList.add('is-dark')
  themeButton?.addEventListener('click', () => {
    const dark = patientShell?.classList.toggle('is-dark') ?? false
    localStorage.setItem('patient-theme', dark ? 'dark' : 'light')
  })
})()
