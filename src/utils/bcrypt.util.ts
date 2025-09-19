import bcrypt from 'bcrypt'

export const parse = async (password: string) => bcrypt.hash(password, 10)

export const compare = async (newPassword: string, hashedPassword: string) => {
  console.log('bcrypt-compare: ', newPassword, hashedPassword)
  return await bcrypt.compare(newPassword, hashedPassword)
}
