import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const OTP = sequelize.define('OTP', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    companyId: {
        type: DataTypes.UUID,
        allowNull: true // Changed to optional to support Candidate OTPs
    },
    candidateId: {
        type: DataTypes.UUID,
        allowNull: true // For Candidate Registration
    },
    emailOTP: {
        type: DataTypes.STRING,
        allowNull: true
    },
    phoneOTP: {
        type: DataTypes.STRING,
        allowNull: true
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    timestamps: true
});

export default OTP;
