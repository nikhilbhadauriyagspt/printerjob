import { sequelize } from './config/db.js';

const fixDatabase = async () => {
    try {
        console.log("Updating Applications table status column...");
        await sequelize.query(`
            ALTER TABLE Applications 
            MODIFY COLUMN status ENUM('applied', 'reviewing', 'shortlisted', 'interview_scheduled', 'offered', 'hired', 'rejected') 
            DEFAULT 'applied'
        `);
        console.log("✅ Success: Applications status column updated.");
        
        console.log("Updating Interviews table status column...");
        await sequelize.query(`
            ALTER TABLE Interviews 
            MODIFY COLUMN status ENUM('scheduled', 'completed', 'cancelled') 
            DEFAULT 'scheduled'
        `);
        console.log("✅ Success: Interviews status column updated.");

        process.exit(0);
    } catch (error) {
        console.error("❌ Error updating database:", error.message);
        process.exit(1);
    }
};

fixDatabase();