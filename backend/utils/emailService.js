import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for 587
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendEmail = async ({ to, subject, html }) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to,
            subject,
            html,
        };
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};

// Email Template: Signup Verification Success (Welcome Email)
export const getWelcomeEmailTemplate = (companyName, email) => {
    const completeProfileUrl = `${process.env.FRONTEND_URL}/complete-profile`;
    return `
    <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #2563eb; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Welcome to JobPortal</h1>
        </div>
        <div style="padding: 30px; color: #334155;">
            <h2 style="color: #1e293b;">Account Successfully Created!</h2>
            <p>Dear <strong>${companyName}</strong>,</p>
            <p>Your account has been successfully verified. You are now part of our recruitment network.</p>
            
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Login Email:</strong> ${email}</p>
                <p style="margin: 5px 0;"><strong>Password:</strong> Use the password you created during signup.</p>
            </div>

            <p>To start posting jobs and hiring, please complete your company profile.</p>
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="${completeProfileUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Complete Your Profile</a>
            </div>
        </div>
        <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
            © 2026 JobPortal. All rights reserved.
        </div>
    </div>
    `;
};

// Email Template: Profile Completion Success
export const getProfileSuccessTemplate = (company) => {
    const dashboardUrl = `${process.env.FRONTEND_URL}/admin/dashboard`;
    return `
    <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #10b981; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Profile Completed!</h1>
        </div>
        <div style="padding: 30px; color: #334155;">
            <h2 style="color: #1e293b;">Your Company Profile is Now Active</h2>
            <p>Great job! Your profile for <strong>${company.companyName}</strong> is now 100% complete.</p>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h4 style="margin-top: 0; color: #1e293b;">Company Summary:</h4>
                <ul style="padding-left: 20px;">
                    <li><strong>Industry:</strong> ${company.industry}</li>
                    <li><strong>Website:</strong> <a href="${company.website}">${company.website}</a></li>
                    <li><strong>Location:</strong> ${company.city}, ${company.state}</li>
                </ul>
            </div>

            <p>You can now start posting job openings and searching for top talent.</p>
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="${dashboardUrl}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Go to Dashboard</a>
            </div>
        </div>
        <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
            © 2026 JobPortal. All rights reserved.
        </div>
    </div>
    `;
};

// Simple OTP Email Template
export const getOTPEmailTemplate = (otp) => {
    return `
    <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="padding: 30px; color: #334155; text-align: center;">
            <h2 style="color: #1e293b;">Verify Your Account</h2>
            <p>Use the following OTP to verify your email address. This OTP is valid for 5 minutes.</p>
            <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0; display: inline-block;">
                <h1 style="letter-spacing: 5px; margin: 0; color: #2563eb;">${otp}</h1>
            </div>
            <p style="font-size: 12px; color: #64748b;">If you did not request this, please ignore this email.</p>
        </div>
    </div>
    `;
};

// Email Template: Account Blocked
export const getAccountBlockedTemplate = (companyName, reason) => {
    return `
    <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: auto; border: 1px solid #fee2e2; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #ef4444; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Access Restricted</h1>
        </div>
        <div style="padding: 30px; color: #334155;">
            <h2 style="color: #1e293b;">Important Account Update</h2>
            <p>Dear <strong>${companyName}</strong>,</p>
            <p>We are writing to inform you that your recruiter account access has been <strong>temporarily restricted</strong> by our administration team.</p>
            
            <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444; margin: 20px 0;">
                <p style="margin: 0; color: #991b1b; font-weight: bold;">Reason for Restriction:</p>
                <p style="margin: 10px 0 0 0; color: #b91c1c;">${reason || "Violation of platform terms or pending verification."}</p>
            </div>

            <p>During this period, you will not be able to post new jobs or manage existing applications. If you believe this is a mistake or would like to provide more information, please contact our support team.</p>
        </div>
        <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
            © 2026 JobPortal. All rights reserved.
        </div>
    </div>
    `;
};

// Email Template: Account Unblocked
export const getAccountUnblockedTemplate = (companyName) => {
    const dashboardUrl = `${process.env.FRONTEND_URL}/recruiter/dashboard`;
    return `
    <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: auto; border: 1px solid #dcfce7; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #10b981; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Access Restored</h1>
        </div>
        <div style="padding: 30px; color: #334155;">
            <h2 style="color: #1e293b;">Welcome Back!</h2>
            <p>Dear <strong>${companyName}</strong>,</p>
            <p>Your recruiter account access has been <strong>successfully restored</strong>. You can now resume your hiring activities on the platform.</p>
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="${dashboardUrl}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Login to Dashboard</a>
            </div>
        </div>
        <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
            © 2026 JobPortal. All rights reserved.
        </div>
    </div>
    `;
};

// Email Template: Job Approved
export const getJobApprovedTemplate = (jobTitle, companyName) => {
    return `
    <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: auto; border: 1px solid #dcfce7; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #10b981; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Job Approved & Live!</h1>
        </div>
        <div style="padding: 30px; color: #334155;">
            <h2 style="color: #1e293b;">Great News!</h2>
            <p>Dear <strong>${companyName}</strong> team,</p>
            <p>Your job posting for <strong>"${jobTitle}"</strong> has been reviewed and approved by our moderation team. It is now live on the platform and visible to candidates.</p>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                <p style="margin: 0;"><strong>Job Status:</strong> Active</p>
                <p style="margin: 5px 0 0 0;"><strong>Duration:</strong> 30 Days (Default)</p>
            </div>

            <p>We wish you the best in finding the right talent!</p>
        </div>
        <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
            © 2026 JobPortal. All rights reserved.
        </div>
    </div>
    `;
};

