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

  const patientShell = document.querySelector('[data-patient-theme]')
  const themeButton = document.querySelector('[data-theme-toggle]')
  const savedTheme = localStorage.getItem('patient-theme')
  if (patientShell && savedTheme === 'dark') patientShell.classList.add('is-dark')
  themeButton?.addEventListener('click', () => {
    const dark = patientShell?.classList.toggle('is-dark') ?? false
    localStorage.setItem('patient-theme', dark ? 'dark' : 'light')
  })
})()
