export interface OrderType {
  id: number
  orderNumber: string
  customerName: string
  userId: number
  subtotal: number
  tax: number
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled'
  paymentStatus: 'unpaid' | 'paid' | 'refunded' | 'failed'
  shippingAddress: string
  notes?: string
}

export interface OrderCreate {
  customerName: string
  items: { productId: number; quantity: number }[]
  shippingAddress: string
  notes?: string
  userId: number
}

export interface OrderUpdate {
  userId: number
  notes?: string
  status?: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled'
  paymentStatus?: 'unpaid' | 'paid' | 'refunded' | 'failed'
}

export interface OrderFilter {
  status?: string
  dateFrom?: string
  dateTo?: string
  customerName?: string
  offset?: number
  limit?: number
}
