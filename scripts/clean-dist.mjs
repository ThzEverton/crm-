import { rm } from 'node:fs/promises'
import path from 'node:path'

const workspace = path.resolve(process.cwd())
const target = path.resolve(workspace, 'dist')

if (path.dirname(target) !== workspace || path.basename(target) !== 'dist') {
  throw new Error(`Destino de limpeza inválido: ${target}`)
}

await rm(target, { recursive: true, force: true })
