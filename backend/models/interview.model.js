import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Interview = sequelize.define('Interview', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    applicationId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    jobId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    candidateId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    companyId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    interviewDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    interviewTime: {
        type: DataTypes.STRING,
        allowNull: false
    },
    mode: {
        type: DataTypes.ENUM('online', 'offline'),
        defaultValue: 'online'
    },
    locationOrLink: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('scheduled', 'completed', 'cancelled'),
        defaultValue: 'scheduled'
    },
    feedback: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    timestamps: true
});

export default Interview;
