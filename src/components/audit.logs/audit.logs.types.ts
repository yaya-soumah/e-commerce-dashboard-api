export const ACTION_VALUES = ['create', 'update', 'delete', 'status-change', 'restock'] as const

export type ActionType = (typeof ACTION_VALUES)[number]

export interface AuditType {
  id: number
  userId: number
  resource: string
  action: ActionType
  recordId: number
  changes: Record<string, any>
  ipAddress?: string
  userAgent?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface ListFilters {
  userId?: number
  action?: ActionType
  fromDate?: Date
  toDate?: Date
  offset?: number
  limit?: number
}

export interface LogActionPayload {
  resource: string
  action: ActionType
  recordId: number
  changes: Record<string, any>
  userId: number
  ipAddress?: string
  userAgent?: string
}
