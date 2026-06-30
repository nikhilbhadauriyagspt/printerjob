import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Company = sequelize.define('Company', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    companyName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true }
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true
    },
    // Recruiter specific fields
    contactPersonName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    designation: {
        type: DataTypes.STRING,
        allowNull: true
    },
    // Verification & Status
    status: {
        type: DataTypes.ENUM('pending', 'verified', 'profile_incomplete', 'active', 'rejected'),
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
    // Profile Completion Fields
    logo: { type: DataTypes.STRING },
    industry: { type: DataTypes.STRING },
    companyType: { type: DataTypes.STRING }, // e.g. Product, Service
    companySize: { type: DataTypes.STRING },
    website: { type: DataTypes.STRING },
    description: { type: DataTypes.TEXT },
    address: { type: DataTypes.STRING },
    city: { type: DataTypes.STRING },
    state: { type: DataTypes.STRING },
    country: { type: DataTypes.STRING },
    pincode: { type: DataTypes.STRING },
    gstNumber: { type: DataTypes.STRING },
    panNumber: { type: DataTypes.STRING },
    // Social Links (Stored as JSON)
    socialLinks: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    profileCompletionScore: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    isGoogleUser: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    allowGoogleLogin: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    isApproved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    // Subscription & Plan Management
    planType: {
        type: DataTypes.ENUM('none', 'trial', 'premium'),
        defaultValue: 'none'
    },
    trialExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    planExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    currentPackageId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    currentPackageTier: {
        type: DataTypes.INTEGER,
        defaultValue: 0 // 0 means no active plan
    },
    jobPostingLimit: {
        type: DataTypes.INTEGER,
        defaultValue: 0 // Default 0 until profile 100% or plan purchased
    },
    isFreeAccessEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    databaseCredits: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    unlockedCandidates: {
        type: DataTypes.JSON, // Array of Candidate UUIDs
        defaultValue: []
    }
}, {
    timestamps: true
});

export default Company;
