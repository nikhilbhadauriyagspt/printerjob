import cron from 'node-cron';
import Job from '../models/job.model.js';
import { Op } from 'sequelize';

const initCronJobs = () => {
    // Run every night at midnight
    cron.schedule('0 0 * * *', async () => {
        console.log('Running daily job expiry check...');
        try {
            const count = await Job.update(
                { status: 'closed' },
                {
                    where: {
                        status: 'active',
                        expiryDate: { [Op.lt]: new Date() }
                    }
                }
            );
            console.log(`Auto-closed ${count[0]} expired jobs.`);
        } catch (error) {
            console.error('Error in cron job:', error);
        }
    });

    // 🟢 Recruiter Plan Expiry Check (Runs daily at 1 AM)
    cron.schedule('0 1 * * *', async () => {
        console.log('Running daily recruiter plan expiry check...');
        try {
            const Company = (await import('../models/company.model.js')).default;
            const { sendEmail, getPlanExpiryWarningTemplate } = await import('./emailService.js');
            
            // Check for 7 days and 1 day warnings
            const warningDays = [7, 1];
            
            for (const days of warningDays) {
                const targetDate = new Date();
                targetDate.setDate(targetDate.getDate() + days);
                
                // Using start and end of target date for precision
                const startOfTarget = new Date(targetDate.setHours(0,0,0,0));
                const endOfTarget = new Date(targetDate.setHours(23,59,59,999));

                const expiringCompanies = await Company.findAll({
                    where: {
                        [Op.or]: [
                            { 
                                planType: 'trial', 
                                trialExpiresAt: { [Op.between]: [startOfTarget, endOfTarget] } 
                            },
                            { 
                                planType: 'premium', 
                                planExpiresAt: { [Op.between]: [startOfTarget, endOfTarget] } 
                            }
                        ]
                    }
                });

                for (const company of expiringCompanies) {
                    const expiryDate = company.planType === 'trial' ? company.trialExpiresAt : company.planExpiresAt;
                    await sendEmail({
                        to: company.email,
                        subject: `Action Required: Your Job Posting Access Expires in ${days} Day(s)`,
                        html: getPlanExpiryWarningTemplate(company.companyName, expiryDate, days)
                    });
                    console.log(`Sent ${days}-day expiry warning to ${company.companyName}`);
                }
            }
        } catch (error) {
            console.error('Error in recruiter expiry cron job:', error);
        }
    });
};

export default initCronJobs;
