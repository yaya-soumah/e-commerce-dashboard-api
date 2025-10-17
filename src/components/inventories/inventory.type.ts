export type InventoryDataType = {
  id: number
  productId: number
  stock: number
  lowStockLevel?: number
  stockThreshold?: number
  lastRestockedAt?: Date
}

export interface InventoryFilter {
  productId?: number
  minStock?: number
  maxStock?: number
  offset?: number
  limit?: number
}

export interface HistoryFilterDataType {
  productId?: number
  userId?: number
  reason?: string
  offset?: number
  limit?: number
}
