// After existing audit hooks
import { Order, Product, Inventory } from '../../models'

import { NotificationService } from './notification.service'

export const RegisterHooks = () => {
  // On Order afterCreate
  Order.addHook('afterCreate', 'notifyNewOrder', async (order: Order) => {
    await NotificationService.triggerNotification(
      'newOrder',
      `New Order #${order.orderNumber}`,
      `Order placed by ${order.customerName}`,
      order.id,
    )
  })

  Inventory.addHook('afterUpdate', 'notifyLowStock', async (inventory: Inventory) => {
    const oldStock = inventory.previous().stock
    if (oldStock! > inventory.stockThreshold && inventory.stock <= inventory.stockThreshold) {
      const product = await Product.findByPk(inventory.productId)
      await NotificationService.triggerNotification(
        'lowStock',
        `Low Stock: ${product!.name}`,
        `Stock now ${inventory.stock}`,
        inventory.productId,
      )
    }
  })
}
