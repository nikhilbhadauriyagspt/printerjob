import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, sequelize } from './config/db.js';

// Models
import Candidate from './models/candidate.model.js';
import Company from './models/company.model.js';
import OTP from './models/otp.model.js';
import ActivityLog from './models/activityLog.model.js';
import Industry from './models/industry.model.js';
import Designation from './models/designation.model.js';
import JobTitle from './models/jobTitle.model.js';
import Skill from './models/skill.model.js';
import Job from './models/job.model.js';
import Package from './models/package.model.js';
import Notification from './models/notification.model.js';
import Message from './models/message.model.js';
import Application from './models/application.model.js';
import Interview from './models/interview.model.js';

// Routes
import adminRoutes from './routes/admin.route.js';
import companyRoutes from './routes/company.route.js';
import jobRoutes from './routes/job.route.js';
import messageRoutes from './routes/message.route.js';
import candidateRoutes from './routes/candidate.route.js';
import applicationRoutes from './routes/application.route.js';

// Utils
import initCronJobs from './utils/cronJobs.js';

dotenv.config();

// Initialize Scheduled Tasks
initCronJobs();

// Establish Associations
Company.hasMany(Job, { foreignKey: 'companyId', as: 'Jobs' });
Job.belongsTo(Company, { foreignKey: 'companyId', as: 'Company' });

Job.hasMany(Application, { foreignKey: 'jobId', as: 'Applications' });
Application.belongsTo(Job, { foreignKey: 'jobId', as: 'Job' });

Candidate.hasMany(Application, { foreignKey: 'candidateId', as: 'Applications' });
Application.belongsTo(Candidate, { foreignKey: 'candidateId', as: 'Candidate' });

Application.hasOne(Interview, { foreignKey: 'applicationId', as: 'Interview' });
Interview.belongsTo(Application, { foreignKey: 'applicationId', as: 'Application' });

Candidate.hasMany(Interview, { foreignKey: 'candidateId', as: 'Interviews' });
Interview.belongsTo(Candidate, { foreignKey: 'candidateId', as: 'Candidate' });

// Add these new lines:
Job.hasMany(Interview, { foreignKey: 'jobId', as: 'Interviews' });
Interview.belongsTo(Job, { foreignKey: 'jobId', as: 'Job' });

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or Postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
};
app.use(cors(corsOptions));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// APIs
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/company', companyRoutes);
app.use('/api/v1/job', jobRoutes);
app.use('/api/v1/message', messageRoutes);
app.use('/api/v1/candidate', candidateRoutes);
app.use('/api/v1/application', applicationRoutes);

