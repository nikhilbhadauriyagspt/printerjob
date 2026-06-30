import { sequelize } from '../config/db.js';
import JobTitle from '../models/jobTitle.model.js';
import Skill from '../models/skill.model.js';
import Industry from '../models/industry.model.js';

const jobTitles = [
    'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
    'Data Scientist', 'Machine Learning Engineer', 'DevOps Engineer', 'UI/UX Designer',
    'Product Manager', 'Project Manager', 'Business Analyst', 'Marketing Manager',
    'Sales Executive', 'HR Manager', 'Recruiter', 'Content Writer', 'Graphic Designer',
    'Social Media Manager', 'Data Analyst', 'Mobile App Developer', 'QA Engineer'
];

const skills = [
    'React', 'Node.js', 'Python', 'Java', 'JavaScript', 'SQL', 'AWS', 'Docker', 'Kubernetes',
    'HTML', 'CSS', 'MongoDB', 'C++', 'Swift', 'TypeScript', 'PHP', 'Go', 'Rust'
];

const industries = [
    'Information Technology', 'Finance', 'Healthcare', 'Education', 'E-commerce',
    'Manufacturing', 'Automotive', 'Media & Entertainment', 'Telecom', 'Real Estate'
];

const seedBaseData = async () => {
    try {
        await sequelize.authenticate();
        console.log("Connected to DB...");

        for (let name of jobTitles) {
            await JobTitle.findOrCreate({ where: { name } });
        }
        console.log("Job Titles seeded.");

        for (let name of skills) {
            await Skill.findOrCreate({ where: { name }, defaults: { isApproved: true } });
        }
        console.log("Skills seeded.");

        for (let name of industries) {
            await Industry.findOrCreate({ where: { name }, defaults: { isApproved: true } });
        }
        console.log("Industries seeded.");

        console.log("Base data seeded successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Seeding failed:", err);
        process.exit(1);
    }
};

seedBaseData();
