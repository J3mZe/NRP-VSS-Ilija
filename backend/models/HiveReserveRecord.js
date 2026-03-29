'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class HiveReserveRecord extends Model {
        static associate(models) {
            HiveReserveRecord.belongsTo(models.Hive, {
                foreignKey: 'hiveId',
                as: 'hive',
                onDelete: 'CASCADE',
            });
        }
    }
    HiveReserveRecord.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        hiveId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Hives',
                key: 'id'
            }
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        estimatedBees: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 30000
        },
        reserveStartGrams: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        reserveGainGrams: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        reserveLossGrams: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        reserveEndGrams: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        weatherScore: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        forageScore: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'HiveReserveRecord',
        tableName: 'HiveReserveRecords',
        timestamps: true
    });
    return HiveReserveRecord;
};
