export const parseQuery = async (query: any) => {
  let { page, limit, order_by, sort_by, ...search } = query || {}
  page = Math.max(Number(query?.page) || 1, 1)
  limit = Math.max(Number(query?.limit) || 10, 1)

  const offset = (page - 1) * limit

  return { page, limit, offset, order_by, sort_by, search }
}
