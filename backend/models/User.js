'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate(models) {
            User.hasMany(models.Hive, { foreignKey: 'userId', as: 'hives' });
            User.hasMany(models.Task, { foreignKey: 'userId', as: 'tasks' });
            User.hasMany(models.Notification, { foreignKey: 'userId', as: 'notifications' });
        }
    }
    User.init({
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password_hash: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role: {
            type: DataTypes.STRING,
            defaultValue: 'beekeeper'
        },
        first_name: DataTypes.STRING,
        last_name: DataTypes.STRING,
        phone: DataTypes.STRING,
        hive_type: { type: DataTypes.STRING, defaultValue: 'AŽ Panj' },
        ai_alarms: { type: DataTypes.BOOLEAN, defaultValue: true },
        disease_detection: { type: DataTypes.BOOLEAN, defaultValue: false },
        email_notifications: { type: DataTypes.BOOLEAN, defaultValue: true },
        sms_alerts: { type: DataTypes.BOOLEAN, defaultValue: false },
        ai_language: { type: DataTypes.STRING, defaultValue: 'slovenščina' },
        avatar_url: DataTypes.TEXT,
        is_verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        verification_token: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'User',
        tableName: 'Users',
        underscored: true,
    });
    return User;
};
