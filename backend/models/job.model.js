import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import slugify from 'slugify';

const Job = sequelize.define('Job', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING,
        unique: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    responsibilities: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    requirements: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    // Compensation
    minSalary: { type: DataTypes.DECIMAL(10, 2) },
    maxSalary: { type: DataTypes.DECIMAL(10, 2) },
    currency: { type: DataTypes.STRING, defaultValue: 'INR' },
    
    // SEO & Classification
    location: { type: DataTypes.JSON }, // ["Delhi", "Remote"]
    jobType: { 
        type: DataTypes.ENUM('Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'),
        defaultValue: 'Full-time'
    },
    experienceLevel: { type: DataTypes.STRING }, // e.g. "2-5 years"
    industry: { type: DataTypes.STRING }, // e.g. "Fintech", "IT"
    
    // Metadata
    skills: { type: DataTypes.JSON }, // Array of strings
    benefits: { type: DataTypes.JSON }, // Array of benefits
    screeningQuestions: { type: DataTypes.JSON }, // [{question, type, required}]
    
    // Controls
    workingSchedule: { type: DataTypes.STRING },
    expiryDate: { type: DataTypes.DATE },
    maxApplications: { type: DataTypes.INTEGER, defaultValue: null },
    applicationCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    
    // Status Logic
    status: {
        type: DataTypes.ENUM('draft', 'pending', 'active', 'rejected', 'closed'),
        defaultValue: 'draft'
    },
    isFeatured: { type: DataTypes.BOOLEAN, defaultValue: false },
    isUrgent: { type: DataTypes.BOOLEAN, defaultValue: false },
    rejectionReason: { type: DataTypes.TEXT },
    
    companyId: {
        type: DataTypes.UUID,
        allowNull: false
    }
}, {
    hooks: {
        beforeSave: async (job) => {
            if (job.title) {
                const baseSlug = slugify(job.title, { lower: true, strict: true });
                // Append short random string to ensure uniqueness
                job.slug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;
            }
        }
    },
    timestamps: true
});

export default Job;
