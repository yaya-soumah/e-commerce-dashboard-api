export interface PaymentFilter {
  status?: string
  method?: string
  dateFrom?: string
  dateTo?: string
  offset?: number
  limit?: number
}

export interface PaymentCreate {
  orderId: number
  status: 'unpaid' | 'paid' | 'refunded' | 'failed' | 'pending'
  method: 'cash' | 'credit_card' | 'bank_transfer' | 'manual'
  transactionId?: string
  paidAt: Date
  amount: number
  notes?: string
}
