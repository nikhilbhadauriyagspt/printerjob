import { sequelize } from './backend/config/db.js';
import JobTitle from './backend/models/jobTitle.model.js';
import Company from './backend/models/company.model.js';

const checkData = async () => {
    try {
        await sequelize.authenticate();
        const jobTitleCount = await JobTitle.count();
        const companyCount = await Company.count();
        console.log(`JobTitles: ${jobTitleCount}`);
        console.log(`Companies: ${companyCount}`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkData();
