import { User } from '../components/users/user.model'
import { Role } from '../components/roles/roles.models'
import { Permission } from '../components/permissions/permissions.models'
import { RolePermission } from '../components/roles/rolePermissions.models'
import { Category } from '../components/categories/category.model'
import { Product } from '../components/products/product.model'
import { ProductTag } from '../components/products/product.tags.model'
import { ProductImage } from '../components/products/productImage.model'
import { Tag } from '../components/tags/tag.model'

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
]

export { User, Role, Permission, RolePermission, Category, Product, ProductTag, ProductImage, Tag }
