'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ecommerce_payments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      orderId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'ecommerce_orders',
          key: 'id',
        },
      },
      status: {
        type: Sequelize.ENUM('unpaid', 'paid', 'refunded', 'failed', 'pending'),
        defaultValue: 'unpaid',
      },
      method: {
        type: Sequelize.ENUM('cash', 'credit_card', 'bank_transfer', 'manual'),
        defaultValue: 'cash',
      },
      transactionId: {
        type: Sequelize.STRING,
      },
      paidAt: {
        type: Sequelize.DATE,
      },
      amount: {
        allowNull: false,
        type: Sequelize.DECIMAL(10, 2),
      },
      notes: {
        type: Sequelize.TEXT,
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
    await queryInterface.dropTable('ecommerce_payments')
  },
}
