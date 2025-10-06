export interface OrderItemType {
  id: number
  orderId: number
  productId: number
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface OrderItemCreate {
  orderId: number
  productId: number
  quantity: number
}
