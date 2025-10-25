# e-commerce-dashboard-api

Run: npm run worker (separate terminal).
Step 12: Integration with Existing Features

Permissions: Seed job:trigger, job:view for admin/analyst.
Hooks/Services: Update Inventory hook: await notificationsQueue.add('lowStockAlert', { productId: inventory.productId }).
App Init (app.ts or index.ts): Schedule jobs on startup.
typescript// After sequelize.sync
const reportingQueue = createQueue('reporting');
reportingQueue.add('dailySalesReport', {}, { repeat: { cron: '0 9 \* \* _' } }); // 9AM daily
maintenanceQueue.add('orderCleanup', {}, { repeat: { cron: '0 0 _ \* \*' } }); // Midnight

Notifications Retrofit: In NotificationService.trigger, if 'email', queue 'sendEmailJob' instead.
Audit: Log job adds/completions to AuditLog (manual in service/worker).

Step 14: Verification & Example Response

Seeds: Add sample JobLogs (e.g., completed exportCSV on Oct 24, 2025).
Run: npm run queue:dev (app + worker). Trigger POST /jobs/exportCSV/run { "data": { "type": "orders" } } → Job queued, worker processes, log updated.
GET /jobs/exportCSV/status:
json{
"status": "success",
"data": {
"logs": [
{
"id": 1,
"jobName": "exportCSV",
"status": "completed",
"result": { "fileUrl": "/uploads/orders-20251024.csv" },
"processedAt": "2025-10-24T10:00:00Z"
}
]
},
"meta": { "total": 1 }
}

Errors: 403 unauthorized, 400 invalid job, 429 rate-limit (add middleware if needed).
Edge: Redis down → BullMQ throws, catch in service → 503; duplicate → Skip; long job → Concurrency default 1, configurable.
Perf: Redis ops <10ms; worker scales horizontally.

BullMQ ensures non-blocking tasks. Test with Redis, trigger lowStock via inventory update. Next: Refunds, gateway mocks, or exports? Let me know!
