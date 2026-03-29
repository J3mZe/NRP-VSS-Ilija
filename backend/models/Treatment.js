'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Treatment extends Model {
        static associate(models) {
            Treatment.belongsTo(models.Hive, { foreignKey: 'hiveId', as: 'hive' });
        }
    }
    Treatment.init({
        treatment_type: DataTypes.STRING, // e.g., Oxalic acid
        date: {
            type: DataTypes.DATEONLY,
            defaultValue: DataTypes.NOW
        },
        notes: DataTypes.TEXT,
        hiveId: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'Treatment',
        tableName: 'Treatments',
        underscored: true,
    });
    return Treatment;
};
