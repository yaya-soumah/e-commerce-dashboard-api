import { User } from '../components/users/user.model'
import { Role } from '../components/roles/roles.models'
import { Permission } from '../components/permissions/permissions.models'
import { RolePermission } from '../components/roles/rolePermissions.models'
import { Category } from '../components/categories/category.model'
import { Product } from '../components/products/product.model'
import { ProductTag } from '../components/products/product.tags.model'
import { ProductImage } from '../components/products/productImage.model'
import { Tag } from '../components/tags/tag.model'
import { Inventory } from '../components/inventories/inventory.model'
import { InventoryHistory } from '../components/inventories/inventoryHistory.model'
import { Order } from '../components/orders/order.model'
import { OrderItem } from '../components/orders/orderItem.model'
import { Payment } from '../components/payments/payment.model'

export const models = [
  User,
  Role,
  Permission,
  RolePermission,
  Category,
  Product,
  ProductTag,
  ProductImage,
  Tag,
  Inventory,
  InventoryHistory,
  Order,
  OrderItem,
  Payment,
]

export {
  User,
  Role,
  Permission,
  RolePermission,
  Category,
  Product,
  ProductTag,
  ProductImage,
  Tag,
  Inventory,
  InventoryHistory,
  Order,
  OrderItem,
  Payment,
}
