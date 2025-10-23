'use strict'

const TYPES = ['lowStock', 'newOrder', 'failedPayment', 'reportReady', 'roleChange']
const METHODS = ['email', 'inApp', 'logOnly']

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // NotificationSettings
    await queryInterface.createTable('ecommerce_notification_settings', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'ecommerce_users', key: 'id' },
        onDelete: 'CASCADE',
      },
      type: {
        type: Sequelize.ENUM(...TYPES),
        allowNull: false,
      },
      method: {
        type: Sequelize.ENUM(...METHODS),
        allowNull: false,
        defaultValue: 'inApp',
      },
      enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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

    // Unique per user/type
    await queryInterface.addConstraint('ecommerce_notification_settings', {
      fields: ['userId', 'type'],
      type: 'unique',
      name: 'unique_user_type',
    })

    // NotificationLogs
    await queryInterface.createTable('ecommerce_Notification_logs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'ecommerce_users', key: 'id' },
        onDelete: 'SET NULL', // Preserve if user deleted
      },
      type: {
        type: Sequelize.ENUM(...TYPES),
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      body: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      eventRef: {
        type: Sequelize.INTEGER, // e.g., orderId, productId
        allowNull: true,
      },
      read: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      readAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    })

    // Dedup index
    await queryInterface.addIndex('ecommerce_Notification_logs', ['userId', 'type', 'eventRef'])
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ecommerce_Notification_logs')
    await queryInterface.dropTable('ecommerce_notification_settings')
  },
}
