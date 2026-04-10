import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, sequelize } from './config/db.js';
import adminRoutes from './routes/admin.route.js';
import companyRoutes from './routes/company.route.js';
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
import jobRoutes from './routes/job.route.js';
import messageRoutes from './routes/message.route.js';
import initCronJobs from './utils/cronJobs.js';

dotenv.config();

// Initialize Scheduled Tasks
initCronJobs();

// Establish Associations
Company.hasMany(Job, { foreignKey: 'companyId', as: 'Jobs' });
Job.belongsTo(Company, { foreignKey: 'companyId', as: 'Company' });

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions = {
    origin: 'http://localhost:5173', 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
};
app.use(cors(corsOptions));

// Local Uploads Folder ko static banana taaki images access ho sakein
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Admin APIs
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/company', companyRoutes);
app.use('/api/v1/job', jobRoutes);
app.use('/api/v1/message', messageRoutes);

// Routes placeholders
app.get('/', (req, res) => {
    res.status(200).json({
        message: "Job Portal Backend API is running",
        success: true
    });
});

const PORT = process.env.PORT || 3000;

// Database Connection and Server Start
const startServer = async () => {
    try {
        await connectDB();
        
        // 🟢 Manual Migration: Jobs Table
        try {
            const [results] = await sequelize.query(`
                SELECT COUNT(*) as count 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'Jobs' 
                AND COLUMN_NAME = 'industry' 
                AND TABLE_SCHEMA = DATABASE();
            `);
            
            if (results[0].count === 0) {
                await sequelize.query("ALTER TABLE `Jobs` ADD COLUMN `industry` VARCHAR(255) AFTER `experienceLevel`;");
                console.log('Migration: industry column added to Jobs');
            }
        } catch (migErr) {
            console.error('Job Migration failed:', migErr.message);
        }

        // 🟢 Manual Migration: Companies Table (Subscription Fields)
        try {
            const subscriptionColumns = [
                { name: 'planType', type: "ENUM('none', 'trial', 'premium') DEFAULT 'none'" },
                { name: 'trialExpiresAt', type: "DATETIME NULL" },
                { name: 'planExpiresAt', type: "DATETIME NULL" },
                { name: 'currentPackageId', type: "CHAR(36) BINARY NULL" },
                { name: 'currentPackageTier', type: "INT DEFAULT 0" },
                { name: 'jobPostingLimit', type: "INT DEFAULT 0" },
                { name: 'isFreeAccessEnabled', type: "BOOLEAN DEFAULT FALSE" }
            ];

            for (const col of subscriptionColumns) {
                const [results] = await sequelize.query(`
                    SELECT COUNT(*) as count 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_NAME = 'Companies' 
                    AND COLUMN_NAME = '${col.name}' 
                    AND TABLE_SCHEMA = DATABASE();
                `);

                if (results[0].count === 0) {
                    await sequelize.query(`ALTER TABLE \`Companies\` ADD COLUMN \`${col.name}\` ${col.type};`);
                    console.log(`Migration: ${col.name} column added to Companies`);
                }
            }

            // 🟢 Manual Migration: Packages Table (Tier Field)
            const [pkgResults] = await sequelize.query(`
                SELECT COUNT(*) as count 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'Packages' 
                AND COLUMN_NAME = 'tier' 
                AND TABLE_SCHEMA = DATABASE();
            `);

            if (pkgResults[0].count === 0) {
                await sequelize.query("ALTER TABLE `Packages` ADD COLUMN `tier` INT DEFAULT 1 AFTER `jobLimit`;");
                console.log('Migration: tier column added to Packages');
            }
        } catch (migErr) {
            console.error('Company Migration failed:', migErr.message);
        }

        // Sequelize sync (Standard)
        await sequelize.sync(); 
        console.log('Database synced successfully');

        // 🟢 Manual Migration: SystemConfigs Table (After Sync)
        try {
            const systemConfigColumns = [
                { name: 'isSupportEnabled', type: "BOOLEAN DEFAULT TRUE" },
                { name: 'defaultFreeMonths', type: "INT DEFAULT 6" },
                { name: 'activeGateway', type: "ENUM('razorpay', 'paypal', 'both', 'none') DEFAULT 'none'" },
                { name: 'paymentMode', type: "ENUM('sandbox', 'live') DEFAULT 'sandbox'" },
                { name: 'currency', type: "VARCHAR(255) DEFAULT 'INR'" },
                { name: 'razorpayKeyId', type: "VARCHAR(255) NULL" },
                { name: 'razorpaySecret', type: "VARCHAR(255) NULL" },
                { name: 'paypalClientId', type: "VARCHAR(255) NULL" },
                { name: 'paypalSecret', type: "VARCHAR(255) NULL" }
            ];

            for (const col of systemConfigColumns) {
                const [results] = await sequelize.query(`
                    SELECT COUNT(*) as count 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_NAME = 'SystemConfigs' 
                    AND COLUMN_NAME = '${col.name}' 
                    AND TABLE_SCHEMA = DATABASE();
                `);

                if (results[0].count === 0) {
                    await sequelize.query(`ALTER TABLE \`SystemConfigs\` ADD COLUMN \`${col.name}\` ${col.type};`);
                    console.log(`Migration: ${col.name} column added to SystemConfigs`);
                }
            }

            // Cleanup old columns if they exist
            try {
                const [oldCols] = await sequelize.query(`
                    SELECT COLUMN_NAME 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_NAME = 'SystemConfigs' 
                    AND COLUMN_NAME IN ('key', 'value')
                    AND TABLE_SCHEMA = DATABASE();
                `);
                
                if (oldCols.length > 0) {
                    for (const row of oldCols) {
                        await sequelize.query(`ALTER TABLE \`SystemConfigs\` DROP COLUMN \`${row.COLUMN_NAME}\`;`);
                    }
                }
            } catch (dropErr) { /* Ignore */ }

        } catch (migErr) {
            console.error('SystemConfig Migration failed:', migErr.message);
        }

        app.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
    }
};

startServer();
