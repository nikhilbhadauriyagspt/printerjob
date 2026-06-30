import { sequelize } from './config/db.js';
// Import models to ensure they are registered with Sequelize
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
Job.hasMany(Interview, { foreignKey: 'jobId', as: 'Interviews' });
Interview.belongsTo(Job, { foreignKey: 'jobId', as: 'Job' });

async function run() {
  try {
    await sequelize.authenticate();
    console.log("DB Authenticated successfully.");
    
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await sequelize.sync({ force: false });
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log("DB Sync Succeeded!");
  } catch (err) {
    console.error("SYNC FAILED ERROR:", err);
    if (err.original) {
      console.error("SQL Error Message:", err.original.message);
      console.error("SQL Query executed:", err.original.sql);
    }
  } finally {
    process.exit();
  }
}

run();
