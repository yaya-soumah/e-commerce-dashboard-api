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
export type ProductUpdateDataType = {
  description?: string
  price?: number
  status?: string
  stock?: number
  sku?: string
  categoryId?: number
  tags?: string[]
  images?: string[]
}
export type FilterData = {
  name?: string
  categoryId?: number
  priceMin?: number
  priceMax?: number
  status?: string
  tags?: string[]
  limit?: number
  offset?: number
}
