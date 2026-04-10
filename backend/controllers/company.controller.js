import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Company from '../models/company.model.js';
import OTP from '../models/otp.model.js';
import Industry from '../models/industry.model.js';
import Designation from '../models/designation.model.js';
import Notification from '../models/notification.model.js';
import { sendEmail, getOTPEmailTemplate, getWelcomeEmailTemplate, getProfileSuccessTemplate } from '../utils/emailService.js';
import { Op } from 'sequelize';
import axios from 'axios';
import { OAuth2Client } from 'google-auth-library';
import { logActivity } from '../utils/logger.js';

// Helper for generating 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// 1. Google Login/Signup
export const googleLogin = async (req, res) => {
    try {
        const { idToken } = req.body || {};
        if (!idToken) return res.status(400).json({ message: "No token provided", success: false });

        const { email, name, picture } = req.body.userData || {}; 

        let company = await Company.findOne({ where: { email } });
        let isNew = false;

        if (company) {
            if (!company.allowGoogleLogin) {
                return res.status(403).json({ 
                    message: "Security: Google Login is disabled for this account. Please use Email/Password.", 
                    success: false 
                });
            }
        } else {
            isNew = true;
            company = await Company.create({
                companyName: name || "New Company",
                email,
                isGoogleUser: true,
                isEmailVerified: true,
                status: 'pending',
                logo: picture
            });

            // 🟢 Notify Admin about new Google registration
            await Notification.create({
                recipientId: '00000000-0000-0000-0000-000000000000',
                recipientType: 'admin',
                title: 'New Recruiter Signup (Google)',
                message: `${name || email} has registered via Google and is pending verification.`,
                type: 'COMPANY_REGISTERED',
                relatedId: company.id
            });
        }

        const token = jwt.sign({ companyId: company.id, role: 'company' }, process.env.JWT_SECRET, { expiresIn: '7d' });

        // Log Action
        await logActivity({ 
            companyId: company.id, 
            action: isNew ? 'GOOGLE_SIGNUP' : 'LOGIN_GOOGLE', 
            details: isNew ? 'Created account via Google' : 'Logged in via Google Authentication',
            req 
        });

        return res.status(200).cookie("companyToken", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production'
        }).json({
            message: `Welcome ${company.companyName}`,
            success: true,
            company: { 
                id: company.id, 
                companyName: company.companyName, 
                status: company.status,
                isPhoneVerified: company.isPhoneVerified,
                allowGoogleLogin: company.allowGoogleLogin,
                isGoogleUser: company.isGoogleUser
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Google Login Error", success: false });
    }
};

// 2. Verify Phone after Google Login
export const verifyPhoneAfterGoogle = async (req, res) => {
    try {
        const { phoneNumber, otp } = req.body || {};
        const companyId = req.companyId;

        if (otp !== "123456") return res.status(400).json({ message: "Invalid OTP", success: false });

        const company = await Company.findByPk(companyId);
        if (!company) return res.status(404).json({ message: "Not found", success: false });

        company.phoneNumber = phoneNumber;
        company.isPhoneVerified = true;
        company.status = 'profile_incomplete';
        await company.save();

        // Log Action
        await logActivity({ 
            companyId: company.id, 
            action: 'PHONE_VERIFIED', 
            details: `Phone number ${phoneNumber} verified via Google Flow`,
            req 
        });

        try {
            await sendEmail({
                to: company.email,
                subject: "Welcome to JobPortal - Account Verified",
                html: getWelcomeEmailTemplate(company.companyName, company.email)
            });
        } catch (emailErr) {
            console.error("Welcome email failed for Google user:", emailErr);
        }

        return res.status(200).json({ message: "Phone verified successfully", success: true, company });
    } catch (err) {
        res.status(500).json({ message: "Phone Verification Error", success: false });
    }
};

// 3. Fetch Company Info from URL
export const fetchCompanyInfoFromUrl = async (req, res) => {
    try {
        let { url } = req.body || {};
        if (!url) return res.status(400).json({ message: "URL is required", success: false });

        if (!url.startsWith('http')) url = `https://${url}`;

        const response = await axios.get(url, { 
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 5000 
        });
        const html = response.data;

        const getMeta = (metaName) => {
            const regex = new RegExp(`<meta.*?property=["'](?:og:)?${metaName}["'].*?content=["'](.*?)["']`, 'i');
            const match = html.match(regex);
            return match ? match[1] : null;
        };

        const getLogo = () => {
            const baseUrl = new URL(url).origin;
            const ogImage = html.match(/<meta.*?property=["']og:image["'].*?content=["'](.*?)["']/i);
            if (ogImage) return ogImage[1];
            const linkIcon = html.match(/<link.*?rel=["'](?:shortcut )?icon["'].*?href=["'](.*?)["']/i);
            if (linkIcon) {
                let iconUrl = linkIcon[1];
                return iconUrl.startsWith('http') ? iconUrl : new URL(iconUrl, baseUrl).href;
            }
            return `${baseUrl}/favicon.ico`;
        };

        const titleRegex = /<title>(.*?)<\/title>/i;
        const titleMatch = html.match(titleRegex);

        const companyInfo = {
            companyName: getMeta('site_name') || (titleMatch ? titleMatch[1].split('|')[0].trim() : ""),
            description: getMeta('description') || "",
            logo: getLogo()
        };

        return res.status(200).json({ success: true, companyInfo });
    } catch (err) {
        res.status(500).json({ message: "Could not fetch data", success: false });
    }
};

// 4. Send OTP for Password Setup
export const sendPasswordSetupOTP = async (req, res) => {
    try {
        const company = await Company.findByPk(req.companyId);
        if (!company) return res.status(404).json({ message: "Company not found", success: false });

        const emailOTP = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await OTP.create({
            companyId: company.id,
            emailOTP,
            phoneOTP: "000000",
            expiresAt
        });

        await sendEmail({
            to: company.email,
            subject: "Security: OTP for Password Setup",
            html: getOTPEmailTemplate(emailOTP)
        });

        return res.status(200).json({ message: "OTP sent to your email", success: true });
    } catch (err) {
        res.status(500).json({ message: "Error sending OTP", success: false });
    }
};

// 5. Set Password & Disable Google Login
export const setPasswordAfterGoogle = async (req, res) => {
    try {
        const { password, otp } = req.body || {};
        const companyId = req.companyId;

        const otpRecord = await OTP.findOne({
            where: {
                companyId,
                emailOTP: otp,
                expiresAt: { [Op.gt]: new Date() },
                isVerified: false
            },
            order: [['createdAt', 'DESC']]
        });

        if (!otpRecord) {
            return res.status(400).json({ message: "Invalid or expired OTP", success: false });
        }

        const company = await Company.findByPk(companyId);
        const hashedPassword = await bcrypt.hash(password, 10);

        company.password = hashedPassword;
        company.isGoogleUser = false;
        company.allowGoogleLogin = false;
        await company.save();

        otpRecord.isVerified = true;
        await otpRecord.save();

        // Log Action
        await logActivity({ 
            companyId: company.id, 
            action: 'PASSWORD_SET', 
            details: 'Account converted to manual Email/Password login',
            req 
        });

        return res.status(200).json({ message: "Password set successfully.", success: true });
    } catch (err) {
        res.status(500).json({ message: "Error setting password", success: false });
    }
};

// 6. Initial Signup
export const registerCompany = async (req, res) => {
    try {
        const { companyName, email, phoneNumber, password } = req.body || {};
        if (!companyName || !email || !phoneNumber || !password) {
            return res.status(400).json({ message: "All fields required", success: false });
        }

        const existingCompany = await Company.findOne({ where: { [Op.or]: [{ email }, { phoneNumber }] } });
        if (existingCompany) return res.status(400).json({ message: "Email/Phone already exists", success: false });

        const hashedPassword = await bcrypt.hash(password, 10);
        const company = await Company.create({
            companyName, email, phoneNumber, password: hashedPassword, status: 'pending', profileCompletionScore: 0
        });

        const emailOTP = generateOTP();
        const phoneOTP = "123456";
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await OTP.create({ companyId: company.id, emailOTP, phoneOTP, expiresAt });

        // Log Action
        await logActivity({ companyId: company.id, action: 'REGISTER', details: 'Initial registration initiated', req });

        // 🟢 Notify Admin about new registration
        await Notification.create({
            recipientId: '00000000-0000-0000-0000-000000000000',
            recipientType: 'admin',
            title: 'New Recruiter Signup',
            message: `${companyName} has registered and is pending verification.`,
            type: 'COMPANY_REGISTERED',
            relatedId: company.id
        });

        try {
            await sendEmail({ to: email, subject: "Verify Account", html: getOTPEmailTemplate(emailOTP) });
        } catch (err) { console.error(err); }

        return res.status(201).json({ message: "OTP sent to email.", success: true, companyId: company.id });
    } catch (err) {
        res.status(500).json({ message: "Registration Error", success: false });
    }
};

// 7. Verify OTPs
export const verifyCompanyOTP = async (req, res) => {
    try {
        const { companyId, emailOTP, phoneOTP } = req.body || {};
        const company = await Company.findByPk(companyId);
        if (!company) return res.status(404).json({ message: "Not found", success: false });

        const otpRecord = await OTP.findOne({
            where: { companyId, expiresAt: { [Op.gt]: new Date() }, isVerified: false },
            order: [['createdAt', 'DESC']]
        });

        if (!otpRecord || otpRecord.emailOTP !== emailOTP || otpRecord.phoneOTP !== phoneOTP) {
            return res.status(400).json({ message: "Invalid OTP", success: false });
        }

        otpRecord.isVerified = true;
        await otpRecord.save();

        company.isEmailVerified = true;
        company.isPhoneVerified = true;
        company.status = 'profile_incomplete';
        await company.save();

        // Log Action
        await logActivity({ companyId: company.id, action: 'ACCOUNT_VERIFIED', details: 'Email and Phone verified successfully', req });

        const token = jwt.sign({ companyId: company.id, role: 'company' }, process.env.JWT_SECRET, { expiresIn: '7d' });

        return res.status(200).cookie("companyToken", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production'
        }).json({
            message: "Verified successfully", success: true, company: { 
                id: company.id, 
                companyName: company.companyName, 
                status: company.status,
                allowGoogleLogin: company.allowGoogleLogin,
                isGoogleUser: company.isGoogleUser
            }
        });
    } catch (err) {
        res.status(500).json({ message: "Verification Error", success: false });
    }
};

// 8. Update Profile
export const updateCompanyProfile = async (req, res) => {
    try {
        const companyId = req.companyId;
        const updates = req.body || {};
        
        // Fix: Save Fetched Logo URL if no manual file is uploaded
        if (req.file) {
            updates.logo = req.file.path;
        } else if (updates.logo && updates.logo.startsWith('http')) {
            // Keep the logo URL from body
        }

        if (updates.socialLinks && typeof updates.socialLinks === 'string') {
            try { updates.socialLinks = JSON.parse(updates.socialLinks); } catch (err) {}
        }

        const company = await Company.findByPk(companyId);
        if (!company) return res.status(404).json({ message: "Not found", success: false });

        const oldScore = company.profileCompletionScore;
        
        let fieldsFilled = 0;
        const checkField = (f) => updates[f] || company[f];
        if (checkField('contactPersonName') && checkField('designation')) fieldsFilled++;
        if (checkField('industry')) fieldsFilled++;
        if (checkField('companySize') && checkField('companyType')) fieldsFilled++;
        if (checkField('website')) fieldsFilled++;
        if (checkField('description')) fieldsFilled++;
        if (checkField('logo')) fieldsFilled++;
        if (checkField('city') && checkField('state') && checkField('address')) fieldsFilled++;
        if (checkField('pincode') && checkField('country')) fieldsFilled++;
        if (checkField('gstNumber') || checkField('panNumber')) fieldsFilled++;
        
        const currentSocialLinks = updates.socialLinks || company.socialLinks || {};
        if (Object.keys(currentSocialLinks).length > 0) fieldsFilled++;

        const score = Math.min((fieldsFilled / 10) * 100, 100);
        
        // Status protection: 
        // 1. If already ACTIVE, keep it ACTIVE (Admin approved once, stay approved)
        // 2. If already REJECTED, keep it REJECTED (Don't let user unblock self)
        // 3. Only auto-activate if currently INCOMPLETE and reaches 80%+
        let newStatus = company.status;
        let trialExpiresAt = company.trialExpiresAt;
        let planType = company.planType;
        let jobPostingLimit = company.jobPostingLimit;

        if (company.status === 'profile_incomplete' && score >= 80) {
            newStatus = 'active';
            
            // 🟢 Handle Trial Activation (Triggered at 80% Completion)
            const SystemConfig = (await import('../models/systemConfig.model.js')).default;
            const config = await SystemConfig.findOne({ where: { key: 'DEFAULT_FREE_MONTHS' } });
            const freeMonths = config ? parseInt(config.value) : 6; // Default 6 months if not set

            const expiryDate = new Date();
            expiryDate.setMonth(expiryDate.getMonth() + freeMonths);
            
            trialExpiresAt = expiryDate;
            planType = 'trial';
            jobPostingLimit = -1; // Unlimited during trial

            try {
                const { getTrialActivationTemplate } = await import('../utils/emailService.js');
                await sendEmail({ 
                    to: company.email, 
                    subject: "Free Access Activated - Welcome to JobPortal!", 
                    html: getTrialActivationTemplate(company.companyName, expiryDate, freeMonths) 
                });
            } catch (err) {
                console.error("Trial activation email failed:", err);
            }
        }

        await company.update({ 
            ...updates, 
            profileCompletionScore: score,
            status: newStatus,
            trialExpiresAt: trialExpiresAt || company.trialExpiresAt,
            planType: planType || company.planType,
            jobPostingLimit: jobPostingLimit !== undefined ? jobPostingLimit : company.jobPostingLimit
        });

        // 🟢 Dynamic Industry/Designation Sync
        if (updates.industry) {
            const [ind, created] = await Industry.findOrCreate({
                where: { name: updates.industry.trim() },
                defaults: { isApproved: false, createdBy: companyId }
            });
            if (created) {
                await logActivity({ companyId, action: 'NEW_INDUSTRY_SUGGESTED', details: `Suggested new industry: ${updates.industry}`, req });
            }
        }

        if (updates.designation) {
            const [des, created] = await Designation.findOrCreate({
                where: { name: updates.designation.trim() },
                defaults: { isApproved: false, createdBy: companyId }
            });
            if (created) {
                await logActivity({ companyId, action: 'NEW_DESIGNATION_SUGGESTED', details: `Suggested new designation: ${updates.designation}`, req });
            }
        }

        // Log Action
        await logActivity({ 
            companyId: company.id, 
            action: 'PROFILE_UPDATE', 
            details: `Profile updated (Score: ${score}%, Status: ${newStatus})`,
            req 
        });

        return res.status(200).json({ message: "Updated", success: true, company, profileCompletionScore: score });
    } catch (err) {
        res.status(500).json({ message: "Update Error", success: false });
    }
};

// 9. Login
export const loginCompany = async (req, res) => {
    try {
        const { email, password } = req.body || {};
        const company = await Company.findOne({ where: { email } });
        if (!company || !(await bcrypt.compare(password, company.password))) {
            return res.status(400).json({ message: "Invalid credentials", success: false });
        }

        if (company.status === 'rejected') return res.status(403).json({ message: "Access restricted", success: false });

        const token = jwt.sign({ companyId: company.id, role: 'company' }, process.env.JWT_SECRET, { expiresIn: '7d' });

        // Log Action
        await logActivity({ companyId: company.id, action: 'LOGIN', details: 'Logged in via Email/Password', req });

        return res.status(200).cookie("companyToken", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production'
        }).json({
            message: `Welcome ${company.companyName}`, success: true, company: { 
                id: company.id, 
                companyName: company.companyName, 
                status: company.status,
                allowGoogleLogin: company.allowGoogleLogin,
                isGoogleUser: company.isGoogleUser
            }
        });
    } catch (err) {
        res.status(500).json({ message: "Login Error", success: false });
    }
};

export const logoutCompany = async (req, res) => {
    try {
        return res.status(200).cookie("companyToken", "", { maxAge: 0 }).json({ message: "Logged out", success: true });
    } catch (err) { res.status(500).json({ message: "Error", success: false }); }
};

import Transaction from '../models/transaction.model.js';
import Package from '../models/package.model.js';
import Job from '../models/job.model.js';

export const getCompany = async (req, res) => {
    try {
        const company = await Company.findByPk(req.companyId);
        if (!company) return res.status(404).json({ message: "Not found", success: false });

        // 🟢 Self-Healing: If plan is active but date is missing, fix it now
        if (company.planType !== 'none' && !company.trialExpiresAt && !company.planExpiresAt) {
            const SystemConfig = (await import('../models/systemConfig.model.js')).default;
            const config = await SystemConfig.findOne({ where: { key: 'DEFAULT_FREE_MONTHS' } });
            const freeMonths = config ? parseInt(config.value) : 6;

            const expiryDate = new Date();
            expiryDate.setMonth(expiryDate.getMonth() + freeMonths);

            company.trialExpiresAt = expiryDate;
            company.jobPostingLimit = -1;
            await company.save();
        }

        // 🟢 Calculate Job Usage Stats
        const jobsUsed = await Job.count({ 
            where: { companyId: req.companyId, status: { [Op.ne]: 'draft' } } 
        });

        const stats = {
            jobsUsed,
            jobLimit: company.jobPostingLimit,
            jobsRemaining: company.jobPostingLimit === -1 ? 'Unlimited' : Math.max(0, company.jobPostingLimit - jobsUsed),
            planName: company.planType === 'trial' ? 'Free Trial' : (company.planType === 'premium' ? 'Premium Plan' : 'No Plan'),
            expiryDate: company.planType === 'trial' ? company.trialExpiresAt : company.planExpiresAt
        };

        return res.status(200).json({ company, stats, success: true });
    } catch (error) { 
        res.status(500).json({ message: "Error", success: false }); 
    }
};

import SystemConfig from '../models/systemConfig.model.js';

// 🟢 Initiate Purchase (Create Payment Order)
export const initiatePurchase = async (req, res) => {
    try {
        const { packageId } = req.body;
        const company = await Company.findByPk(req.companyId);
        const pkg = await Package.findByPk(packageId);
        const config = await SystemConfig.findOne();

        if (!company || !pkg) return res.status(404).json({ message: "Data not found", success: false });

        if (!config || config.activeGateway === 'none') {
            return res.status(400).json({ message: "Payments are currently disabled by administrator", success: false });
        }

        // 1. Check Plan Eligibility (Same logic as before)
        const now = new Date();
        const isPlanActive = company.planType === 'premium' && company.planExpiresAt && company.planExpiresAt > now;

        if (isPlanActive && pkg.tier < company.currentPackageTier) {
            return res.status(400).json({ message: `Downgrades are only possible after your current plan expires.`, success: false });
        }

        if (isPlanActive && pkg.tier === company.currentPackageTier) {
            const daysLeft = Math.ceil((new Date(company.planExpiresAt) - now) / (1000 * 60 * 60 * 24));
            if (daysLeft > 5) {
                return res.status(400).json({ message: `You can renew your plan when you have less than 5 days left.`, success: false });
            }
        }

        // 2. Prepare Payment Details
        const orderData = {
            packageId: pkg.id,
            amount: pkg.price,
            currency: config.currency || 'INR',
            gateway: config.activeGateway, // razorpay, paypal, both, none
            mode: config.paymentMode, // sandbox or live
            keys: {
                razorpayKeyId: config.razorpayKeyId,
                paypalClientId: config.paypalClientId
            }
        };

        return res.status(200).json({ 
            success: true, 
            orderData,
            message: "Payment initiated successfully" 
        });

    } catch (error) {
        console.error("Initiate Purchase Error:", error);
        return res.status(500).json({ message: "Failed to initiate payment", success: false });
    }
};

// 🟢 Verify and Complete Purchase (Finalize Plan)
export const verifyPayment = async (req, res) => {
    try {
        const { packageId, paymentId, gateway } = req.body;
        const company = await Company.findByPk(req.companyId);
        const pkg = await Package.findByPk(packageId);
        const config = await SystemConfig.findOne();

        if (!company || !pkg) return res.status(404).json({ message: "Data not found", success: false });

        const now = new Date();
        const isPlanActive = company.planType === 'premium' && company.planExpiresAt && company.planExpiresAt > now;

        let currentExpiry;
        if (isPlanActive && pkg.tier === company.currentPackageTier) {
            currentExpiry = new Date(company.planExpiresAt);
        } else {
            currentExpiry = new Date();
        }
        currentExpiry.setDate(currentExpiry.getDate() + pkg.durationDays);

        // Create Transaction History
        const transaction = await Transaction.create({
            companyId: company.id,
            packageName: pkg.name,
            amount: pkg.price,
            durationDays: pkg.durationDays,
            jobLimit: pkg.jobLimit,
            status: 'success', 
            paymentId: paymentId || `PAY-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        });

        // Update Company Plan
        await company.update({
            planType: 'premium',
            planExpiresAt: currentExpiry,
            currentPackageId: pkg.id,
            currentPackageTier: pkg.tier,
            jobPostingLimit: pkg.jobLimit === -1 ? -1 : (company.jobPostingLimit === -1 ? pkg.jobLimit : company.jobPostingLimit + pkg.jobLimit)
        });

        // Log Activity
        await logActivity({ 
            companyId: company.id, 
            action: 'PURCHASE_SUCCESS', 
            details: `Purchased ${pkg.name} via ${gateway}. Transaction: ${transaction.paymentId}`,
            req 
        });

        // 🟢 1. Notify Admin about Payment (Full Details)
        await Notification.create({
            recipientId: '00000000-0000-0000-0000-000000000000', 
            recipientType: 'admin',
            title: pkg.tier > company.currentPackageTier ? 'Premium Plan Upgrade' : 'New Subscription Purchased',
            message: `${company.companyName} has paid ${config?.currency || 'INR'} ${pkg.price} for "${pkg.name}" plan via ${gateway.toUpperCase()}. (Transaction ID: ${transaction.paymentId})`,
            type: 'PAYMENT_RECEIVED',
            relatedId: transaction.id
        });

        // 🟢 2. Send Confirmation Email to Recruiter
        try {
            const { getPaymentSuccessTemplate } = await import('../utils/emailService.js');
            await sendEmail({
                to: company.email,
                subject: "Payment Confirmed - Your Plan is now Active",
                html: getPaymentSuccessTemplate(
                    company.companyName, 
                    pkg.name, 
                    pkg.price, 
                    config?.currency || 'INR', 
                    transaction.paymentId, 
                    currentExpiry
                )
            });
        } catch (emailErr) {
            console.error("Purchase confirmation email failed:", emailErr.message);
        }

        return res.status(200).json({ 
            message: pkg.tier > company.currentPackageTier ? `Successfully upgraded to ${pkg.name}` : `Successfully recharged with ${pkg.name}`, 
            success: true,
            transaction 
        });

    } catch (error) {
        console.error("Verify Payment Error:", error);
        return res.status(500).json({ message: "Verification failed", success: false });
    }
};

// 🟢 Get Billing History
export const getBillingHistory = async (req, res) => {
    try {
        const history = await Transaction.findAll({
            where: { companyId: req.companyId },
            order: [['createdAt', 'DESC']]
        });
        return res.status(200).json({ success: true, history });
    } catch (error) {
        return res.status(500).json({ success: false });
    }
};

// 🟢 Get All Active Packages (For Recruiters)
export const getPackages = async (req, res) => {
    try {
        const packages = await Package.findAll({ 
            where: { isActive: true },
            order: [['tier', 'ASC']]
        });
        return res.status(200).json({ success: true, packages });
    } catch (error) {
        return res.status(500).json({ success: false });
    }
};

export const resendOTP = async (req, res) => {
    try {
        const { companyId } = req.body || {};
        const company = await Company.findByPk(companyId);
        const emailOTP = generateOTP();
        await OTP.create({ companyId, emailOTP, phoneOTP: "123456", expiresAt: new Date(Date.now() + 5 * 60 * 1000) });
        await sendEmail({ to: company.email, subject: "Resend OTP", html: getOTPEmailTemplate(emailOTP) });
        return res.status(200).json({ message: "Sent", success: true });
    } catch (error) { res.status(500).json({ message: "Error", success: false }); }
};

// 🟢 Company: Get Notifications
export const getCompanyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            where: { recipientId: req.companyId, recipientType: 'company' },
            order: [['createdAt', 'DESC']],
            limit: 20
        });
        return res.status(200).json({ success: true, notifications });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching notifications", success: false });
    }
};

// 🟢 Company: Mark Notification as Read
export const markNotificationAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        await Notification.update({ isRead: true }, { where: { id, recipientId: req.companyId } });
        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({ message: "Error updating notification", success: false });
    }
};
