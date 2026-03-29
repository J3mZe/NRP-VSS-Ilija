'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class HealthRecord extends Model {
        static associate(models) {
            HealthRecord.belongsTo(models.Hive, { foreignKey: 'hiveId', as: 'hive' });
        }
    }
    HealthRecord.init({
        inspection_date: {
            type: DataTypes.DATEONLY,
            defaultValue: DataTypes.NOW
        },
        disease_name: DataTypes.STRING, // e.g., Varroa, AFB
        status: {
            type: DataTypes.STRING,
            defaultValue: 'healthy'
        },
        notes: DataTypes.TEXT,
        hiveId: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'HealthRecord',
        tableName: 'HealthRecords', // camelCase in JS, PascalCase in DB usually, but consistent with others
        underscored: true,
    });
    return HealthRecord;
};
