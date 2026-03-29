'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'first_name', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('Users', 'last_name', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('Users', 'phone', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('Users', 'hive_type', { type: Sequelize.STRING, defaultValue: 'AŽ Panj' });
    await queryInterface.addColumn('Users', 'ai_alarms', { type: Sequelize.BOOLEAN, defaultValue: true });
    await queryInterface.addColumn('Users', 'disease_detection', { type: Sequelize.BOOLEAN, defaultValue: false });
    await queryInterface.addColumn('Users', 'email_notifications', { type: Sequelize.BOOLEAN, defaultValue: true });
    await queryInterface.addColumn('Users', 'sms_alerts', { type: Sequelize.BOOLEAN, defaultValue: false });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'first_name');
    await queryInterface.removeColumn('Users', 'last_name');
    await queryInterface.removeColumn('Users', 'phone');
    await queryInterface.removeColumn('Users', 'hive_type');
    await queryInterface.removeColumn('Users', 'ai_alarms');
    await queryInterface.removeColumn('Users', 'disease_detection');
    await queryInterface.removeColumn('Users', 'email_notifications');
    await queryInterface.removeColumn('Users', 'sms_alerts');
  }
};
