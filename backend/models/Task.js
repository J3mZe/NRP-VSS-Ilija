'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Task extends Model {
        static associate(models) {
            Task.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
            Task.belongsTo(models.Hive, { foreignKey: 'hiveId', as: 'hive' });
        }
    }
    Task.init({
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: DataTypes.TEXT,
        due_date: DataTypes.DATE,
        status: {
            type: DataTypes.STRING,
            defaultValue: 'pending'
        },
        hiveId: {
            type: DataTypes.INTEGER,
            allowNull: true // Global tasks don't need a hive
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'Task',
        tableName: 'Tasks',
        underscored: true,
    });
    return Task;
};
