import Candidate from './backend/models/candidate.model.js';
import { connectDB, sequelize } from './backend/config/db.js';

const checkCandidates = async () => {
    try {
        await connectDB();
        const candidates = await Candidate.findAll({ attributes: ['id', 'fullName', 'email'] });
        console.log("Registered Candidates:");
        candidates.forEach(c => {
            console.log(`- ${c.fullName} (${c.email}) ID: ${c.id}`);
        });
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

checkCandidates();
