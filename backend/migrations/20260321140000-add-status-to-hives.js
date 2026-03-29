'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Hives', 'status', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'Aktivno'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Hives', 'status');
  }
};
