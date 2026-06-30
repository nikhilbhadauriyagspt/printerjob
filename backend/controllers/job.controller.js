import Job from '../models/job.model.js';
import Notification from '../models/notification.model.js';
import Candidate from '../models/candidate.model.js';
import Company from '../models/company.model.js';
import Industry from '../models/industry.model.js';
import JobTitle from '../models/jobTitle.model.js';
import Skill from '../models/skill.model.js';
import { logActivity } from '../utils/logger.js';
import { sendEmail, getJobApprovedTemplate, getJobRejectedTemplate } from '../utils/emailService.js';
import { Op } from 'sequelize';

// 1. Create Job (Draft or Pending Approval)
export const createJob = async (req, res) => {
    try {
        const companyId = req.companyId;
        const { isDraft, industry, ...jobData } = req.body;

        // 🟢 Subscription & Access Check
        const Company = (await import('../models/company.model.js')).default;
        const company = await Company.findByPk(companyId);

        if (!company) return res.status(404).json({ message: "Company not found", success: false });

        // 🟢 Check if Admin has approved the company
        if (!company.isApproved) {
            return res.status(403).json({ 
                message: "Your account is pending admin approval. You can post jobs once your account is verified.", 
                success: false 
            });
        }

        if (!isDraft) {
            const now = new Date();
            let hasAccess = false;

            if (company.planType === 'trial' && company.trialExpiresAt && company.trialExpiresAt > now) {
                hasAccess = true;
            } else if (company.planType === 'premium' && company.planExpiresAt && company.planExpiresAt > now) {
                hasAccess = true;
            }

            if (!hasAccess) {
                return res.status(403).json({ 
                    message: "Your job posting access has expired. Please recharge to continue.", 
                    success: false,
                    isExpired: true 
                });
            }

            // Optional: Job limit check
            if (company.jobPostingLimit !== -1) {
                const jobCount = await Job.count({ where: { companyId, status: { [Op.ne]: 'draft' } } });
                if (jobCount >= company.jobPostingLimit) {
                    return res.status(403).json({ 
                        message: "You have reached your job posting limit. Please upgrade your plan.", 
                        success: false 
                    });
                }
            }
        }

        const job = await Job.create({
            ...jobData,
            industry,
            companyId,
            status: isDraft ? 'draft' : 'pending'
        });

        // Log Action
        await logActivity({ 
            companyId, 
            action: isDraft ? 'JOB_DRAFT_SAVED' : 'JOB_POSTED', 
            details: `${isDraft ? 'Saved draft' : 'Posted new job'}: "${job.title}"`,
            req 
        });

        // 🟢 Dynamic Metadata Suggestion Logic
        if (!isDraft) {
            // Suggest Job Title
            if (jobData.title) {
                await JobTitle.findOrCreate({
                    where: { name: jobData.title.trim() },
                    defaults: { isApproved: false, createdBy: companyId }
                });
            }
            // Suggest Industry
            if (industry) {
                await Industry.findOrCreate({
                    where: { name: industry.trim() },
                    defaults: { isApproved: false, createdBy: companyId }
                });
            }
            // Suggest Skills
            if (jobData.skills && Array.isArray(jobData.skills)) {
                await Promise.all(jobData.skills.map(skill => 
                    Skill.findOrCreate({
                        where: { name: skill.trim() },
                        defaults: { isApproved: false, createdBy: companyId }
                    })
                ));
            }

            // 🟢 Notify Admin with Company Name
            const company = await Company.findByPk(companyId);
            const companyName = company ? company.companyName : "A recruiter";

            await Notification.create({
                recipientId: '00000000-0000-0000-0000-000000000000', 
                recipientType: 'admin',
                title: 'New Job Posted',
                message: `"${job.title}" has been posted by ${companyName}.`,
                type: 'JOB_POSTED',
                relatedId: job.id
            });
        }

        return res.status(201).json({ message: isDraft ? "Job saved as draft" : "Job submitted for approval", success: true, job });
    } catch (error) {
        return res.status(500).json({ message: error.message, success: false });
    }
};

// 2. Update Job (Re-approval logic)
export const updateJob = async (req, res) => {
    try {
        const { id } = req.params;
        const job = await Job.findByPk(id);
        if (!job) return res.status(404).json({ message: "Job not found", success: false });

        // If active/rejected job is edited, move back to pending for re-approval
        let updatedStatus = job.status;
        if (job.status === 'active' || job.status === 'rejected') {
            updatedStatus = 'pending';
        }

        await job.update({ ...req.body, status: updatedStatus });

        // Log Action
        await logActivity({ 
            companyId: job.companyId, 
            action: 'JOB_UPDATED', 
            details: `Updated job: "${job.title}" (Status: ${updatedStatus})`,
            req 
        });

        return res.status(200).json({ 
            message: updatedStatus === 'pending' ? "Job updated and sent for re-approval" : "Job updated successfully", 
            success: true 
        });
    } catch (error) {
        return res.status(500).json({ message: error.message, success: false });
    }
};