app.get('/', (req, res) => {
    res.status(200).json({ message: "Job Portal Backend API is running", success: true });
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await connectDB();

        // Print existing database tables for diagnostics
        try {
            const [tables] = await sequelize.query("SHOW TABLES;");
            console.log("DATABASE TABLES:", JSON.stringify(tables));
        } catch (tableErr) {
            console.error("Failed to show tables:", tableErr.message);
        }
        
        // 🟢 Manual Migration: OTPs Table (Add candidateId & fix companyId)
        try {
            const [results] = await sequelize.query(`
                SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'OTPs' AND COLUMN_NAME = 'candidateId' AND TABLE_SCHEMA = DATABASE();
            `);
            if (results[0].count === 0) {
                await sequelize.query("ALTER TABLE `OTPs` ADD COLUMN `candidateId` CHAR(36) BINARY NULL AFTER `companyId`;");
                await sequelize.query("ALTER TABLE `OTPs` MODIFY COLUMN `companyId` CHAR(36) BINARY NULL;");
                console.log('Migration: candidateId added to OTPs');
            }
        } catch (err) { console.error('OTP Migration failed:', err.message); }

        // 🟢 Manual Migration: Candidates Table (Add professional fields)
        try {
            const candidateColumns = [
                { name: 'bio', type: "TEXT NULL" },
                { name: 'headline', type: "VARCHAR(255) NULL" },
                { name: 'industry', type: "VARCHAR(255) NULL" },
                { name: 'designation', type: "VARCHAR(255) NULL" },
                { name: 'experienceLevel', type: "ENUM('fresher', 'experienced') DEFAULT 'fresher'" },
                { name: 'experienceYears', type: "INT DEFAULT 0" },
                { name: 'experienceData', type: "JSON NULL" },
                { name: 'skills', type: "JSON NULL" },
                { name: 'educationData', type: "JSON NULL" },
                { name: 'noticePeriod', type: "VARCHAR(255) NULL" },
                { name: 'currentSalary', type: "VARCHAR(255) NULL" },
                { name: 'expectedSalary', type: "VARCHAR(255) NULL" },
                { name: 'currentLocation', type: "VARCHAR(255) NULL" },
                { name: 'preferredLocations', type: "JSON NULL" },
                { name: 'relocation', type: "TINYINT(1) DEFAULT 0" },
                { name: 'jobPreferences', type: "JSON NULL" },
                { name: 'socialLinks', type: "JSON NULL" },
                { name: 'lastActive', type: "DATETIME NULL" },
                { name: 'profileCompletion', type: "INT DEFAULT 0" },
                { name: 'resumeText', type: "LONGTEXT NULL" },
            ];

            for (const col of candidateColumns) {
                const [results] = await sequelize.query(`
                    SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_NAME = 'Candidates' AND COLUMN_NAME = '${col.name}' AND TABLE_SCHEMA = DATABASE();
                `);
                if (results[0].count === 0) {
                    await sequelize.query(`ALTER TABLE \`Candidates\` ADD COLUMN \`${col.name}\` ${col.type};`);
                    console.log(`Migration: ${col.name} added to Candidates`);
                }
            }
        } catch (err) { console.error('Candidate Migration failed:', err.message); }

        // 🟢 Manual Migration: Companies Table
        try {
            const companyCols = ['databaseCredits', 'unlockedCandidates'];
            for (const col of companyCols) {
                const [results] = await sequelize.query(`
                    SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_NAME = 'Companies' AND COLUMN_NAME = '${col}' AND TABLE_SCHEMA = DATABASE();
                `);
                if (results[0].count === 0) {
                    const type = col === 'unlockedCandidates' ? 'JSON NULL' : 'INT DEFAULT 0';
                    await sequelize.query(`ALTER TABLE \`Companies\` ADD COLUMN \`${col}\` ${type};`);
                    console.log(`Migration: ${col} added to Companies`);
                }
            }
        } catch (err) { console.error('Company Migration failed:', err.message); }

        // 🟢 Manual Migration: Packages Table
        try {
            const [results] = await sequelize.query(`
                SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'Packages' AND COLUMN_NAME = 'type' AND TABLE_SCHEMA = DATABASE();
            `);
            if (results[0].count === 0) {
                await sequelize.query("ALTER TABLE `Packages` ADD COLUMN `type` ENUM('job_post', 'database_access') DEFAULT 'job_post' AFTER `tier`;");
                await sequelize.query("ALTER TABLE `Packages` ADD COLUMN `databaseCredits` INT DEFAULT 0 AFTER `type`;");
                console.log('Migration: type and databaseCredits added to Packages');
            }
        } catch (err) { console.error('Package Migration failed:', err.message); }

        // 🟢 Manual Migration: CandidateInteractions Table
        try {
            await sequelize.query(`
                CREATE TABLE IF NOT EXISTS \`CandidateInteractions\` (
                    \`id\` CHAR(36) BINARY PRIMARY KEY,
                    \`companyId\` CHAR(36) BINARY NOT NULL,
                    \`candidateId\` CHAR(36) BINARY NOT NULL,
                    \`notes\` TEXT,
                    \`rating\` INTEGER DEFAULT 0,
                    \`folder\` VARCHAR(255) DEFAULT 'General',
                    \`isContacted\` TINYINT(1) DEFAULT 0,
                    \`lastContactedAt\` DATETIME,
                    \`createdAt\` DATETIME NOT NULL,
                    \`updatedAt\` DATETIME NOT NULL,
                    UNIQUE KEY \`company_candidate_unique\` (\`companyId\`, \`candidateId\`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
            `);
            console.log('Migration: CandidateInteractions table verified');
        } catch (err) { console.error('Interaction Migration failed:', err.message); }

        // Final Sync (Safe with Foreign Key Checks disabled during creation)
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
        try {
            await sequelize.sync(); 
        } catch (syncErr) {
            console.error("SEQUELIZE SYNC FAILED DETAILED ERROR:");
            console.error("Message:", syncErr.message);
            if (syncErr.original) {
                console.error("Original SQL Error:", syncErr.original.message);
                console.error("SQL Code:", syncErr.original.code);
                console.error("SQL Query:", syncErr.original.sql);
            }
            throw syncErr;
        }
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('Database synced successfully');

        app.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
    }
};

startServer();
