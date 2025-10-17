export interface OrderItemType {
  id: number
  orderId: number
  productId: number
  quantity: number
  unitPrice: number
  totalPrice: number
  createdAt?: Date
  updatedAt?: Date
}

export interface OrderItemCreate {
  orderId: number
  productId: number
  quantity: number
}
