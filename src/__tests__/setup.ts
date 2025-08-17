import sequelize, { setupModels } from '../config/database.config'
import { Role } from '../models'
import { parse } from '../utils/bcrypt.util'
setupModels(sequelize)

beforeAll(async () => {
  await sequelize.sync({ force: true }) // Only for test
  //create admin user
  const role = (await sequelize.models.Role.create({ name: 'admin' })) as Role
  await sequelize.models.User.create({
    name: 'admin',
    email: 'admin@example.com',
    password: await parse('Password123'),
    roleId: role.id,
  })
})

afterAll(async () => {
  await sequelize.close()
})
