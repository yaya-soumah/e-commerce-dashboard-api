export interface ProductDataType {
  id?: number
  name: string
  description?: string
  price: number
  stock?: number
  lowStockLevel?: number
  status: string
  sku?: string
  slug?: string
  categoryId: number
  tags?: string[]
  images?: string[]
}

export interface FilterData {
  keyword?: string
  category?: string
  stock?: number
  status?: string
  priceMin?: number
  priceMax?: number
  limit?: number
  offset?: number
}
