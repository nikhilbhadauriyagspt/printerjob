import { sequelize } from './config/db.js';
import Company from './models/company.model.js';
import Package from './models/package.model.js';

const fixDatabase = async () => {
    try {
        console.log("Starting Database Sync...");
        
        // This will add missing columns without deleting existing data
        await Company.sync({ alter: true });
        console.log("✅ Companies table updated.");
        
        await Package.sync({ alter: true });
        console.log("✅ Packages table updated.");
        
        console.log("🚀 All columns synchronized successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error syncing database:", error);
        process.exit(1);
    }
};

fixDatabase();
