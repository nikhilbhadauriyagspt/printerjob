import express from 'express';
import { 
    registerCandidate, 
    verifyCandidateOTP, 
    loginCandidate, 
    logoutCandidate,
    googleLoginCandidate,
    updateCandidateProfile,
    parseResume,
    sendCandidatePhoneOTP,
    verifyCandidatePhoneOTP,
    getCandidateMe,
    getCandidateNotifications,
    markCandidateNotificationAsRead,
    getCandidateDashboardStats
} from '../controllers/candidate.controller.js';
import candidateAuth from '../middlewares/candidateAuth.js';
import { singleUpload, multiUpload } from '../middlewares/upload.js';

const router = express.Router();

router.post("/register", registerCandidate);
router.post("/verify-otp", verifyCandidateOTP);
router.post("/login", loginCandidate);
router.post("/google-login", googleLoginCandidate);
router.post("/parse-resume", singleUpload, parseResume); // Use singleUpload (Memory)
router.get("/logout", logoutCandidate);
router.get("/me", candidateAuth, getCandidateMe);
router.get("/dashboard-stats", candidateAuth, getCandidateDashboardStats); // 🟢 Added Dashboard Stats Route

// 🟢 Notifications
router.get("/notifications", candidateAuth, getCandidateNotifications);
router.put("/notifications/:id/read", candidateAuth, markCandidateNotificationAsRead);

// Profile Update Route
router.post("/send-phone-otp", candidateAuth, sendCandidatePhoneOTP);
router.post("/verify-phone-otp", candidateAuth, verifyCandidatePhoneOTP);
router.put("/update-profile", candidateAuth, multiUpload, updateCandidateProfile); // Use multiUpload

export default router;
