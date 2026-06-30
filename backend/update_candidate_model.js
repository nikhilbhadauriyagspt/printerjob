import { sequelize } from './config/db.js';

const updateCandidateTable = async () => {
    try {
        console.log("Updating Candidates table...");
        
        const [results] = await sequelize.query(`SHOW COLUMNS FROM Candidates LIKE 'projectsData';`);

        if (results.length === 0) {
            console.log("Adding new columns to Candidates...");
            await sequelize.query(`
                ALTER TABLE Candidates 
                ADD COLUMN projectsData JSON DEFAULT NULL AFTER educationData,
                ADD COLUMN certificationsData JSON DEFAULT NULL AFTER projectsData;
            `);
            console.log("New columns added successfully.");
        } else {
            console.log("Columns already exist.");
        }

        process.exit(0);
    } catch (error) {
        console.error("Error updating Candidates table:", error.message);
        process.exit(1);
    }
};

updateCandidateTable();
