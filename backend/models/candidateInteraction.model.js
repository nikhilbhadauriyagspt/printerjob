import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const CandidateInteraction = sequelize.define('CandidateInteraction', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    companyId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    candidateId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    rating: {
        type: DataTypes.INTEGER,
        defaultValue: 0 // 0 to 5 stars
    },
    folder: {
        type: DataTypes.STRING,
        defaultValue: 'General' // e.g., 'Shortlisted', 'Future Leads'
    },
    isContacted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    lastContactedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: true,
    indexes: [
        { unique: true, fields: ['companyId', 'candidateId'] }
    ]
});

export default CandidateInteraction;
