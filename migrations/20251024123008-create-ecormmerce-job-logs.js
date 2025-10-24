'use strict'
/** @type {import('sequelize-cli').Migration} */
const JobStatusValues = ['waiting', 'active', 'completed', 'failed', 'delayed']
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ecormmerce_jobLogs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      jobName: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      queueName: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      data: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM(...JobStatusValues),
        allowNull: false,
        defaultValue: 'waiting',
      },
      attempts: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      result: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      error: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      processedAt: {
        type: Sequelize.DATE,
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

    // Index for queries
    await queryInterface.addIndex('ecormmerce_jobLogs', {
      fields: ['jobName', 'status'],
      type: 'unique',
      name: 'unique_jobName_status',
    })
    await queryInterface.addIndex('ecormmerce_jobLogs', ['createdAt'])
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('ecormmerce_jobLogs')
  },
}
