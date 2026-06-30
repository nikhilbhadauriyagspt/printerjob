import { sequelize } from './config/db.js';

const updateTable = async () => {
    try {
        console.log("Checking and updating ActivityLogs table...");
        
        // Check if candidateId exists
        const [results] = await sequelize.query(`
            SHOW COLUMNS FROM ActivityLogs LIKE 'candidateId';
        `);

        if (results.length === 0) {
            console.log("Adding candidateId column...");
            await sequelize.query(`
                ALTER TABLE ActivityLogs 
                ADD COLUMN candidateId CHAR(36) DEFAULT NULL AFTER companyId;
            `);
        } else {
            console.log("candidateId column already exists.");
        }

        // Make companyId nullable
        console.log("Modifying companyId column...");
        await sequelize.query(`
            ALTER TABLE ActivityLogs 
            MODIFY COLUMN companyId CHAR(36) DEFAULT NULL;
        `);

        console.log("ActivityLogs table updated successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error updating table:", error.message);
        process.exit(1);
    }
};

updateTable();
