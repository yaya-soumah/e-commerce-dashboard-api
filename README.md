# E-Commerce Dashboard API

A full-featured **E-commerce Management API** built with **Node.js**, **TypeScript**, **Express**, and **Sequelize (PostgreSQL/MySQL)**. It provides comprehensive backend services for managing users, products, orders, payments, analytics, and more. Designed for admin dashboards, analytics, and store automation.

This backend provides modular, enterprise-level features such as product management, order processing, reporting, and configurable business logic through an admin-controlled settings system.

## Tech Stack

- **Backend:** Node.js, Express.js
- **Language:** TypeScript
- **ORM:** Sequelize (with Sequelize CLI + Migrations)
- **Database:** PostgreSQL
- **Authentication:** JWT (access & refresh tokens)
- **File Uploads:** Multer
- **Caching / Queue:** Redis
- **Background Jobs**: BullMQ/Bull
- **Testing:** Jest
- **Validation:** Zod
- **Architecture:** Modular & Component-based (repository → service → controller)

## Project Structure

```
src/
├── components/
│   ├── analytics/
│   ├── audit.logs/
│   ├── auth/
│   ├── categories/
│   ├── dashboard/
│   ├── inventories/
│   ├── jobs/
│   ├── notifications/
│   ├── orders/
│   ├── payments/
│   ├── permissions/
│   ├── products/
│   ├── roles/
│   ├── settings/
│   ├── tags/
│   └── users/
├── config/
├── middleware/
├── models/
├── migrations/
├── routes/
├── utils/
├── app.ts/
└── index.ts
```

## Features

### Core Modules

- **Authentication & Authorization**: JWT tokens (access/refresh via HttpOnly cookies), bcrypt hashing, roles (admin, staff, analyst) with granular permissions (e.g., product:create).
- **User Management**: CRUD operations integrated with roles.
- **Product Management**: CRUD with attributes (name, slug, description, price, status, stock via Inventory, SKU, category, tags, images). Filtering/pagination by name/category/price/status/tags.
- **Inventory Management**: Normalized stock tracking, history logs, restock/decrement endpoints with reasons. Prevents negative stock.
- **Category & Tag System**: Nested categories (tree view), flat tags. Auto-slug generation. Block deletion if assigned.
- **Order Management**: CRUD with line items (OrderItem), auto orderNumber (e.g., ORD-YYYYMMDD-XXX), stock deduction, 10% tax, status transitions. Soft cancel restores stock. Filtering by status/date/customer.
- **Payment Tracking**: 1:1 with orders, statuses/methods. Syncs order payment status. Prevents duplicates.
- **Sales Analytics**: Aggregates (revenue, AOV, top products), charts by period, status/payment breakdowns. Filters by date/category. Last 30 days default.

### Advanced Features

- **Admin Dashboard Metrics**: Real-time KPIs (orders today, revenue, low stock, etc.) with date ranges.
- **Audit Logs**: Auto-tracking of CRUD/actions with changes diff, IP/user agent. Filtering by user/action/date.
- **File Uploads**: Secure image uploads for products (max 5 via existing ProductImage model) and user avatars. Local storage (S3-ready abstraction), MIME/size validation.
- **Notification Settings & Alerts**: User-configurable alerts (low stock, new orders) via in-app logs (email stubbed). Triggers from hooks/services.
- **Background Jobs**: BullMQ + Redis for tasks (e.g., low stock alerts, daily reports, auto-cancel orders). Manual triggers, retries, scheduling.
- **Settings & Configurations**: Dynamic admin configs (tax rate, thresholds, cron times) with validation, in-memory caching, and immediate effects.

## Getting Started

### 1. Clone the Repository & Install

```bash
git clone https://github.com/yaya-soumah/ecommerce-dashboard-api.git
cd ecommerce-dashboard-api
npm install
```

### 2. Configure Environment

Create a `.env` file:

```env
NODE_ENV=development

PORT=8080
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ecommerce_db
DB_USER=postgres
DB_PASS=yourpassword

TEST_DB_STORAGE=:memory:

ACCESS_TOKEN_EXPIRES_IN = 1d
REFRESH_TOKEN_EXPIRES_IN = 7d

ACCESS_TOKEN_SECRET=your-secret-code
REFRESH_TOKEN_SECRET="your-refresh-secret-code"

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_URL=redis://localhost:6379

AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=my-ecommerce-bucket

UPLOAD_DIR=uploads
UPLOAD_BASE_URL=your_s3_url

MAX_IMAGES_PER_PRODUCT=5
NOTIFICATION_DEFAULTS='lowStock,newOrder'
```

### 3. Run Migrations & Seeders

```bash
npx sequelize-cli db:migrate
```

### 4. Start the Server

**Development**:

```bash
npm run dev
```

**Production**:

```bash
npm run build && npm start
```

**Test**:

```js
npm run test
```

Server runs at **http://localhost:8080/api/v1**

## Linting & Formatting

```bash
npm run lint
npm run format
```

## Author

**Yaya Soumah** – [LinkedIn](https:www.linkedin.com/in/yaya-soumah-11b75b1b9) | [GitHub](https://github.com/yaya-soumah)

## License

MIT License

## Future Enhancements

- Admin UI for settings management
- Multi-store (tenant-based) configuration
- Webhooks for external integrations
- Metrics dashboard using Prometheus