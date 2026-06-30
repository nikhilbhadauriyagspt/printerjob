import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Application = sequelize.define('Application', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    jobId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    candidateId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('applied', 'reviewing', 'shortlisted', 'interview_scheduled', 'offered', 'hired', 'rejected'),
        defaultValue: 'applied'
    },
    resume: {
        type: DataTypes.STRING,
        allowNull: true // Candidate can use their profile resume or upload a new one
    },
    answers: {
        type: DataTypes.JSON, // For screening questions
        defaultValue: []
    },
    coverLetter: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    timestamps: true
});

export default Application;
