import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const ActivityLog = sequelize.define('ActivityLog', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    companyId: {
        type: DataTypes.UUID,
        allowNull: true // Changed from false to true to support candidate logs
    },
    candidateId: {
        type: DataTypes.UUID,
        allowNull: true // Track events for candidates
    },
    action: {
        type: DataTypes.STRING,
        allowNull: false // e.g., 'PROFILE_UPDATE', 'LOGO_UPLOAD', 'LOGIN', 'REGISTER'
    },
    details: {
        type: DataTypes.TEXT,
        allowNull: true // e.g., 'Updated company description and logo'
    },
    ipAddress: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    timestamps: true,
    updatedAt: false // Sirf creation time chahiye
});

export default ActivityLog;
