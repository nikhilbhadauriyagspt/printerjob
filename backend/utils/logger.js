import ActivityLog from '../models/activityLog.model.js';

export const logActivity = async ({ companyId, action, details, req }) => {
    try {
        const ipAddress = req?.headers['x-forwarded-for'] || req?.socket.remoteAddress || null;
        await ActivityLog.create({
            companyId,
            action,
            details,
            ipAddress
        });
    } catch (error) {
        console.error("Critical: Failed to log activity:", error.message);
    }
};
