import { Role, Permission, User, Product, Category, Tag, ProductImage } from '../models'
import { parse } from '../utils/bcrypt.util'
import { generateSlug } from '../utils/slag'

const defaultPermissions = [
  { key: 'user:create', description: 'Create users' },
  { key: 'user:update', description: 'Update users' },
  { key: 'user:delete', description: 'Delete users' },
  { key: 'user:view', description: 'View users' },
  { key: 'product:create', description: 'Create products' },
  { key: 'product:update', description: 'Update products' },
  { key: 'product:delete', description: 'Delete products' },
  { key: 'product:view', description: 'view products' },
  { key: 'order:create', description: 'Create orders' },
  { key: 'order:update', description: 'Update orders' },
  { key: 'order:delete', description: 'Delete orders' },
  { key: 'order:view', description: 'view orders' },
  { key: 'dashboard:read', description: 'Read dashboard data' },
]

const defaultRoles = [
  {
    name: 'admin',
    permissions: [
      'user:create',
      'user:update',
      'user:delete',
      'product:create',
      'product:update',
      'product:delete',
      'product:view',
      'order:create',
      'order:update',
      'order:view',
      'dashboard:read',
    ],
  },
  {
    name: 'staff',
    permissions: [
      'product:create',
      'product:update',
      'product:delete',
      'product:view',
      'order:create',
      'order:update',
      'order:view',
    ],
  },
  {
    name: 'analyst',
    permissions: ['product:view', 'order:view', 'dashboard:read'],
  },
]

const defaultCategories = [
  {
    name: 'Electronics',
    description: 'Electronic devices and gadgets',
    slug: generateSlug('Electronics'),
    parentId: null,
  },
  {
    name: 'Smartphones',
    description: 'Mobile phones and accessories',
    slug: generateSlug('Smartphones'),
    parentId: 1,
  },
  {
    name: 'Clothing',
    description: 'Apparel and accessories',
    slug: generateSlug('Clothing'),
    parentId: null,
  },
]

const defaultTags = [
  { name: 'new', slug: generateSlug('new') },
  { name: 'sale', slug: generateSlug('sale') },
  { name: 'popular', slug: generateSlug('popular') },
]

const defaultProducts = [
  {
    name: 'Smartphones X',
    description: 'Latest smartphone with advanced features',
    price: 699.99,
    status: 'active',
    stock: 100,
    sku: 'SPX-001',
    categoryId: 1,
    tags: ['new', 'popular'],
    images: ['https://example.com/images/smartphone1.jpg'],
  },
  {
    name: 'T-Shirt Basic',
    description: 'Comfortable cotton t-shirt',
    price: 19.99,
    slug: generateSlug('T-Shirt Basic'),
    status: 'active',
    stock: 200,
    sku: 'TSB-001',
    categoryId: 3,
    tags: ['sale'],
    images: ['https://example.com/images/tshirt1.jpg'],
  },
]

export const seedDatabase = async () => {
  const permissions: Permission[] = []
  try {
    //seed permissions
    for (const perm of defaultPermissions) {
      const [newPermission] = await Permission.findOrCreate({
        where: { key: perm.key },
        defaults: perm,
      })
      permissions.push(newPermission)
    }

    // seed roles and associate permissions
    for (const roleData of defaultRoles) {
      const [role] = await Role.findOrCreate({
        where: { name: roleData.name },
      })
      roleData.permissions = roleData.permissions.map(
        (key) => permissions.find((perm) => perm.key === key)?.id,
      )
      if (roleData.permissions.length > 0) {
        role.$set('permissions', roleData.permissions)
        role.save()
      }
    }
    //seed default admin user
    const [adminRole] = await Role.findOrCreate({
      where: { name: 'admin' },
    })
    await User.findOrCreate({
      where: { email: 'admin@example.com' },
      defaults: {
        name: 'Admin User',
        email: 'admin@example.com',
        password: await parse('Password123'),
        roleId: adminRole.id,
      },
    })

    //seed default staff user
    const [staffRole] = await Role.findOrCreate({
      where: { name: 'staff' },
    })
    await User.findOrCreate({
      where: { name: 'staff' },
      defaults: {
        name: 'staff',
        email: 'staff1@example.com',
        password: await parse('Password123'),
        roleId: staffRole.id,
      },
    })

    //seed categories
    const categoriesList: Category[] = []
    for (const cat of defaultCategories) {
      const [category] = await Category.findOrCreate({
        where: { name: cat.name },
        defaults: cat,
      })
      categoriesList.push(category)
      if (cat.parentId) {
        await category.update({ parentId: cat.parentId })
      }
    }

    //seed tags
    const tagList: Tag[] = []
    for (const t of defaultTags) {
      const [tag] = await Tag.findOrCreate({
        where: { name: t.name },
        defaults: t,
      })
      tagList.push(tag)
    }

    //seed product

    for (const prod of defaultProducts) {
      const { images, tags, ...rest } = prod
      const [product] = await Product.findOrCreate({
        where: { name: Product.name },
        defaults: rest,
      })

      if (tags) {
        const ownTags = tagList.filter((item) => tags.includes(item.name))
        product.$set('tags', ownTags)
      }
      const imageList = images.map((img) => ({ url: img, productId: product.id }))

      const relatedImages = await ProductImage.bulkCreate(imageList)
      product.$set('images', relatedImages)

      product.save()
    }
  } catch (error) {
    console.error('Failed to seed database', error)
  }
}
