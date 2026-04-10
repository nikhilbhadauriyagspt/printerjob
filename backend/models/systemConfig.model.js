import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const SystemConfig = sequelize.define('SystemConfig', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    // Support Settings
    isSupportEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    defaultFreeMonths: {
        type: DataTypes.INTEGER,
        defaultValue: 6
    },
    // Payment Gateway Settings
    activeGateway: {
        type: DataTypes.ENUM('razorpay', 'paypal', 'both', 'none'),
        defaultValue: 'none'
    },
    paymentMode: {
        type: DataTypes.ENUM('sandbox', 'live'),
        defaultValue: 'sandbox'
    },
    currency: {
        type: DataTypes.STRING,
        defaultValue: 'INR'
    },
    // Razorpay Keys
    razorpayKeyId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    razorpaySecret: {
        type: DataTypes.STRING,
        allowNull: true
    },
    // PayPal Keys
    paypalClientId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    paypalSecret: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    timestamps: true
});

export default SystemConfig;
