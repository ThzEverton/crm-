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
      if (!installPrompt) {
        const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent)
        window.alert(isIos ? 'No Safari, toque em Compartilhar e depois em “Adicionar à Tela de Início”.' : 'No menu do navegador, escolha “Instalar aplicativo” ou “Criar atalho” para colocar o CRM na área de trabalho.')
        return
      }
      installPrompt.prompt(); await installPrompt.userChoice; installPrompt = undefined
      installButtons.forEach((item) => { item.textContent = '✓ Aplicativo instalado'; item.disabled = true })
    })
  })
})()