// Email Template: Job Rejected
export const getJobRejectedTemplate = (jobTitle, companyName, reason) => {
    return `
    <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: auto; border: 1px solid #fee2e2; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #ef4444; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Job Update Required</h1>
        </div>
        <div style="padding: 30px; color: #334155;">
            <h2 style="color: #1e293b;">Job Posting Status Update</h2>
            <p>Dear <strong>${companyName}</strong> team,</p>
            <p>Thank you for posting the opening for <strong>"${jobTitle}"</strong>. After review, our moderation team found that some updates are required before it can go live.</p>
            
            <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444; margin: 20px 0;">
                <p style="margin: 0; color: #991b1b; font-weight: bold;">Reason for Feedback:</p>
                <p style="margin: 10px 0 0 0; color: #b91c1c;">${reason || "Does not meet our quality guidelines."}</p>
            </div>

            <p>Please log in to your dashboard, edit the job details according to the feedback, and resubmit for approval.</p>
        </div>
        <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
            © 2026 JobPortal. All rights reserved.
        </div>
    </div>
    `;
};

// Email Template: Trial Activation (After 100% Profile)
export const getTrialActivationTemplate = (companyName, expiryDate, months) => {
    const dashboardUrl = `${process.env.FRONTEND_URL}/recruiter/dashboard`;
    return `
    <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #2563eb; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Free Access Activated!</h1>
        </div>
        <div style="padding: 30px; color: #334155;">
            <h2 style="color: #1e293b;">Special Offer for You</h2>
            <p>Dear <strong>${companyName}</strong>,</p>
            <p>Congratulations! Your profile is 100% complete. As a welcome gift, we have activated <strong>${months} Months of Free Job Posting Access</strong> for your account.</p>
            
            <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; border: 1px solid #bae6fd; margin: 20px 0;">
                <p style="margin: 0; color: #0369a1; font-weight: bold; font-size: 18px; text-align: center;">
                    Valid Until: ${new Date(expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
            </div>

            <p>You can now post unlimited jobs and find the best talent without any charges during this period.</p>
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="${dashboardUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Start Posting Jobs</a>
            </div>
        </div>
        <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
            © 2026 JobPortal. All rights reserved.
        </div>
    </div>
    `;
};

// Email Template: Plan Expiry Warning
export const getPlanExpiryWarningTemplate = (companyName, expiryDate, daysLeft) => {
    const pricingUrl = `${process.env.FRONTEND_URL}/recruiter/pricing`;
    return `
    <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: auto; border: 1px solid #fef3c7; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #f59e0b; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Action Required: Plan Expiring</h1>
        </div>
        <div style="padding: 30px; color: #334155;">
            <h2 style="color: #1e293b; text-align: center;">Your Access is Ending Soon</h2>
            <p>Dear <strong>${companyName}</strong>,</p>
            <p>This is a friendly reminder that your job posting access will expire in <strong>${daysLeft} day(s)</strong>.</p>
            
            <div style="background-color: #fffbeb; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
                <p style="margin: 0;"><strong>Expiry Date:</strong> ${new Date(expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>

            <p>To ensure your job postings remain active and you don't lose access to candidate profiles, please recharge your account.</p>
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="${pricingUrl}" style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">View Recharge Plans</a>
            </div>
        </div>
        <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
            © 2026 JobPortal. All rights reserved.
        </div>
    </div>
    `;
};

// Email Template: Payment Success Confirmation
export const getPaymentSuccessTemplate = (companyName, pkgName, amount, currency, transactionId, expiryDate) => {
    const dashboardUrl = `${process.env.FRONTEND_URL}/recruiter/dashboard`;
    return `
    <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #4f46e5; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Payment Successful!</h1>
        </div>
        <div style="padding: 30px; color: #334155;">
            <h2 style="color: #1e293b;">Thank You for Your Purchase</h2>
            <p>Dear <strong>${companyName}</strong>,</p>
            <p>We've received your payment for the <strong>${pkgName}</strong>. Your account has been upgraded and your new limits are now active.</p>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin: 20px 0;">
                <h4 style="margin-top: 0; color: #4f46e5; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Transaction Details</h4>
                <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; color: #64748b;">Package:</td>
                        <td style="padding: 8px 0; font-weight: bold; text-align: right;">${pkgName}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #64748b;">Amount Paid:</td>
                        <td style="padding: 8px 0; font-weight: bold; text-align: right;">${currency} ${amount}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #64748b;">Transaction ID:</td>
                        <td style="padding: 8px 0; font-weight: bold; text-align: right; font-family: monospace;">${transactionId}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #64748b;">Valid Until:</td>
                        <td style="padding: 8px 0; font-weight: bold; text-align: right;">${new Date(expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                    </tr>
                </table>
            </div>

            <p>You can now continue to post jobs and search for top talent. Your invoice is available in the billing section of your dashboard.</p>
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="${dashboardUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Go to Dashboard</a>
            </div>
        </div>
        <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
            © 2026 JobPortal. All rights reserved.
        </div>
    </div>
    `;
};
