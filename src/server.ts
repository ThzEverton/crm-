import { createServer } from 'node:http'
import { app } from './app.js'
import { disconnectDatabase } from './config/database.js'
import { env } from './config/env.js'
import { logger } from './utils/logger.js'

const server = createServer(app)
let shuttingDown = false

server.listen(env.PORT, env.HOST, () => {
  logger.info({ host: env.HOST, port: env.PORT }, 'CRM Nutricionista iniciado')
})

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  if (shuttingDown) return
  shuttingDown = true
  logger.info({ signal }, 'Encerramento gracioso iniciado')

  const forceExit = setTimeout(() => {
    logger.fatal('Tempo de encerramento excedido')
    process.exit(1)
  }, 10_000)
  forceExit.unref()

  server.close(async (error) => {
    if (error) logger.error({ err: error }, 'Erro ao fechar servidor HTTP')
    await disconnectDatabase()
    clearTimeout(forceExit)
    process.exit(error ? 1 : 0)
  })
}

process.on('SIGTERM', () => void shutdown('SIGTERM'))
process.on('SIGINT', () => void shutdown('SIGINT'))

process.on('unhandledRejection', (reason) => {
  logger.error({ err: reason }, 'Promise rejeitada sem tratamento')
})

process.on('uncaughtException', (error) => {
  logger.fatal({ err: error }, 'Exceção não capturada')
  void shutdown('SIGTERM')
})