// 3. Get Recruiter Jobs
export const getRecruiterJobs = async (req, res) => {
    try {
        const jobs = await Job.findAll({
            where: { companyId: req.companyId },
            order: [['createdAt', 'DESC']]
        });
        return res.status(200).json({ success: true, jobs });
    } catch (error) {
        return res.status(500).json({ message: error.message, success: false });
    }
};

// 🟢 NEW: Delete Job
export const deleteJob = async (req, res) => {
    try {
        const { id } = req.params;
        const job = await Job.findByPk(id);
        if (!job) return res.status(404).json({ message: "Job not found", success: false });

        await job.destroy();

        // Log Action
        await logActivity({ 
            companyId: job.companyId, 
            action: 'JOB_DELETED', 
            details: `Deleted job: "${job.title}"`,
            req 
        });

        return res.status(200).json({ message: "Job deleted successfully", success: true });
    } catch (error) {
        return res.status(500).json({ message: error.message, success: false });
    }
};

// 4. Admin: Review Job (Approve/Reject/Block)
export const adminReviewJob = async (req, res) => {
    try {
        const { jobId, action, reason } = req.body; // action: 'approve' | 'reject' | 'block'
        const job = await Job.findByPk(jobId, { include: [{ model: Company, as: 'Company' }] });
        
        if (!job) return res.status(404).json({ message: "Job not found", success: false });

        const company = job.Company;

        if (action === 'approve') {
            job.status = 'active';
            job.expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

            // 🟢 Auto-Approve Metadata with parsing safety
            await JobTitle.update({ isApproved: true }, { where: { name: job.title } });
            if (job.industry) await Industry.update({ isApproved: true }, { where: { name: job.industry } });
            
            if (job.skills) {
                const skillsArray = Array.isArray(job.skills) ? job.skills : JSON.parse(job.skills || '[]');
                if (skillsArray.length > 0) {
                    await Skill.update({ isApproved: true }, { where: { name: { [Op.in]: skillsArray } } });
                }
            }
        } else if (action === 'reject') {
            job.status = 'rejected';
            job.rejectionReason = reason;
        } else if (action === 'block') {
            job.status = 'rejected'; // Marking as rejected/blocked
            job.rejectionReason = `Blocked by Admin: ${reason}`;
        }

        await job.save();

        // 🟢 Create Notification for Recruiter
        await Notification.create({
            recipientId: job.companyId,
            recipientType: 'company',
            title: action === 'approve' ? 'Job Approved & Live!' : (action === 'block' ? 'Job Blocked' : 'Job Update Required'),
            message: action === 'approve' 
                ? `Your job "${job.title}" is now live.` 
                : `Your job "${job.title}" was ${action}ed. Reason: ${reason}`,
            type: action === 'approve' ? 'JOB_APPROVED' : 'JOB_REJECTED',
            relatedId: job.id
        });

        // 🟢 If approved, Trigger Smart Job Alerts for Candidates
        if (action === 'approve') {
            sendJobAlertsToCandidates(job, company);
        }

        // Send Email
        await sendEmail({
            to: company.email,
            subject: action === 'approve' ? "Your Job is Live!" : `Update regarding your job: ${job.title}`,
            html: action === 'approve' 
                ? getJobApprovedTemplate(job.title, company.companyName) 
                : getJobRejectedTemplate(job.title, company.companyName, reason)
        });

        return res.status(200).json({ message: `Job ${action}ed successfully`, success: true });
    } catch (error) {
        console.error("ADMIN REVIEW ERROR:", error);
        return res.status(500).json({ message: error.message, success: false });
    }
};

// 5. Get Job By ID (Public & Private)
export const getJobById = async (req, res) => {
    try {
        const job = await Job.findByPk(req.params.id, { 
            include: [{
                model: Company,
                as: 'Company'
            }] 
        });
        if (!job) return res.status(404).json({ message: "Job not found", success: false });
        return res.status(200).json({ success: true, job });
    } catch (error) {
        return res.status(500).json({ message: error.message, success: false });
    }
};

