import bcrypt from 'bcrypt'

export const parse = async (password: string) => await bcrypt.hash(password, 10)

export const compare = async (newPassword: string, hashedPassword: string) =>
  await bcrypt.compare(newPassword, hashedPassword)
