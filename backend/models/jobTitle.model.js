import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const JobTitle = sequelize.define('JobTitle', {
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
        type: DataTypes.UUID,
        allowNull: true
    }
}, {
    timestamps: true
});

export default JobTitle;