// 🟢 NEW: Get All Jobs (With Filters & Search)
export const getAllJobs = async (req, res) => {
    try {
        const { keyword, location, industry, jobType, minSalary, experienceLevel } = req.query;
        
        const query = {
            status: 'active', // Only show approved and active jobs
            [Op.and]: []
        };

        if (keyword) {
            query[Op.and].push({
                [Op.or]: [
                    { title: { [Op.like]: `%${keyword}%` } },
                    { description: { [Op.like]: `%${keyword}%` } },
                ]
            });
        }

        if (location) {
            query[Op.and].push(
                Job.sequelize.where(
                    Job.sequelize.cast(Job.sequelize.col('location'), 'CHAR'),
                    { [Op.like]: `%${location}%` }
                )
            );
        }

        if (industry) {
            query[Op.and].push({ industry: industry });
        }

        if (jobType) {
            query[Op.and].push({ jobType: jobType });
        }

        if (experienceLevel) {
            query[Op.and].push({ experienceLevel: experienceLevel });
        }

        // Remove empty [Op.and] if no filters applied
        if (query[Op.and].length === 0) {
            delete query[Op.and];
        }

        const jobs = await Job.findAll({
            where: query,
            include: [{
                model: Company,
                as: 'Company',
                attributes: ['id', 'companyName', 'logo', 'city', 'website', 'description']
            }],
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            jobs
        });
    } catch (error) {
        console.error("GET ALL JOBS ERROR:", error);
        return res.status(500).json({ message: error.message, success: false });
    }
};

// 🟢 Helper: Send Job Alerts to Matching Candidates
const sendJobAlertsToCandidates = async (job, company) => {
    try {
        console.log(`Starting Smart Match for job: "${job.title}"`);
        
        // 1. Get all active candidates
        const candidates = await Candidate.findAll({
            where: { status: 'active' },
            attributes: ['id', 'fullName', 'email', 'headline', 'skills']
        });

        const jobSkills = Array.isArray(job.skills) ? job.skills : JSON.parse(job.skills || '[]');
        const jobTitleLower = job.title.toLowerCase();

        const matches = [];

        for (const candidate of candidates) {
            let isMatch = false;

            // Match by Headline/Job Title
            if (candidate.headline && candidate.headline.toLowerCase().includes(jobTitleLower)) {
                isMatch = true;
            }

            // Match by Skills
            if (!isMatch && candidate.skills) {
                const candidateSkills = Array.isArray(candidate.skills) ? candidate.skills : JSON.parse(candidate.skills || '[]');
                const hasSkillMatch = candidateSkills.some(s => {
                    const skillName = (typeof s === 'string' ? s : s.name).toLowerCase();
                    return jobSkills.some(js => js.toLowerCase() === skillName);
                });
                if (hasSkillMatch) isMatch = true;
            }

            if (isMatch) {
                matches.push(candidate);
            }
        }

        console.log(`Matched ${matches.length} candidates for job "${job.title}"`);

        // 2. Send Notifications & Emails
        for (const match of matches) {
            // In-app Notification
            await Notification.create({
                recipientId: match.id,
                recipientType: 'candidate',
                title: 'New Job Match!',
                message: `A new job "${job.title}" matching your profile was posted by ${company.companyName}.`,
                type: 'JOB_MATCH',
                relatedId: job.id
            });

            // Email Alert
            try {
                await sendEmail({
                    to: match.email,
                    subject: `New Job Opportunity: ${job.title} at ${company.companyName}`,
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                            <h2 style="color: #4f46e5;">New Job Match Found!</h2>
                            <p>Hello <b>${match.fullName}</b>,</p>
                            <p>We found a new job opening that matches your professional profile:</p>
                            <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <h3 style="margin: 0; color: #111827;">${job.title}</h3>
                                <p style="margin: 5px 0; color: #6b7280;">${company.companyName} • ${job.location || 'Remote'}</p>
                                <p style="margin: 5px 0; color: #6b7280;">Salary: ${job.salary || 'Competitive'}</p>
                            </div>
                            <p>Check out the full details and apply now on our portal.</p>
                            <a href="http://localhost:5173/job/description/${job.id}" style="display: inline-block; background: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">View Job & Apply</a>
                            <p style="margin-top: 30px; font-size: 12px; color: #9ca3af;">You received this because your profile matches the requirements for this role.</p>
                        </div>
                    `
                });
            } catch (err) {
                console.error(`Email failed for candidate ${match.email}:`, err.message);
            }
        }

    } catch (error) {
        console.error("SMART MATCH ERROR:", error);
    }
};
