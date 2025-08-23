export const authFactory = (override?: any) => {
  return {
    email: 'test@example.com',
    password: 'Password123',
    ...override,
  }
}
