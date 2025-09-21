export type ProductDataType = {
  name: string
  description?: string
  price: number
  status: string
  stock: number
  sku?: string
  categoryId: number
  tags: string[]
  images: string[]
}
export type FilterData = {
  keyword?: string
  category?: string
  stock?: number
  status?: string
  priceMin?: number
  priceMax?: number
  limit?: number
  offset?: number
}
