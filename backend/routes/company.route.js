import express from 'express';
import { 
    registerCompany, 
    loginCompany, 
    verifyCompanyOTP, 
    logoutCompany, 
    updateCompanyProfile, 
    getCompany, 
    getPackages, 
    resendOTP, 
    googleLogin, 
    verifyPhoneAfterGoogle, 
    setPasswordAfterGoogle, 
    sendPasswordSetupOTP, 
    fetchCompanyInfoFromUrl, 
    getCompanyNotifications, 
    markNotificationAsRead, 
    initiatePurchase, 
    verifyPayment, 
    getBillingHistory,
    talentSearch, 
    unlockCandidate, 
    getSearchSuggestions, 
    getCandidateById,
    getApplicantDetail,
    getUnlockedCandidates,
    bulkUnlockCandidates,
    updateInteraction
} from '../controllers/company.controller.js';
import jwt from 'jsonwebtoken';
import { upload } from '../middlewares/upload.js';

const router = express.Router();

// Simple Auth Middleware for Companies
const companyAuth = (req, res, next) => {
    try {
        const token = req.cookies.companyToken;
        if (!token) return res.status(401).json({ message: "Unauthorized", success: false });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.companyId = decoded.companyId;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token", success: false });
    }
};

router.post('/register', registerCompany);
router.post('/login', loginCompany);
router.post('/google-login', googleLogin);
router.post('/verify', verifyCompanyOTP);
router.post('/resend-otp', resendOTP);
router.post('/logout', logoutCompany);
router.put('/profile', companyAuth, upload.single('logo'), updateCompanyProfile);
router.get('/me', companyAuth, getCompany);
router.get('/packages', companyAuth, getPackages);

// Subscription & Billing
router.post('/purchase/initiate', companyAuth, initiatePurchase);
router.post('/purchase/verify', companyAuth, verifyPayment);
router.get('/billing', companyAuth, getBillingHistory);

// Talent Search (Advanced)
router.get('/talent-search', companyAuth, talentSearch);
router.get('/search-suggestions', companyAuth, getSearchSuggestions);
router.get('/candidate/:id', companyAuth, getCandidateById);
router.get('/applicant/:id', companyAuth, getApplicantDetail);
router.get('/unlocked-history', companyAuth, getUnlockedCandidates);
router.post('/unlock-candidate', companyAuth, unlockCandidate);
router.post('/bulk-unlock', companyAuth, bulkUnlockCandidates);
router.post('/update-interaction', companyAuth, updateInteraction);

// Notifications
router.get('/notifications', companyAuth, getCompanyNotifications);
router.put('/notifications/:id/read', companyAuth, markNotificationAsRead);

// New Google-Specific routes
router.post('/send-password-otp', companyAuth, sendPasswordSetupOTP);
router.post('/verify-phone-google', companyAuth, verifyPhoneAfterGoogle);
router.post('/set-password-google', companyAuth, setPasswordAfterGoogle);
router.post('/fetch-info', companyAuth, fetchCompanyInfoFromUrl);

export default router;
