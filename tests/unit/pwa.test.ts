import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

describe('PWA', () => {
  it('possui manifesto standalone com os dois tamanhos de ícone', async () => {
    const manifest = JSON.parse(await readFile(path.join(process.cwd(), 'public', 'manifest.webmanifest'), 'utf8'))
    expect(manifest.display).toBe('standalone')
    expect(manifest.icons.map((icon: { sizes: string }) => icon.sizes)).toEqual(['192x192', '512x512'])
  })

  it('não inclui páginas clínicas no cache público', async () => {
    const serviceWorker = await readFile(path.join(process.cwd(), 'public', 'service-worker.js'), 'utf8')
    expect(serviceWorker).not.toMatch(/['\"]\/patient-app['\"]/)
    expect(serviceWorker).not.toContain('/patients')
    expect(serviceWorker).toContain('/offline.html')
  })
})
