import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Package = sequelize.define('Package', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    durationDays: {
        type: DataTypes.INTEGER,
        allowNull: false // e.g., 30, 365
    },
    jobLimit: {
        type: DataTypes.INTEGER,
        defaultValue: -1 // -1 means unlimited
    },
    tier: {
        type: DataTypes.INTEGER,
        defaultValue: 1, // 1: Basic, 2: Standard, 3: Premium, etc.
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('job_post', 'database_access'),
        defaultValue: 'job_post'
    },
    databaseCredits: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true
});

export default Package;
