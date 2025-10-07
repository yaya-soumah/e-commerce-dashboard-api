'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ecommerce_orders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      orderNumber: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      customerName: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ecommerce_users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      subtotal: {
        allowNull: false,
        type: Sequelize.DECIMAL(10, 2),
      },
      tax: {
        allowNull: false,
        type: Sequelize.DECIMAL(10, 2),
      },
      total: {
        allowNull: false,
        type: Sequelize.DECIMAL(10, 2),
      },
      status: {
        type: Sequelize.ENUM('pending', 'processing', 'shipped', 'completed', 'cancelled'),
      },
      paymentStatus: {
        type: Sequelize.ENUM('unpaid', 'paid', 'refunded', 'failed'),
      },
      shippingAddress: {
        allowNull: false,
        type: Sequelize.TEXT,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    })
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('orders')
  },
}
