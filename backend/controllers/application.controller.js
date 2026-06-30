import Application from '../models/application.model.js';
import Job from '../models/job.model.js';
import Company from '../models/company.model.js';
import Notification from '../models/notification.model.js';
import Candidate from '../models/candidate.model.js';
import Interview from '../models/interview.model.js';
import ActivityLog from '../models/activityLog.model.js';
import { Op } from 'sequelize';

// 1. Apply for Job
export const applyJob = async (req, res) => {
    try {
        const candidateId = req.candidateId;
        const { jobId, answers, coverLetter } = req.body;
        if (!jobId) return res.status(400).json({ message: "Job ID is required", success: false });

        const existingApplication = await Application.findOne({ where: { jobId, candidateId } });
        if (existingApplication) return res.status(400).json({ message: "Already applied", success: false });

        const job = await Job.findByPk(jobId);
        const candidate = await Candidate.findByPk(candidateId);
        if (!candidate.resume) return res.status(400).json({ message: "Upload resume first", success: false });

        const application = await Application.create({ jobId, candidateId, resume: candidate.resume, answers, coverLetter });
        job.applicationCount += 1;
        await job.save();

        await Notification.create({ recipientId: job.companyId, recipientType: 'company', title: 'New Application', message: `${candidate.fullName} applied for ${job.title}`, type: 'NEW_APPLICATION', relatedId: application.id });
        return res.status(201).json({ message: "Applied successfully", success: true });
    } catch (error) { return res.status(500).json({ message: error.message, success: false }); }
};

// 2. Get Applied Jobs (For Candidate)
export const getAppliedJobs = async (req, res) => {
    try {
        const applications = await Application.findAll({
            where: { candidateId: req.candidateId },
            include: [{ model: Job, as: 'Job', include: [{ model: Company, as: 'Company', attributes: ['companyName', 'logo'] }] }],
            order: [['createdAt', 'DESC']]
        });
        return res.status(200).json({ success: true, applications });
    } catch (error) { return res.status(500).json({ message: error.message, success: false }); }
};

// 3. Get Applicants (For Recruiter)
export const getApplicants = async (req, res) => {
    try {
        const jobId = req.params.jobId;
        const applicants = await Application.findAll({
            where: { jobId },
            include: [{ model: Candidate, as: 'Candidate', attributes: ['id', 'fullName', 'email', 'phoneNumber', 'profilePhoto', 'headline', 'lastActive', 'resume'] }],
            order: [['createdAt', 'DESC']]
        });

        // Log Search Appearance with Cooldown (5 minutes)
        if (applicants.length > 0) {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            
            const logsToCreate = [];
            for (const app of applicants) {
                const recentLog = await ActivityLog.findOne({
                    where: {
                        candidateId: app.candidateId,
                        action: 'SEARCH_APPEARANCE',
                        createdAt: { [Op.gt]: fiveMinutesAgo }
                    }
                });
                
                if (!recentLog) {
                    logsToCreate.push({
                        candidateId: app.candidateId,
                        action: 'SEARCH_APPEARANCE',
                        details: `Profile appeared in applicant list for job ID: ${jobId}`
                    });
                }
            }
            
            if (logsToCreate.length > 0) {
                await ActivityLog.bulkCreate(logsToCreate);
            }
        }

        return res.status(200).json({ success: true, applicants });
    } catch (error) { return res.status(500).json({ message: error.message, success: false }); }
};

// 4. Get Details (Triggers "Viewed")
export const getApplicationDetails = async (req, res) => {
    try {
        const application = await Application.findByPk(req.params.id, {
            include: [{ model: Job, as: 'Job' }, { model: Candidate, as: 'Candidate' }]
        });
        
        if (!application) return res.status(404).json({ message: "Application not found", success: false });

        // Log Profile View with Cooldown (5 minutes)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const recentLog = await ActivityLog.findOne({
            where: {
                candidateId: application.candidateId,
                action: 'PROFILE_VIEW',
                createdAt: { [Op.gt]: fiveMinutesAgo }
            }
        });

        if (!recentLog) {
            await ActivityLog.create({
                candidateId: application.candidateId,
                companyId: application.Job.companyId,
                action: 'PROFILE_VIEW',
                details: `Recruiter viewed profile via job: ${application.Job.title}`
            });
        }

        if (application.status === 'applied') {
            application.status = 'reviewing';
            await application.save();
            await Notification.create({ recipientId: application.candidateId, recipientType: 'candidate', title: 'Resume Viewed!', message: `Recruiter viewed your application for ${application.Job.title}`, type: 'RESUME_VIEWED', relatedId: application.id });
        }
        return res.status(200).json({ success: true, application });
    } catch (error) { return res.status(500).json({ message: error.message, success: false }); }
};

// 5. Update Status (Shortlist/Reject/Hire)
export const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const application = await Application.findByPk(req.params.id, { include: [{ model: Job, as: 'Job' }] });
        application.status = status;
        await application.save();

        let title = "Application Update";
        if(status === 'shortlisted') title = "You are Shortlisted!";
        if(status === 'hired') title = "Congratulations! You are Hired";
        if(status === 'rejected') title = "Application Update";

        await Notification.create({ recipientId: application.candidateId, recipientType: 'candidate', title, message: `Your application for ${application.Job.title} is now ${status}`, type: 'STATUS_UPDATE', relatedId: application.id });
        return res.status(200).json({ success: true, message: "Status updated" });
    } catch (error) { return res.status(500).json({ message: error.message, success: false }); }
};

// 6. Schedule Interview
export const scheduleInterview = async (req, res) => {
    try {
        const { applicationId, interviewDate, interviewTime, mode, locationOrLink } = req.body;
        const application = await Application.findByPk(applicationId, { include: [{ model: Job, as: 'Job' }] });
        
        const interview = await Interview.create({ applicationId, jobId: application.jobId, candidateId: application.candidateId, companyId: req.companyId, interviewDate, interviewTime, mode, locationOrLink });
        
        application.status = 'interview_scheduled';
        await application.save();

        await Notification.create({ recipientId: application.candidateId, recipientType: 'candidate', title: 'Interview Scheduled!', message: `Interview for ${application.Job.title} on ${new Date(interviewDate).toLocaleDateString()} at ${interviewTime}`, type: 'INTERVIEW_SCHEDULED', relatedId: interview.id });
        return res.status(201).json({ success: true, message: "Interview scheduled" });
    } catch (error) { return res.status(500).json({ message: error.message, success: false }); }
};

// 7. Get Candidate Interviews
export const getCandidateInterviews = async (req, res) => {
    try {
        const interviews = await Interview.findAll({
            where: { candidateId: req.candidateId, status: 'scheduled' },
            include: [{ model: Job, as: 'Job', include: [{ model: Company, as: 'Company', attributes: ['companyName', 'logo'] }] }],
            order: [['interviewDate', 'ASC']]
        });
        return res.status(200).json({ success: true, interviews });
    } catch (error) { return res.status(500).json({ message: error.message, success: false }); }
};
