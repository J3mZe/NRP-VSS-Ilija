'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('HiveReserveRecords', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      hiveId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Hives',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      estimatedBees: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 30000
      },
      reserveStartGrams: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      reserveGainGrams: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      reserveLossGrams: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      reserveEndGrams: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      weatherScore: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      forageScore: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('HiveReserveRecords');
  }
};
