import { sequelize } from './config/db.js';
import Company from './models/company.model.js';
import Package from './models/package.model.js';
import Candidate from './models/candidate.model.js';

const fixSchema = async () => {
    try {
        console.log("Starting Database Schema Update...");
        
        // This will add missing columns without deleting existing data
        await sequelize.sync({ alter: true });
        
        console.log("-----------------------------------------");
        console.log("✅ Database Schema Updated Successfully!");
        console.log("New columns added: databaseCredits, unlockedCandidates, etc.");
        console.log("-----------------------------------------");
        
        process.exit(0);
    } catch (error) {
        console.error("❌ Schema Update Failed:", error);
        process.exit(1);
    }
};

fixSchema();
