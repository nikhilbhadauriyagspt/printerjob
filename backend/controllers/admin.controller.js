import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/admin.model.js';
import Company from '../models/company.model.js';
import Industry from '../models/industry.model.js';
import Designation from '../models/designation.model.js';
import JobTitle from '../models/jobTitle.model.js';
import Skill from '../models/skill.model.js';
import Job from '../models/job.model.js';
import SystemConfig from '../models/systemConfig.model.js';
import ActivityLog from '../models/activityLog.model.js';
import Notification from '../models/notification.model.js';
import Transaction from '../models/transaction.model.js';
import Package from '../models/package.model.js';
import { logActivity } from '../utils/logger.js';
import { sendEmail, getAccountBlockedTemplate, getAccountUnblockedTemplate } from '../utils/emailService.js';
import { Op, fn, col, literal } from 'sequelize';

// 🟢 Admin: Toggle Support System (ON/OFF)
export const toggleSupportStatus = async (req, res) => {
    try {
        const { isEnabled } = req.body;
        let config = await SystemConfig.findOne();
        
        if (!config) {
            config = await SystemConfig.create({ isSupportEnabled: isEnabled });
        } else {
            config.isSupportEnabled = isEnabled;
            await config.save();
        }

        return res.status(200).json({ 
            message: `Support system ${isEnabled ? 'Enabled' : 'Disabled'}`, 
            success: true,
            isEnabled: config.isSupportEnabled
        });
    } catch (error) {
        console.error("toggleSupportStatus Error:", error);
        return res.status(500).json({ message: error.message, success: false });
    }
};

// 🟢 Public/Admin: Get System Config
export const getSystemConfig = async (req, res) => {
    try {
        let config = await SystemConfig.findOne();
        if (!config) {
            config = await SystemConfig.create({});
        }
        
        return res.status(200).json({ 
            success: true, 
            config
        });
    } catch (error) {
        console.error("getSystemConfig Error:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

// 🟢 Admin: Update Payment Gateway Settings
export const updatePaymentSettings = async (req, res) => {
    try {
        const { 
            activeGateway, 
            paymentMode, 
            currency, 
            razorpayKeyId, 
            razorpaySecret, 
            paypalClientId, 
            paypalSecret 
        } = req.body;

        let config = await SystemConfig.findOne();
        if (!config) {
            config = await SystemConfig.create(req.body);
        } else {
            await config.update({
                activeGateway, 
                paymentMode, 
                currency, 
                razorpayKeyId, 
                razorpaySecret, 
                paypalClientId, 
                paypalSecret 
            });
        }

        return res.status(200).json({ 
            message: "Payment settings updated successfully", 
            success: true,
            config 
        });
    } catch (error) {
        console.error("updatePaymentSettings Error:", error);
        return res.status(500).json({ message: error.message, success: false });
    }
};

// 🟢 Admin: Get Notifications
export const getAdminNotifications = async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            where: { recipientType: 'admin' },
            order: [['createdAt', 'DESC']],
            limit: 20
        });
        return res.status(200).json({ success: true, notifications });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching notifications", success: false });
    }
};

// 🟢 Admin: Mark Notification as Read
export const markNotificationAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        await Notification.update({ isRead: true }, { where: { id } });
        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({ message: "Error updating notification", success: false });
    }
};

