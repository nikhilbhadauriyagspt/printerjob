import express from 'express';
import { getAdmin, loginAdmin, logoutAdmin, registerAdmin, getAllCompanies, toggleCompanyStatus, getCompanyActivityHistory, getCompanyBillingHistory, assignCustomPlan, onboardRecruiter, bulkUploadSuggestions, addSuggestion, getSuggestions, getAllJobs, getAdminNotifications, markNotificationAsRead, getCompanyJobs, toggleSupportStatus, getSystemConfig, createPackage, getAdminPackages, updateFreeAccessSettings, updatePaymentSettings, updatePackage, deletePackage } from '../controllers/admin.controller.js';
import adminAuth from '../middlewares/adminAuth.js';

const router = express.Router();

// Auth
router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.get('/logout', logoutAdmin);
router.get('/me', adminAuth, getAdmin);

// Recruiter Management
router.get('/companies', adminAuth, getAllCompanies);
router.put('/companies/:id/status', adminAuth, toggleCompanyStatus);
router.post('/companies/onboard', adminAuth, onboardRecruiter);
router.get('/companies/:id/jobs', adminAuth, getCompanyJobs);
router.get('/companies/:id/history', adminAuth, getCompanyActivityHistory);
router.get('/companies/:id/billing', adminAuth, getCompanyBillingHistory);
router.post('/companies/:id/assign-plan', adminAuth, assignCustomPlan);

// Job Management
router.get('/jobs', adminAuth, getAllJobs);

// System Config
router.get('/config', getSystemConfig);
router.put('/config/support', adminAuth, toggleSupportStatus);
router.put('/config/free-access', adminAuth, updateFreeAccessSettings);
router.put('/config/payment', adminAuth, updatePaymentSettings);

// Packages
router.post('/packages', adminAuth, createPackage);
router.get('/packages', adminAuth, getAdminPackages);
router.put('/packages/:id', adminAuth, updatePackage);
router.delete('/packages/:id', adminAuth, deletePackage);

// Notifications
router.get('/notifications', adminAuth, getAdminNotifications);
router.put('/notifications/:id/read', adminAuth, markNotificationAsRead);

// Suggestions Management
router.post('/suggestions/bulk', adminAuth, bulkUploadSuggestions);
router.post('/suggestions/add', adminAuth, addSuggestion);
router.get('/suggestions', getSuggestions);

export default router;
