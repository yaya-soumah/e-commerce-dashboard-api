import {
  Role,
  Permission,
  User,
  Product,
  Inventory,
  Category,
  Tag,
  ProductImage,
  InventoryHistory,
  Order,
  OrderItem,
  Payment,
} from '../models'
import { parse } from '../utils/bcrypt.util'
import { generateOrderNumber } from '../utils/orderNumber'
import { generateSlug } from '../utils/slag'

const defaultPermissions = [
  { key: 'user:view', description: 'View users' },
  { key: 'user:create', description: 'Create users' },
  { key: 'user:update', description: 'Update users' },
  { key: 'user:delete', description: 'Delete users' },
  { key: 'product:create', description: 'Create products' },
  { key: 'product:update', description: 'Update products' },
  { key: 'product:delete', description: 'Delete products' },
  { key: 'product:view', description: 'View products' },
  { key: 'inventory:view', description: 'View inventories' },
  { key: 'inventory:create', description: 'Create inventories' },
  { key: 'inventory:update', description: 'Update inventories' },
  { key: 'inventory:delete', description: 'Delete inventories' },
  { key: 'category:view', description: 'View categories' },
  { key: 'category:create', description: 'Create categories' },
  { key: 'category:update', description: 'Update categories' },
  { key: 'category:delete', description: 'Delete categories' },
  { key: 'tag:view', description: 'View tags' },
  { key: 'tag:create', description: 'Create tags' },
  { key: 'tag:update', description: 'Update tags' },
  { key: 'tag:delete', description: 'Delete tags' },
  { key: 'order:create', description: 'Create orders' },
  { key: 'order:update', description: 'Update orders' },
  { key: 'order:view', description: 'View orders' },
  { key: 'order:delete', description: 'Delete orders' },
  { key: 'payment:create', description: 'Create payments' },
  { key: 'payment:update', description: 'Update payments' },
  { key: 'payment:view', description: 'View payments' },
  { key: 'payment:delete', description: 'Delete payments' },
  { key: 'analytic:view', description: 'View analytics' },
  { key: 'analytic:update', description: 'Update analytics' },
  { key: 'analytic:delete', description: 'Delete analytics' },
  { key: 'dashboard:view', description: 'View admin dashboard' },
]

const defaultRoles = [
  {
    name: 'admin',
    permissions: [
      'user:view',
      'user:create',
      'user:update',
      'user:delete',
      'product:create',
      'product:update',
      'product:delete',
      'product:view',
      'inventory:view',
      'inventory:create',
      'inventory:update',
      'inventory:delete',
      'category:view',
      'category:create',
      'category:update',
      'category:delete',
      'tag:view',
      'tag:create',
      'tag:update',
      'tag:delete',
      'order:create',
      'order:update',
      'order:view',
      'order:delete',
      'payment:create',
      'payment:update',
      'payment:view',
      'payment:delete',
      'analytic:view',
      'analytic:update',
      'analytic:delete',
      'dashboard:view',
    ],
  },
  {
    name: 'staff',
    permissions: [
      'product:create',
      'product:update',
      'product:delete',
      'product:view',
      'inventory:view',
      'inventory:update',
      'category:update',
      'tag:update',
      'order:create',
      'order:update',
      'order:view',
      'payment:update',
      'payment:view',
    ],
  },
  {
    name: 'analyst',
    permissions: [
      'product:view',
      'inventory:view',
      'category:view',
      'tag:view',
      'order:view',
      'payment:view',
      'analytic:view',
      'dashboard:view',
    ],
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
    lowStockLevel: 4,
    stockThreshold: 5,
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
    lowStockLevel: 10,
    stockThreshold: 5,
    sku: 'TSB-001',
    categoryId: 3,
    tags: ['sale'],
    images: ['https://example.com/images/tshirt1.jpg'],
  },
]
const defaultOrders = [
  {
    customerName: 'Alex',
    items: [
      { productName: 'Smartphones X', productId: 1, quantity: 1 },
      { productName: 'T-Shirt Basic', productId: 2, quantity: 2 },
    ],
    shippingAddress: '#144 ChengYang, China',
    notes: 'Gift wrap please',
  },
  {
    customerName: 'Mr. Wang',
    items: [{ productName: 'Smartphones X', productId: 1, quantity: 1 }],
    shippingAddress: '#456 JiaoZhou, China',
    notes: '',
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
    const [adminUser] = await User.findOrCreate({
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

    //seed product and Inventory

    for (const prod of defaultProducts) {
      const { images, tags, stock, lowStockLevel, ...rest } = prod
      const [product] = await Product.findOrCreate({
        where: { name: rest.name },
        defaults: rest,
      })
      await Inventory.create({
        productId: product.id,
        stock: stock || 0,
        lowStockLevel,
        lastRestockedAt: new Date(),
      })

      //Seed inventory history
      await InventoryHistory.findOrCreate({
        where: {
          productId: product.id,
        },
        defaults: {
          productId: product.id,
          change: prod.stock,
          reason: 'Initial stock',
          userId: adminUser.id,
        },
      })
      if (tags) {
        const ownTags = tagList.filter((item) => tags.includes(item.name))
        product.$set('tags', ownTags)
      }
      const imageList = images.map((img) => ({ url: img, productId: product.id }))

      if (imageList.length !== 0) {
        imageList.forEach(
          async (item) =>
            await ProductImage.findOrCreate({ where: item.productId, defaults: item }),
        )
      }
      // const relatedImages = await ProductImage.bulkCreate(imageList)
      // await product.$set('images', relatedImages)

      product.save()
    }
    //Seed orders
    for (const orderData of defaultOrders) {
      const [order] = await Order.findOrCreate({
        where: { customerName: orderData.customerName },
        defaults: {
          customerName: orderData.customerName,
          subtotal: 0,
          tax: 0,
          total: 0,
          shippingAddress: orderData.shippingAddress,
          notes: orderData.notes,
          userId: adminUser.id,
          status: 'pending',
          paymentStatus: 'unpaid',
          orderNumber: generateOrderNumber(),
        },
      })
      for (const itemData of orderData.items) {
        const product = await Product.findOne({ where: { name: itemData.productName } })
        await OrderItem.findOrCreate({
          where: {
            orderId: order.id,
          },
          defaults: {
            orderId: order.id,
            productId: product?.id,
            quantity: itemData.quantity,
            unitPrice: product!.price,
            totalPrice: product!.price * itemData.quantity,
          },
        })
      }
      //Recalculate totals
      const items = await OrderItem.findAll({
        where: { orderId: order.id },
      })
      const subtotal = Number(items.reduce((sum, item) => sum + item.totalPrice, 0))
      const tax = subtotal * 0.1
      const total = subtotal + tax
      await order.update({ subtotal, tax, total })
    }
    //Seed payments
    const [order] = await Order.findAll({ limit: 1 })
    if (order) {
      await Payment.create({
        orderId: order.id,
        status: 'paid',
        method: 'credit_card',
        paidAt: new Date(),
        amount: order.total,
        notes: 'Payment received via credit card',
      })
    }
  } catch (error) {
    console.error('Failed to seed database', error)
  }
}
