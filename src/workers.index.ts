import { createWorker } from '../../utils/QueueFactory'
import { notificationsQueue } from '../../components/jobs/queues/notifications'
// Import other queues

// Notification worker example
createWorker(notificationsQueue.name, async (job) => {
  const { productId } = job.data
  // Logic: Fetch product, trigger notification
  const product = await Product.findByPk(productId)
  if (product) {
    // From Feature 13: await notificationService.triggerNotification('lowStock', ...);
    console.log(`Alert sent for ${product.name}`)
  }
  return { alerted: true }
})

// Reporting worker
createWorker(reportingQueue.name, async (job) => {
  if (job.name === 'dailySalesReport') {
    // Aggregate sales, generate report, email/log
    const report = await AnalyticsService.getSalesReport({ from: 'yesterday' })
    // Stub: await sendEmail('report@ecom.com', 'Daily Report', JSON.stringify(report));
    return report
  }
  if (job.name === 'exportCSV') {
    // Generate CSV, save to uploads/ or S3, notify
    const csvPath = await generateCSV(job.data) // Custom fn
    return { fileUrl: `/uploads/${csvPath}` }
  }
})

// Maintenance worker
createWorker(maintenanceQueue.name, async (job) => {
  if (job.name === 'orderCleanup') {
    // Find unpaid orders >24h, update status='cancelled', restore stock
    const oldOrders = await Order.findAll({
      where: {
        status: 'pending',
        createdAt: { [Op.lt]: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    })
    for (const order of oldOrders) {
      await order.update({ status: 'cancelled' })
      // Restore stock via InventoryService
    }
    return { cleaned: oldOrders.length }
  }
  if (job.name === 'inventorySnapshot') {
    // Backup inventory to audit table or file
    const snapshot = await Inventory.findAll()
    // Save to DB or file
    return { snapshotCount: snapshot.length }
  }
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  await notificationsQueue.close()
  // Close others
  process.exit(0)
})
