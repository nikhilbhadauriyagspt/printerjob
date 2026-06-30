import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sequelize } from '../config/db.js';
import Company from '../models/company.model.js';
import Candidate from '../models/candidate.model.js';
import OTP from '../models/otp.model.js';
import Industry from '../models/industry.model.js';
import Designation from '../models/designation.model.js';
import Skill from '../models/skill.model.js';
import JobTitle from '../models/jobTitle.model.js';
import Notification from '../models/notification.model.js';
import Transaction from '../models/transaction.model.js';
import Package from '../models/package.model.js';
import Job from '../models/job.model.js';
import Application from '../models/application.model.js';
import SystemConfig from '../models/systemConfig.model.js';
import { sendEmail, getOTPEmailTemplate, getWelcomeEmailTemplate, getProfileSuccessTemplate, getTrialActivationTemplate, getPaymentSuccessTemplate } from '../utils/emailService.js';
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
        const { userData } = req.body || {}; 
        if (!userData) return res.status(400).json({ message: "No user data found", success: false });

        const { email, name, picture } = userData; 

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

        const token = jwt.sign({ companyId: company.id, role: 'company' }, process.env.JWT_SECRET, { expiresIn: '30d' });

        // Log Action
        await logActivity({ 
            companyId: company.id, 
            action: isNew ? 'GOOGLE_SIGNUP' : 'LOGIN_GOOGLE', 
            details: isNew ? 'Created account via Google' : 'Logged in via Google Authentication',
            req 
        });

        return res.status(200).cookie("companyToken", token, {
            maxAge: 30 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: 'lax',
            secure: false
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

        const token = jwt.sign({ companyId: company.id, role: 'company' }, process.env.JWT_SECRET, { expiresIn: '30d' });

        return res.status(200).cookie("companyToken", token, {
            maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'lax', secure: false
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
        
        const company = await Company.findByPk(companyId);
        if (!company) return res.status(404).json({ message: "Not found", success: false });

        if (req.file) {
            updates.logo = req.file.path;
        }

        if (updates.socialLinks && typeof updates.socialLinks === 'string') {
            try { updates.socialLinks = JSON.parse(updates.socialLinks); } catch (err) {}
        }

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
        
        let newStatus = company.status;
        let trialExpiresAt = company.trialExpiresAt;
        let planType = company.planType;
        let jobPostingLimit = company.jobPostingLimit;

        if (company.status === 'profile_incomplete' && score >= 80) {
            newStatus = 'active';
            
            const config = await SystemConfig.findOne();
            const freeMonths = config ? (config.defaultFreeMonths || 6) : 6; 

            const expiryDate = new Date();
            expiryDate.setMonth(expiryDate.getMonth() + freeMonths);
            
            trialExpiresAt = expiryDate;
            planType = 'trial';
            jobPostingLimit = -1;

            try {
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
            trialExpiresAt,
            planType,
            jobPostingLimit
        });

        if (updates.industry) {
            await Industry.findOrCreate({
                where: { name: updates.industry.trim() },
                defaults: { isApproved: false, createdBy: companyId }
            });
        }

        if (updates.designation) {
            await Designation.findOrCreate({
                where: { name: updates.designation.trim() },
                defaults: { isApproved: false, createdBy: companyId }
            });
        }

        await logActivity({ 
            companyId: company.id, 
            action: 'PROFILE_UPDATE', 
            details: `Profile updated (Score: ${score}%, Status: ${newStatus})`,
            req 
        });

        return res.status(200).json({ message: "Updated", success: true, company, profileCompletionScore: score });
    } catch (err) {
        console.error("Update Error:", err);
        res.status(500).json({ message: "Update Error", success: false, error: err.message });
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

        const token = jwt.sign({ companyId: company.id, role: 'company' }, process.env.JWT_SECRET, { expiresIn: '30d' });

        return res.status(200).cookie("companyToken", token, {
            maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'lax', secure: false
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

// 🟢 Get Search Suggestions (Skills, Industries, Designations, Locations)
export const getSearchSuggestions = async (req, res) => {
    try {
        const { query, type } = req.query;
        if (!query || query.length < 2) return res.status(200).json({ success: true, suggestions: [] });

        if (type === 'location') {
            const locations = await Candidate.findAll({
                where: { currentLocation: { [Op.like]: `%${query}%` } },
                attributes: [[sequelize.fn('DISTINCT', sequelize.col('currentLocation')), 'name']],
                limit: 5
            });
            return res.status(200).json({ success: true, suggestions: locations.map(l => ({ name: l.get('name'), type: 'Location' })) });
        }

        const [skills, industries, designations, jobTitles] = await Promise.all([
            Skill.findAll({ 
                where: { name: { [Op.like]: `%${query}%` } }, 
                limit: 5, 
                attributes: ['name'] 
            }),
            Industry.findAll({ 
                where: { name: { [Op.like]: `%${query}%` }, isApproved: true }, 
                limit: 3, 
                attributes: ['name'] 
            }),
            Designation.findAll({ 
                where: { name: { [Op.like]: `%${query}%` }, isApproved: true }, 
                limit: 3, 
                attributes: ['name'] 
            }),
            JobTitle.findAll({ 
                where: { name: { [Op.like]: `%${query}%` }, isApproved: true }, 
                limit: 3, 
                attributes: ['name'] 
            })
        ]);

        const suggestions = [
            ...skills.map(s => ({ name: s.name, type: 'Skill' })),
            ...industries.map(i => ({ name: i.name, type: 'Industry' })),
            ...designations.map(d => ({ name: d.name, type: 'Designation' })),
            ...jobTitles.map(jt => ({ name: jt.name, type: 'Role' }))
        ];

        return res.status(200).json({ success: true, suggestions });
    } catch (error) {
        return res.status(500).json({ success: false });
    }
};

// 🟢 Helper: Parse Boolean Search Query
const parseBooleanQuery = (query, sequelize, Op) => {
    if (!query) return null;

    // Standardize query: Uppercase operators
    let cleanQuery = query.replace(/\b(and|or|not)\b/gi, (match) => match.toUpperCase());

    // If no boolean operators found, treat as comma-separated OR (Existing behavior)
    if (!/\b(AND|OR|NOT)\b/.test(cleanQuery)) {
        const terms = cleanQuery.split(',').map(t => t.trim()).filter(t => t.length > 0);
        if (terms.length === 0) return null;
        
        return {
            [Op.or]: terms.map(token => ({
                [Op.or]: [
                    { fullName: { [Op.like]: `%${token}%` } },
                    { headline: { [Op.like]: `%${token}%` } },
                    { bio: { [Op.like]: `%${token}%` } },
                    { industry: { [Op.like]: `%${token}%` } },
                    { designation: { [Op.like]: `%${token}%` } },
                    { resumeText: { [Op.like]: `%${token}%` } },
                    sequelize.where(sequelize.fn('LOWER', sequelize.col('Candidate.skills')), 'LIKE', `%${token.toLowerCase()}%`)
                ]
            }))
        };
    }

    // Advanced Boolean Logic Parser (Handles AND, OR, NOT)
    const tokens = cleanQuery.match(/\(|\)|"([^"]+)"|'([^']+)'|[^\s()]+/g) || [];
    const andGroups = [];
    let currentOrGroup = [];
    let isNot = false;

    tokens.forEach(token => {
        if (token === 'AND') return; // AND is implicit in groups
        if (token === 'OR') {
            if (currentOrGroup.length > 0) {
                andGroups.push({ [Op.or]: currentOrGroup });
                currentOrGroup = [];
            }
            return;
        }
        if (token === 'NOT') {
            isNot = true;
            return;
        }

        const cleanToken = token.replace(/['"]/g, '');
        const condition = {
            [Op.or]: [
                { fullName: { [Op.like]: `%${cleanToken}%` } },
                { headline: { [Op.like]: `%${cleanToken}%` } },
                { bio: { [Op.like]: `%${cleanToken}%` } },
                { industry: { [Op.like]: `%${cleanToken}%` } },
                { designation: { [Op.like]: `%${cleanToken}%` } },
                { resumeText: { [Op.like]: `%${cleanToken}%` } },
                sequelize.where(sequelize.fn('LOWER', sequelize.col('Candidate.skills')), 'LIKE', `%${cleanToken.toLowerCase()}%`)
            ]
        };

        const finalCondition = isNot ? { [Op.not]: condition } : condition;
        currentOrGroup.push(finalCondition);
        isNot = false;
    });

    if (currentOrGroup.length > 0) andGroups.push({ [Op.or]: currentOrGroup });
    
    return andGroups.length > 0 ? { [Op.and]: andGroups } : null;
};

import CandidateInteraction from '../models/candidateInteraction.model.js';

// 🟢 Recruiter: Talent Search (Enhanced with Company & Institution)
export const talentSearch = async (req, res) => {
    try {
        const { 
            keyword, location, minSalary, maxSalary, noticePeriod, 
            experienceLevel, minExp, maxExp, degree, jobType, 
            workMode, lastActive, hasSocial, openToRelocate,
            companyName, institution, isImmediate
        } = req.query;

        const where = { status: 'active' };
        const andConditions = [];

        // 1. Boolean + Tag Search
        if (keyword) {
            const booleanCondition = parseBooleanQuery(keyword, sequelize, Op);
            if (booleanCondition) andConditions.push(booleanCondition);
        }

        // 2. 🟢 NEW: Company Search (Search within experienceData JSON)
        if (companyName) {
            andConditions.push(sequelize.where(
                sequelize.fn('LOWER', sequelize.col('experienceData')),
                'LIKE',
                `%${companyName.toLowerCase()}%`
            ));
        }

        // 3. 🟢 NEW: Institution/College Search (Search within educationData JSON)
        if (institution) {
            andConditions.push(sequelize.where(
                sequelize.fn('LOWER', sequelize.col('educationData')),
                'LIKE',
                `%${institution.toLowerCase()}%`
            ));
        }

        // 4. 🟢 NEW: Immediate Joiner Toggle
        if (isImmediate === 'true') {
            andConditions.push({ noticePeriod: 'Immediate' });
        }

        // Standard Filters
        if (location) andConditions.push({ currentLocation: { [Op.like]: `%${location}%` } });
        if (noticePeriod && noticePeriod !== 'All' && isImmediate !== 'true') andConditions.push({ noticePeriod });
        if (experienceLevel && experienceLevel !== 'All') andConditions.push({ experienceLevel });
        
        if (minExp || maxExp) {
            const expWhere = {};
            if (minExp) expWhere[Op.gte] = parseInt(minExp);
            if (maxExp) expWhere[Op.lte] = parseInt(maxExp);
            andConditions.push({ experienceYears: expWhere });
        }

        if (minSalary || maxSalary) {
            const salWhere = {};
            if (minSalary) salWhere[Op.gte] = parseFloat(minSalary);
            if (maxSalary) salWhere[Op.lte] = parseFloat(maxSalary);
            andConditions.push({ currentSalary: salWhere });
        }

        if (degree && degree !== 'All') {
            andConditions.push(sequelize.where(
                sequelize.fn('LOWER', sequelize.col('educationData')),
                'LIKE',
                `%${degree.toLowerCase()}%`
            ));
        }

        if (jobType && jobType !== 'All') {
            andConditions.push(sequelize.where(sequelize.col('jobPreferences'), Op.like, `%"jobType":"${jobType}"%`));
        }

        if (workMode && workMode !== 'All') {
            andConditions.push(sequelize.where(sequelize.col('jobPreferences'), Op.like, `%"workMode":"${workMode}"%`));
        }

        if (lastActive && lastActive !== 'All') {
            const date = new Date();
            date.setDate(date.getDate() - parseInt(lastActive));
            andConditions.push({ lastActive: { [Op.gte]: date } });
        }

        if (openToRelocate === 'true') andConditions.push({ relocation: true });

        if (hasSocial && hasSocial !== 'All') {
            andConditions.push(sequelize.where(sequelize.col('socialLinks'), Op.like, `%"${hasSocial}":%http%`));
        }

        if (andConditions.length > 0) where[Op.and] = andConditions;

        const candidates = await Candidate.findAll({
            where,
            attributes: { exclude: ['password'] },
            order: [['lastActive', 'DESC']],
            limit: 100
        });

        // 🟢 Fetch Recruiter interactions for these candidates
        const interactions = await CandidateInteraction.findAll({
            where: { companyId: req.companyId, candidateId: { [Op.in]: candidates.map(c => c.id) } }
        });

        const companyData = await Company.findByPk(req.companyId);
        const unlockedIds = companyData.unlockedCandidates || [];

        const maskedCandidates = candidates.map(c => {
            const isUnlocked = unlockedIds.includes(c.id);
            const interaction = interactions.find(i => i.candidateId === c.id);
            const data = c.toJSON();
            
            // Interaction Data
            data.interaction = interaction || { notes: '', rating: 0, folder: 'General', isContacted: false };
            data.isUnlocked = isUnlocked;

            if (!isUnlocked) {
                data.email = data.email.replace(/(?<=.{3}).(?=.*@)/g, "*");
                data.phoneNumber = data.phoneNumber ? data.phoneNumber.replace(/.(?=.{4})/g, "*") : "**********";
                data.resume = null; 
            }
            return data;
        });

        return res.status(200).json({ success: true, count: maskedCandidates.length, candidates: maskedCandidates });
    } catch (error) {
        console.error("Talent Search Error:", error);
        return res.status(500).json({ message: "Search failed", success: false });
    }
};

// 🟢 Recruiter: Save Candidate Interaction (Notes, Rating, Folder, Contacted)
export const updateInteraction = async (req, res) => {
    try {
        const { candidateId, notes, rating, folder, isContacted } = req.body;
        
        let interaction = await CandidateInteraction.findOne({
            where: { companyId: req.companyId, candidateId }
        });

        if (interaction) {
            await interaction.update({ 
                notes: notes !== undefined ? notes : interaction.notes,
                rating: rating !== undefined ? rating : interaction.rating,
                folder: folder !== undefined ? folder : interaction.folder,
                isContacted: isContacted !== undefined ? isContacted : interaction.isContacted,
                lastContactedAt: isContacted ? new Date() : interaction.lastContactedAt
            });
        } else {
            interaction = await CandidateInteraction.create({
                companyId: req.companyId,
                candidateId,
                notes, rating, folder, isContacted,
                lastContactedAt: isContacted ? new Date() : null
            });
        }

        return res.status(200).json({ message: "Interaction updated", success: true, interaction });
    } catch (error) {
        return res.status(500).json({ message: "Failed to update interaction", success: false });
    }
};

// 🟢 Recruiter: Unlock Candidate Profile (Uses 1 Credit)
export const unlockCandidate = async (req, res) => {
    try {
        const { candidateId } = req.body;
        const company = await Company.findByPk(req.companyId);

        if (!company) return res.status(404).json({ message: "Company not found", success: false });

        const unlockedIds = company.unlockedCandidates || [];
        if (unlockedIds.includes(candidateId)) {
            return res.status(200).json({ message: "Profile already unlocked", success: true });
        }

        if (company.databaseCredits <= 0) {
            return res.status(403).json({ 
                message: "Insufficient credits. Please recharge your Talent Search credits.", 
                success: false,
                requiresRecharge: true
            });
        }

        // Deduct Credit and Add to Unlocked List
        company.databaseCredits -= 1;
        company.unlockedCandidates = [...unlockedIds, candidateId];
        // Sequelize JSON update tracking
        company.changed('unlockedCandidates', true);
        await company.save();

        const candidate = await Candidate.findByPk(candidateId, { attributes: { exclude: ['password'] } });

        // Log Action
        await logActivity({ 
            companyId: company.id, 
            action: 'TALENT_UNLOCKED', 
            details: `Unlocked candidate profile: ${candidate.fullName} (ID: ${candidateId})`,
            req 
        });

        return res.status(200).json({ 
            message: "Profile unlocked successfully!", 
            success: true, 
            candidate,
            remainingCredits: company.databaseCredits
        });
    } catch (error) {
        console.error("Unlock Error:", error);
        return res.status(500).json({ message: "Failed to unlock profile", success: false });
    }
};

// 🟢 Recruiter: Bulk Unlock Candidates
export const bulkUnlockCandidates = async (req, res) => {
    try {
        const { candidateIds } = req.body; // Array of IDs
        if (!candidateIds || !Array.isArray(candidateIds) || candidateIds.length === 0) {
            return res.status(400).json({ message: "No candidates selected", success: false });
        }

        const company = await Company.findByPk(req.companyId);
        const alreadyUnlocked = company.unlockedCandidates || [];
        
        // Filter out those who are already unlocked
        const newToUnlock = candidateIds.filter(id => !alreadyUnlocked.includes(id));
        
        if (newToUnlock.length === 0) {
            return res.status(200).json({ message: "All selected candidates are already unlocked", success: true });
        }

        if (company.databaseCredits < newToUnlock.length) {
            return res.status(403).json({ 
                message: `Insufficient credits. You need ${newToUnlock.length} credits, but have ${company.databaseCredits}.`, 
                success: false 
            });
        }

        // Deduct and Update
        company.databaseCredits -= newToUnlock.length;
        company.unlockedCandidates = [...alreadyUnlocked, ...newToUnlock];
        company.changed('unlockedCandidates', true);
        await company.save();

        // Log Action
        await logActivity({ 
            companyId: company.id, 
            action: 'TALENT_BULK_UNLOCK', 
            details: `Bulk unlocked ${newToUnlock.length} profiles.`,
            req 
        });

        return res.status(200).json({ 
            message: `Successfully unlocked ${newToUnlock.length} profiles!`, 
            success: true,
            remainingCredits: company.databaseCredits
        });
    } catch (error) {
        return res.status(500).json({ message: "Bulk unlock failed", success: false });
    }
};

// 🟢 Recruiter: Get All Unlocked Candidates (History)
export const getUnlockedCandidates = async (req, res) => {
    try {
        const company = await Company.findByPk(req.companyId);
        const unlockedIds = company.unlockedCandidates || [];

        if (unlockedIds.length === 0) {
            return res.status(200).json({ success: true, candidates: [] });
        }

        const candidates = await Candidate.findAll({
            where: { id: { [Op.in]: unlockedIds } },
            attributes: { exclude: ['password'] },
            order: [['updatedAt', 'DESC']]
        });

        return res.status(200).json({ success: true, candidates });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching history", success: false });
    }
};

// 🟢 Recruiter: Get Candidate Detail from Talent Pool (Paid/Strict)
export const getCandidateById = async (req, res) => {
    try {
        const { id } = req.params;
        const company = await Company.findByPk(req.companyId);
        const candidate = await Candidate.findByPk(id, { attributes: { exclude: ['password'] } });

        if (!candidate) return res.status(404).json({ message: "Candidate not found", success: false });

        // Check ONLY if explicitly bought from Talent Pool
        const unlockedIds = company.unlockedCandidates || [];
        const isUnlocked = unlockedIds.includes(id);

        const data = candidate.toJSON();
        data.isUnlocked = isUnlocked;

        // Masking if NOT bought
        if (!isUnlocked) {
            data.email = data.email.replace(/(?<=.{3}).(?=.*@)/g, "*");
            data.phoneNumber = data.phoneNumber ? data.phoneNumber.replace(/.(?=.{4})/g, "*") : "**********";
            data.resume = null; 
        }

        return res.status(200).json({ success: true, candidate: data });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching candidate", success: false });
    }
};

// 🟢 Recruiter: Get Applicant Detail (Always Free but verifies application)
export const getApplicantDetail = async (req, res) => {
    try {
        const { id } = req.params;
        // Verify if this candidate has actually applied to this company
        const hasApplied = await Application.findOne({
            include: [{ model: Job, as: 'Job', where: { companyId: req.companyId } }],
            where: { candidateId: id }
        });

        if (!hasApplied) {
            return res.status(403).json({ message: "You can only view applicants for free. To view other candidates, use Talent Pool.", success: false });
        }

        const candidate = await Candidate.findByPk(id, { attributes: { exclude: ['password'] } });
        const data = candidate.toJSON();
        data.isUnlocked = true; // Always unlocked for applicants

        return res.status(200).json({ success: true, candidate: data });
    } catch (error) {
        return res.status(500).json({ success: false });
    }
};

export const logoutCompany = async (req, res) => {
    try {
        return res.status(200).cookie("companyToken", "", { maxAge: 0 }).json({ message: "Logged out", success: true });
    } catch (err) { res.status(500).json({ message: "Error", success: false }); }
};

export const getCompany = async (req, res) => {
    try {
        const company = await Company.findByPk(req.companyId);
        if (!company) return res.status(404).json({ message: "Not found", success: false });

        if (company.planType !== 'none' && !company.trialExpiresAt && !company.planExpiresAt) {
            const config = await SystemConfig.findOne({ where: { key: 'DEFAULT_FREE_MONTHS' } });
            const freeMonths = config ? (parseInt(config.value) || 6) : 6;
            const expiryDate = new Date();
            expiryDate.setMonth(expiryDate.getMonth() + freeMonths);
            company.trialExpiresAt = expiryDate;
            company.jobPostingLimit = -1;
            await company.save();
        }

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

        const orderData = {
            packageId: pkg.id,
            amount: pkg.price,
            currency: config.currency || 'INR',
            gateway: config.activeGateway,
            mode: config.paymentMode,
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
        if (isPlanActive && pkg.tier === company.currentPackageTier && pkg.type === 'job_post') {
            currentExpiry = new Date(company.planExpiresAt);
        } else {
            currentExpiry = new Date();
        }
        currentExpiry.setDate(currentExpiry.getDate() + pkg.durationDays);

        const transaction = await Transaction.create({
            companyId: company.id,
            packageName: pkg.name,
            amount: pkg.price,
            durationDays: pkg.durationDays,
            jobLimit: pkg.jobLimit,
            status: 'success', 
            paymentId: paymentId || `PAY-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        });

        // 🟢 Update Company Plan & Credits
        const updates = {
            currentPackageId: pkg.id,
            currentPackageTier: pkg.tier,
        };

        if (pkg.type === 'database_access') {
            updates.databaseCredits = (company.databaseCredits || 0) + pkg.databaseCredits;
        } else {
            updates.planType = 'premium';
            updates.planExpiresAt = currentExpiry;
            updates.jobPostingLimit = pkg.jobLimit === -1 ? -1 : (company.jobPostingLimit === -1 ? pkg.jobLimit : company.jobPostingLimit + pkg.jobLimit);
        }

        await company.update(updates);

        await logActivity({ 
            companyId: company.id, 
            action: 'PURCHASE_SUCCESS', 
            details: `Purchased ${pkg.name} via ${gateway}. Transaction: ${transaction.paymentId}`,
            req 
        });

        await Notification.create({
            recipientId: '00000000-0000-0000-0000-000000000000', 
            recipientType: 'admin',
            title: pkg.tier > company.currentPackageTier ? 'Premium Plan Upgrade' : 'New Subscription Purchased',
            message: `${company.companyName} has paid ${config?.currency || 'INR'} ${pkg.price} for "${pkg.name}" plan via ${gateway.toUpperCase()}. (Transaction ID: ${transaction.paymentId})`,
            type: 'PAYMENT_RECEIVED',
            relatedId: transaction.id
        });

        try {
            await sendEmail({
                to: company.email,
                subject: "Payment Confirmed - Your Plan is now Active",
                html: getPaymentSuccessTemplate(
                    company.companyName, pkg.name, pkg.price, config?.currency || 'INR', transaction.paymentId, currentExpiry
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
