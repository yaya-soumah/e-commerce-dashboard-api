import { AsyncLocalStorage } from 'async_hooks'

export interface AuditContext {
  userId: number
  ipAddress?: string
  userAgent?: string
}

export const auditStorage = new AsyncLocalStorage<AuditContext>()

export function runWithContext<T>(context: AuditContext, fn: () => Promise<T>): Promise<T> {
  return auditStorage.run(context, fn)
}
