'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Hive extends Model {
        static associate(models) {
            Hive.belongsTo(models.User, { foreignKey: 'userId', as: 'owner' });
            Hive.hasMany(models.Task, { foreignKey: 'hiveId', as: 'tasks' });
            Hive.hasMany(models.HealthRecord, { foreignKey: 'hiveId', as: 'healthRecords' });
            Hive.hasMany(models.Treatment, { foreignKey: 'hiveId', as: 'treatments' });
            Hive.hasMany(models.Feeding, { foreignKey: 'hiveId', as: 'feedings' });
            Hive.hasMany(models.HiveReserveRecord, { foreignKey: 'hiveId', as: 'reserveRecords' });
        }
    }
    Hive.init({
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        location: DataTypes.STRING,
        type: DataTypes.STRING, // e.g., LR, AŽ
        queen_age: DataTypes.INTEGER, // year of birth
        strength: DataTypes.INTEGER, // 1-10
        weight: DataTypes.FLOAT, // weight in kg
        status: {
            type: DataTypes.STRING,
            defaultValue: 'Aktivno'
        },
        notes: DataTypes.TEXT,
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'Hive',
        tableName: 'Hives',
        underscored: true,
    });
    return Hive;
};
