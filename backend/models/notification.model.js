import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Notification = sequelize.define('Notification', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    recipientId: {
        type: DataTypes.UUID, // Admin UUID or Company UUID
        allowNull: false
    },
    recipientType: {
        type: DataTypes.ENUM('admin', 'company', 'candidate'),
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    type: {
        type: DataTypes.STRING, // JOB_POSTED, JOB_APPROVED, JOB_REJECTED, etc.
        allowNull: false
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    relatedId: {
        type: DataTypes.UUID, // Job ID or Company ID
        allowNull: true
    }
}, {
    timestamps: true
});

export default Notification;
