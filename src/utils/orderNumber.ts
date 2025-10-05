export const generateOrderNumber = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const seq = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')
  return `ORD-${date}-${seq}`
}
