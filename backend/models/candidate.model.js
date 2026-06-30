import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Candidate = sequelize.define('Candidate', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    fullName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    profilePhoto: {
        type: DataTypes.STRING,
        allowNull: true
    },
    resume: {
        type: DataTypes.STRING,
        allowNull: true
    },
    resumeText: {
        type: DataTypes.TEXT('long'),
        allowNull: true
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    headline: {
        type: DataTypes.STRING,
        allowNull: true
    },
    industry: {
        type: DataTypes.STRING,
        allowNull: true
    },
    designation: {
        type: DataTypes.STRING,
        allowNull: true
    },
    experienceLevel: {
        type: DataTypes.ENUM('fresher', 'experienced'),
        defaultValue: 'fresher'
    },
    experienceYears: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    experienceData: {
        type: DataTypes.JSON, // Array of {company, role, from, to, description, isCurrent}
        defaultValue: []
    },
    skills: {
        type: DataTypes.JSON, // Array of {name, level}
        defaultValue: []
    },
    educationData: {
        type: DataTypes.JSON, // Array of {school, degree, field, year}
        defaultValue: []
    },
    projectsData: {
        type: DataTypes.JSON, // Array of {title, description, link, duration, skills}
        defaultValue: []
    },
    certificationsData: {
        type: DataTypes.JSON, // Array of {name, organization, year, link}
        defaultValue: []
    },
    noticePeriod: {
        type: DataTypes.STRING,
        allowNull: true
    },
    currentSalary: {
        type: DataTypes.STRING,
        allowNull: true
    },
    expectedSalary: {
        type: DataTypes.STRING,
        allowNull: true
    },
    currentLocation: {
        type: DataTypes.STRING,
        allowNull: true
    },
    preferredLocations: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    relocation: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    jobPreferences: {
        type: DataTypes.JSON, // {preferredRole, jobType, workMode}
        defaultValue: {}
    },
    socialLinks: {
        type: DataTypes.JSON, // {linkedin, github, portfolio}
        defaultValue: {}
    },
    lastActive: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    profileCompletion: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('pending', 'active', 'blocked'),
        defaultValue: 'pending'
    },
    isEmailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    isPhoneVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    role: {
        type: DataTypes.STRING,
        defaultValue: 'candidate'
    }
}, {
    timestamps: true
});

export default Candidate;
