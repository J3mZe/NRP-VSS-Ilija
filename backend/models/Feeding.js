'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Feeding extends Model {
        static associate(models) {
            Feeding.belongsTo(models.Hive, { foreignKey: 'hiveId', as: 'hive' });
        }
    }
    Feeding.init({
        food_type: DataTypes.STRING, // e.g., Sugar syrup, Pollen patty
        amount: DataTypes.STRING, // e.g., '2L', '1kg'
        date: {
            type: DataTypes.DATEONLY,
            defaultValue: DataTypes.NOW
        },
        hiveId: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'Feeding',
        tableName: 'Feedings',
        underscored: true,
    });
    return Feeding;
};
