import sequelize, { setupModels } from '../config/database.config'

setupModels(sequelize)

beforeAll(async () => {
  await sequelize.sync({ force: true }) // Only for test
})

afterAll(async () => {
  await sequelize.close()
})
