import { auditStorage } from '../../utils/requestContext.util'
import { AuditLog, Inventory, Order, Payment, Product, Role, User } from '../../models'

// Sensitive fields to exclude
const SENSITIVE_FIELDS = ['password', 'accessToken', 'refreshToken']

// Helper to build changes
function buildChanges(oldAttrs?: any, newAttrs?: any, isStatusChange = false): any {
  if (!oldAttrs && !newAttrs) return null
  if (!oldAttrs) return { created: newAttrs } // Create: full new
  if (!newAttrs) return { deleted: oldAttrs } // Delete: full old

  const changes: Record<string, [any, any]> = {}
  for (const [key, value] of Object.entries(newAttrs)) {
    if (SENSITIVE_FIELDS.includes(key)) continue
    if (JSON.stringify(oldAttrs[key]) !== JSON.stringify(value)) {
      changes[key] = [oldAttrs[key], value]
    }
  }
  // Detect status-change
  if (isStatusChange || changes.status || changes.paymentStatus) {
    return { ...changes, statusChange: true }
  }
  return changes
}

// Generic hook factory
function addAuditHooks(model: any) {
  const resource = model.name.toLowerCase()

  model.addHook('afterCreate', 'auditCreate', async (instance: any) => {
    const store = auditStorage.getStore()
    if (!store) return

    const changes = buildChanges(undefined, instance.get())
    await AuditLog.create({
      userId: store.userId,
      resource,
      action: 'create',
      recordId: instance.id,
      changes: JSON.stringify(changes).length > 5000 ? { truncated: true } : changes, // Truncate large
      ipAddress: store.ipAddress,
      userAgent: store.userAgent,
    })
  })

  model.addHook('afterUpdate', 'auditUpdate', async (instance: any, { oldAttrs }: any) => {
    const store = auditStorage.getStore()
    if (!store) return

    const changes = buildChanges(oldAttrs, instance.get())
    const action = changes?.statusChange ? 'status-change' : 'update'
    await AuditLog.create({
      userId: store.userId,
      resource,
      action,
      recordId: instance.id,
      changes: JSON.stringify(changes).length > 5000 ? { truncated: true } : changes,
      ipAddress: store.ipAddress,
      userAgent: store.userAgent,
    })
  })

  model.addHook('afterDestroy', 'auditDelete', async (instance: any) => {
    const store = auditStorage.getStore()
    if (!store) return

    const oldAttrs = instance.get() // Pre-destroy snapshot
    await AuditLog.create({
      userId: store.userId,
      resource,
      action: 'delete',
      recordId: instance.id,
      changes: JSON.stringify(oldAttrs).length > 5000 ? { truncated: true } : oldAttrs,
      ipAddress: store.ipAddress,
      userAgent: store.userAgent,
    })
  })
}

// Apply to key models (after import)
addAuditHooks(User)
addAuditHooks(Product)
addAuditHooks(Inventory)
addAuditHooks(Order)
addAuditHooks(Payment)
addAuditHooks(Role) // For role changes
