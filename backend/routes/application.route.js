import express from 'express';
import { applyJob, getAppliedJobs, getApplicants, updateStatus, getApplicationDetails, scheduleInterview, getCandidateInterviews } from '../controllers/application.controller.js';
import candidateAuth from '../middlewares/candidateAuth.js';
import companyAuth from '../middlewares/companyAuth.js';

const router = express.Router();

router.post('/apply', candidateAuth, applyJob);
router.get('/applied', candidateAuth, getAppliedJobs);
router.get('/candidate-interviews', candidateAuth, getCandidateInterviews);
router.get('/details/:id', companyAuth, getApplicationDetails);
router.get('/:jobId/applicants', companyAuth, getApplicants);
router.put('/status/:id', companyAuth, updateStatus);
router.post('/schedule-interview', companyAuth, scheduleInterview);

export default router;
