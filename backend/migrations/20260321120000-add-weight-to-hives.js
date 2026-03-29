'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Hives', 'weight', {
      type: Sequelize.FLOAT,
      allowNull: true,
      defaultValue: 0.0
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Hives', 'weight');
  }
};
