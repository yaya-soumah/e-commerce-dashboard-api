'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ecommerce_settings', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      key: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      value: {
        type: Sequelize.JSONB,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM('string', 'number', 'boolean', 'time'),
        allowNull: false,
      },
      category: {
        type: Sequelize.STRING(50),
        allowNull: true, // e.g., 'orders', 'files'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    })
    // Seed defaults
    const defaults = [
      {
        key: 'currency',
        value: { value: 'USD' },
        type: 'string',
        category: 'general',
        description: 'ISO currency code',
      },
      {
        key: 'taxRate',
        value: { value: 0.1 },
        type: 'number',
        category: 'orders',
        description: 'Tax rate as decimal',
      },
      {
        key: 'lowStockThreshold',
        value: { value: 10 },
        type: 'number',
        category: 'inventory',
        description: 'Default stock threshold',
      },
      {
        key: 'dailyReportTime',
        value: { value: '09:00' },
        type: 'time',
        category: 'reporting',
        description: 'Daily report cron time (HH:mm)',
      },
      {
        key: 'publicRegistration',
        value: { value: true },
        type: 'boolean',
        category: 'auth',
        description: 'Allow public signups',
      },
      {
        key: 'maxUploadSizeMB',
        value: { value: 2 },
        type: 'number',
        category: 'files',
        description: 'Max file upload size',
      },
      {
        key: 'orderAutoCancelHours',
        value: { value: 24 },
        type: 'number',
        category: 'orders',
        description: 'Hours for auto-cancel unpaid orders',
      },
    ]
    const seedValues = defaults.map((item) => ({
      ...item,
      value: JSON.stringify(item.value),
    }))
    await queryInterface.bulkInsert('ecommerce_settings', seedValues)
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ecommerce_settings')
  },
}
