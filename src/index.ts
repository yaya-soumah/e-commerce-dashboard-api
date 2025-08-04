import 'reflect-metadata'
import { config } from 'dotenv'

import logger from './config/logger'
import app from './app'

config()

const PORT = process.env.PORT || 8080

async function startServer() {
  try {
    logger.info('Database connected successfully')
    app.listen(PORT, () => {
      logger.info(`Server listening on http://localhost:${PORT}/api/v1/`)
    })
  } catch {
    logger.error('Failed to start')
  }
}
startServer()
