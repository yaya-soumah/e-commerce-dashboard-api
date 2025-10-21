'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('ecommerce_product_images', 'filename', {
      type: Sequelize.STRING(500),
      allowNull: false,
      defaultValue: '',
    })

    await queryInterface.addColumn('ecommerce_product_images', 'path', {
      type: Sequelize.STRING(500),
      allowNull: false,
      defaultValue: '',
    })
    await queryInterface.addColumn('ecommerce_users', 'avatarFilename', {
      type: Sequelize.STRING(255),
      allowNull: true,
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('ecommerce_product_images', 'filename')
    await queryInterface.removeColumn('ecommerce_product_images', 'path')
    await queryInterface.removeColumn('ecommerce_users', 'avatarFilename')
  },
}
