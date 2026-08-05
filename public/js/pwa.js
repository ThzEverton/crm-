(() => {
  let installPrompt
  const installButtons = document.querySelectorAll('[data-install]')
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('/service-worker.js'))
  }
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault(); installPrompt = event
    installButtons.forEach((button) => { button.hidden = false })
  })
  installButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      if (!installPrompt) return
      installPrompt.prompt(); await installPrompt.userChoice; installPrompt = undefined
      installButtons.forEach((item) => { item.hidden = true })
    })
  })
})()
