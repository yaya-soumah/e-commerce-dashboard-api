import { createQueue } from '../../utils/queueFactory'

export const notificationsQueue = createQueue('notifications')
export const reportingQueue = createQueue('reporting')
export const maintenanceQueue = createQueue('maintenance')
