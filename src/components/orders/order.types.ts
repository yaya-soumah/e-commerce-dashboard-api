export interface OrderType {
  id: number
  orderNumber: number
  customerName: number
  subTotal: number
  tax: number
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled'
  paymentStatus: 'unpaid' | 'paid' | 'refunded' | 'failed'
  shippingAddress: string
  notes?: string
}
