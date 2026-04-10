import express from 'express';
import { createJob, updateJob, getRecruiterJobs, adminReviewJob, getJobById, deleteJob } from '../controllers/job.controller.js';
import companyAuth from '../middlewares/companyAuth.js';
import adminAuth from '../middlewares/adminAuth.js';

const router = express.Router();

// Recruiter Endpoints
router.post('/create', companyAuth, createJob);
router.put('/update/:id', companyAuth, updateJob);
router.delete('/delete/:id', companyAuth, deleteJob);
router.get('/recruiter-jobs', companyAuth, getRecruiterJobs);

// Admin Endpoints
router.post('/admin/review', adminAuth, adminReviewJob);

// Public Endpoints
router.get('/get/:id', getJobById);

export default router;
