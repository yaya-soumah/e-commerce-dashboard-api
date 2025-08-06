import { Sequelize } from 'sequelize-typescript'
import { config } from 'dotenv'

import { models } from '../models/index'

config()

const env = process.env.NODE_ENV || 'development'

let sequelize: Sequelize

if (env === 'development') {
  sequelize = new Sequelize({
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? '5432'),
    dialect: 'postgres',
    models: [],
    logging: false,
  })
} else if (env === 'test') {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    models: [],
    logging: false,
  })
} else if (env === 'production') {
  sequelize = new Sequelize(process.env.DATABASE_URL!, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    models: [],
    logging: false,
  })
} else {
  throw new Error(`Unknown NODE_ENV: ${env}`)
}

export function setupModels(sequelizeInstance: Sequelize) {
  sequelizeInstance.addModels(models)
}

export default sequelize
