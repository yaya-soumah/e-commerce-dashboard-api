'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('ecommerce_inventories', 'stockThreshold', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 10,
    })
    //backfill existing with defaultValue
    await queryInterface.sequelize.query(
      'UPDATE ecommerce_inventories SET stockThreshold=10 WHERE stockThreshold IS NULL',
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('ecommerce_inventories', 'stockThreshold')
  },
}
