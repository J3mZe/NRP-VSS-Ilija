'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'ai_language', { type: Sequelize.STRING, defaultValue: 'slovenščina' });
    await queryInterface.addColumn('Users', 'avatar_url', { type: Sequelize.TEXT, allowNull: true });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'ai_language');
    await queryInterface.removeColumn('Users', 'avatar_url');
  }
};
