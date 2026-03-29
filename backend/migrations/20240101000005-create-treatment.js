'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Treatments', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            treatment_type: {
                type: Sequelize.STRING
            },
            date: {
                type: Sequelize.DATEONLY,
                defaultValue: Sequelize.NOW
            },
            notes: {
                type: Sequelize.TEXT
            },
            hive_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Hives',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('Treatments');
    }
};