export const registerAdmin = async (req, res) => {
    try {
        const { fullName, email, password } = req.body || {};
        if (!fullName || !email || !password) {
            return res.status(400).json({
                message: "All fields are required",
                success: false
            });
        }

        const existingAdmin = await Admin.findOne({ where: { email } });
        if (existingAdmin) {
            return res.status(400).json({
                message: "Admin already exists with this email",
                success: false
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await Admin.create({
            fullName,
            email,
            password: hashedPassword,
            role: 'super_admin'
        });

        return res.status(201).json({
            message: "Super Admin created successfully",
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

export const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body || {};
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
                success: false
            });
        }

        const admin = await Admin.findOne({ where: { email } });
        if (!admin) {
            return res.status(401).json({
                message: "Invalid email or password",
                success: false
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, admin.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                message: "Invalid email or password",
                success: false
            });
        }

        const tokenData = {
            adminId: admin.id,
            role: admin.role
        };

        const token = jwt.sign(tokenData, process.env.JWT_SECRET, { expiresIn: '1d' });

        return res.status(200).cookie("adminToken", token, {
            maxAge: 1 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production'
        }).json({
            message: `Welcome back, ${admin.fullName}`,
            admin: {
                id: admin.id,
                fullName: admin.fullName,
                email: admin.email,
                role: admin.role
            },
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

export const logoutAdmin = async (req, res) => {
    try {
        return res.status(200).cookie("adminToken", "", { maxAge: 0 }).json({
            message: "Logged out successfully",
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

export const getAdmin = async (req, res) => {
    try {
        const adminId = req.adminId;
        const admin = await Admin.findByPk(adminId, {
            attributes: { exclude: ['password'] }
        });

        if (!admin) {
            return res.status(404).json({
                message: "Admin not found",
                success: false
            });
        }

        return res.status(200).json({
            admin,
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

// --- Recruiter Management for Super Admin ---

export const getAllCompanies = async (req, res) => {
    try {
        const companies = await Company.findAll({
            order: [['createdAt', 'DESC']]
        });
        return res.status(200).json({ companies, success: true });
    } catch (error) {
        console.error("GET ALL COMPANIES ERROR:", error);
        return res.status(500).json({ message: "Error fetching companies", success: false });
    }
};

export const toggleCompanyStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body || {};
        
        const company = await Company.findByPk(id);
        if (!company) return res.status(404).json({ message: "Company not found", success: false });

        const oldStatus = company.isApproved;
        company.isApproved = !oldStatus;
        
        if (company.isApproved && company.status === 'rejected') {
            company.status = 'active';
        } else if (!company.isApproved) {
            company.status = 'rejected';
        }

        // 🟢 Auto-Approve Suggestions when Company is Approved
        if (company.isApproved) {
            // 🟢 Activate Trial on Manual Approval if no plan exists
            if (company.planType === 'none') {
                const config = await SystemConfig.findOne();
                const freeMonths = config ? config.defaultFreeMonths : 6;

                const expiryDate = new Date();
                expiryDate.setMonth(expiryDate.getMonth() + freeMonths);

                company.planType = 'trial';
                company.trialExpiresAt = expiryDate;
                company.jobPostingLimit = -1; // Unlimited
            }

            const models = [Industry, Designation, JobTitle, Skill];
            await Promise.all(models.map(model =>
                model.update({ isApproved: true }, { where: { createdBy: company.id } })
            ));
        }
        await company.save();

        try {
            if (!company.isApproved) {
                await sendEmail({
                    to: company.email,
                    subject: "Important: Your Recruiter Account Access has been Restricted",
                    html: getAccountBlockedTemplate(company.companyName, reason)
                });
            } else {
                await sendEmail({
                    to: company.email,
                    subject: "Access Restored: Your Recruiter Account is Now Active",
                    html: getAccountUnblockedTemplate(company.companyName)
                });
            }
        } catch (emailErr) {
            console.error("Status notification email failed:", emailErr);
        }

        return res.status(200).json({ 
            message: `Company ${company.isApproved ? 'Unblocked/Approved' : 'Blocked'} successfully`, 
            success: true,
            company
        });
    } catch (error) {
        return res.status(500).json({ message: "Error updating status", success: false });
    }
};

// Helper to get model by type string
const getModelByType = (type) => {
    switch (type.toLowerCase()) {
        case 'industry': return Industry;
        case 'designation': return Designation;
        case 'jobtitle': return JobTitle;
        case 'skill': return Skill;
        default: return null;
    }
};

// 🟢 Admin: Get All Jobs for Review
export const getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.findAll({
            include: [{
                model: Company,
                as: 'Company',
                attributes: ['companyName', 'logo', 'email']
            }],
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            jobs
        });
    } catch (error) {
        console.error("GET ALL JOBS ERROR:", error);
        return res.status(500).json({ message: "Error fetching jobs", success: false });
    }
};

// 🟢 Admin: Bulk Upload Industries/Designations/etc
export const bulkUploadSuggestions = async (req, res) => {
    try {
        const { type, items } = req.body || {}; 
        if (!type || !items || !Array.isArray(items)) return res.status(400).json({ message: "Invalid data", success: false });

        const Model = getModelByType(type);
        if (!Model) return res.status(400).json({ message: "Invalid type", success: false });

        const adminId = req.adminId;

        await Promise.all(items.map(async (name) => {
            return await Model.findOrCreate({
                where: { name: name.trim() },
                defaults: { isApproved: true, createdBy: adminId }
            });
        }));

        return res.status(200).json({ message: "Bulk upload successful", success: true });
    } catch (err) {
        return res.status(500).json({ message: "Error in bulk upload", success: false });
    }
};

// 🟢 Admin: Add Single Suggestion
export const addSuggestion = async (req, res) => {
    try {
        const { type, name } = req.body || {};
        if (!type || !name) return res.status(400).json({ message: "Type and Name required", success: false });

        const Model = getModelByType(type);
        if (!Model) return res.status(400).json({ message: "Invalid type", success: false });

        const [item, created] = await Model.findOrCreate({
            where: { name: name.trim() },
            defaults: { isApproved: true, createdBy: req.adminId }
        });

        if (!created) return res.status(400).json({ message: "Item already exists", success: false });

        return res.status(201).json({ message: "Added successfully", success: true, item });
    } catch (err) {
        return res.status(500).json({ message: "Error adding suggestion", success: false });
    }
};

// 🟢 Fetch Suggestions (Used by Recruiter & Admin)
export const getSuggestions = async (req, res) => {
    try {
        const { type } = req.query || {};
        const Model = getModelByType(type);
        if (!Model) return res.status(400).json({ message: "Invalid type", success: false });

        const suggestions = await Model.findAll({
            where: { isApproved: true },
            attributes: ['name'],
            order: [['name', 'ASC']]
        });

        return res.status(200).json({ success: true, suggestions: suggestions.map(s => s.name) });
    } catch (err) {
        return res.status(500).json({ message: "Error fetching suggestions", success: false });
    }
};

export const getCompanyJobs = async (req, res) => {
    try {
        const { id } = req.params;
        const jobs = await Job.findAll({
            where: { companyId: id },
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            jobs
        });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching jobs", success: false });
    }
};

export const getCompanyActivityHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const logs = await ActivityLog.findAll({
            where: { companyId: id },
            order: [['createdAt', 'DESC']],
            limit: 50
        });

        return res.status(200).json({
            success: true,
            logs
        });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching history", success: false });
    }
};

export const getCompanyBillingHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const history = await Transaction.findAll({
            where: { companyId: id },
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            history
        });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching billing history", success: false });
    }
};

export const assignCustomPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const { packageName, durationDays, jobLimit, tier, amount } = req.body;

        const company = await Company.findByPk(id);
        if (!company) return res.status(404).json({ message: "Company not found", success: false });

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + parseInt(durationDays));

        // Update Company Plan (Overwrite with Custom Values)
        await company.update({
            planType: 'premium',
            planExpiresAt: expiryDate,
            currentPackageTier: parseInt(tier),
            currentPackageId: null, // Custom plan doesn't link to a fixed package
            jobPostingLimit: parseInt(jobLimit) // Set exactly what Admin entered
        });

        // Create Transaction Record
        await Transaction.create({
            companyId: id,
            packageName: `CUSTOM: ${packageName}`,
            amount: amount || 0,
            durationDays,
            jobLimit,
            status: 'success',
            paymentId: `ADMIN-MANUAL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        });

        // Log Action
        await logActivity({ 
            companyId: company.id, 
            action: 'ADMIN_MANUAL_RECHARGE', 
            details: `Admin assigned custom plan: ${packageName} (${durationDays} days, ${jobLimit} jobs, Tier ${tier})`,
            req 
        });

        // Optional: Send Email notification about custom plan
        try {
            await sendEmail({
                to: company.email,
                subject: "Account Updated: Custom Plan Assigned",
                html: `<h3>Hello ${company.companyName},</h3><p>An administrator has manually updated your plan. Your new plan <b>${packageName}</b> is now active until <b>${expiryDate.toLocaleDateString()}</b>.</p>`
            });
        } catch (err) { console.error("Email failed"); }

        return res.status(200).json({ 
            message: "Custom plan assigned successfully", 
            success: true,
            company 
        });
    } catch (error) {
        return res.status(500).json({ message: "Error assigning custom plan", success: false });
    }
};

// 🟢 Admin: Create Packages
export const createPackage = async (req, res) => {
    try {
        const { name, price, durationDays, jobLimit, tier, description } = req.body;
        const pkg = await Package.create({ name, price, durationDays, jobLimit, tier: parseInt(tier) || 1, description });
        return res.status(201).json({ message: "Package created successfully", success: true, pkg });
    } catch (error) {
        console.error("Create Package Error:", error);
        return res.status(500).json({ message: "Error creating package", success: false });
    }
};

// 🟢 Admin: Update Package
export const updatePackage = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, durationDays, jobLimit, tier, description } = req.body;
        
        const pkg = await Package.findByPk(id);
        if (!pkg) return res.status(404).json({ message: "Package not found", success: false });

        await pkg.update({ 
            name, 
            price, 
            durationDays, 
            jobLimit, 
            tier: parseInt(tier) || pkg.tier, 
            description 
        });
        
        return res.status(200).json({ message: "Package updated successfully", success: true, pkg });
    } catch (error) {
        console.error("Update Package Error:", error);
        return res.status(500).json({ message: "Error updating package", success: false });
    }
};

// 🟢 Admin: Delete Package
export const deletePackage = async (req, res) => {
    try {
        const { id } = req.params;
        const pkg = await Package.findByPk(id);
        if (!pkg) return res.status(404).json({ message: "Package not found", success: false });

        await pkg.destroy();
        return res.status(200).json({ message: "Package deleted successfully", success: true });
    } catch (error) {
        console.error("Delete Package Error:", error);
        return res.status(500).json({ message: "Error deleting package", success: false });
    }
};

// 🟢 Admin: Get Packages
export const getAdminPackages = async (req, res) => {
    try {
        const packages = await Package.findAll({ order: [['price', 'ASC']] });
        return res.status(200).json({ success: true, packages });
    } catch (error) {
        console.error("getAdminPackages Error:", error);
        return res.status(500).json({ success: false });
    }
};

// 🟢 Admin: Manual Onboarding
export const onboardRecruiter = async (req, res) => {
    try {
        const { companyName, email, phoneNumber, contactPersonName, password, industry, planType } = req.body;

        const existingCompany = await Company.findOne({ where: { [Op.or]: [{ email }, { phoneNumber }] } });
        if (existingCompany) return res.status(400).json({ message: "Email or Phone already registered", success: false });

        const hashedPassword = await bcrypt.hash(password, 10);

        const company = await Company.create({
            companyName, email, phoneNumber, contactPersonName, password: hashedPassword,
            industry, status: 'active', isApproved: true, isEmailVerified: true, isPhoneVerified: true,
            planType: planType || 'none', jobPostingLimit: planType === 'trial' ? -1 : 0
        });

        if (planType === 'trial') {
            const expiryDate = new Date();
            expiryDate.setMonth(expiryDate.getMonth() + 6);
            await company.update({ trialExpiresAt: expiryDate });
        }

        await logActivity({ companyId: company.id, action: 'ADMIN_MANUAL_ONBOARDING', details: `Admin manually onboarded: ${companyName}`, req });

        try {
            await sendEmail({
                to: company.email,
                subject: "Welcome to JobPortal - Your Account is Ready",
                html: `<p>Hello ${contactPersonName}, your account is ready. Use <b>${email}</b> / <b>${password}</b> to login.</p>`
            });
        } catch (emailErr) { console.error("Email failed"); }

        return res.status(201).json({ message: "Recruiter onboarded successfully", success: true, company });
    } catch (error) {
        return res.status(500).json({ message: "Onboarding failed", success: false });
    }
};

// 🟢 Admin: Update Default Free Months
export const updateFreeAccessSettings = async (req, res) => {
    try {
        const { months } = req.body;
        let config = await SystemConfig.findOne();
        if (!config) {
            config = await SystemConfig.create({ defaultFreeMonths: months });
        } else {
            config.defaultFreeMonths = months;
            await config.save();
        }
        return res.status(200).json({ message: `New recruiters will now get ${months} months free access`, success: true });
    } catch (error) {
        return res.status(500).json({ message: "Error updating settings", success: false });
    }
};
