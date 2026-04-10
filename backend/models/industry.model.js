import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Industry = sequelize.define('Industry', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    isApproved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    createdBy: {
        type: DataTypes.UUID, // Recruiter ID or Admin ID
        allowNull: true
    }
}, {
    timestamps: true
});

export default Industry;
