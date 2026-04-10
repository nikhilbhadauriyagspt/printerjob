import express from 'express';
import { sendMessage, getMessages, getChatList } from '../controllers/message.controller.js';
import adminAuth from '../middlewares/adminAuth.js';
import companyAuth from '../middlewares/companyAuth.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// 🟢 Improved Universal Auth to handle dual-session browsers
const universalAuth = (req, res, next) => {
    const adminToken = req.cookies?.adminToken;
    const companyToken = req.cookies?.companyToken;
    
    // Optional chaining to prevent crash if body/query is undefined
    const requestedRole = req.body?.role || req.query?.role;
    console.log(`AUTH: RequestedRole=${requestedRole}, HasAdminToken=${!!adminToken}, HasCompanyToken=${!!companyToken}`);

    if (requestedRole === 'admin' && adminToken) {
        try {
            const decoded = jwt.verify(adminToken, process.env.JWT_SECRET);
            req.adminId = decoded.adminId;
            console.log(`AUTH: Verified as ADMIN`);
            return next();
        } catch (e) {
            console.log(`AUTH: Admin token verification failed`);
        }
    }

    if (requestedRole === 'company' && companyToken) {
        try {
            const decoded = jwt.verify(companyToken, process.env.JWT_SECRET);
            req.companyId = decoded.companyId;
            console.log(`AUTH: Verified as COMPANY`);
            return next();
        } catch (e) {
            console.log(`AUTH: Company token verification failed`);
        }
    }

    // Fallback if no specific role requested or verification failed
    if (adminToken) {
        try {
            const decoded = jwt.verify(adminToken, process.env.JWT_SECRET);
            req.adminId = decoded.adminId;
            console.log(`AUTH: Fallback Verified as ADMIN`);
            return next();
        } catch (e) {}
    }

    if (companyToken) {
        try {
            const decoded = jwt.verify(companyToken, process.env.JWT_SECRET);
            req.companyId = decoded.companyId;
            console.log(`AUTH: Fallback Verified as COMPANY`);
            return next();
        } catch (e) {}
    }

    console.log(`AUTH: No valid token found`);
    return res.status(401).json({ message: "Not authenticated", success: false });
};

router.post('/send', universalAuth, sendMessage);
router.get('/chat/:otherId', universalAuth, getMessages);
router.get('/admin/chats', adminAuth, getChatList);

export default router;
