import { User } from '../components/users/user.model'
import { Role } from '../components/roles/roles.models'
import { Permission } from '../components/permissions/permissions.models'
import { RolePermission } from '../components/roles/rolePermissions.models'
import { Category } from '../components/categories/category.model'
import { Product } from '../components/products/models/product.model'
import { ProductTag } from '../components/products/models/product.tags.model'
import { ProductImage } from '../components/products/models/productImage.model'
import { Tag } from '../components/tags/tag.model'
import { Inventory } from '../components/products/models/inventory.model'

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
}
