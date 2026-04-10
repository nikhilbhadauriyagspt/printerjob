import Message from '../models/message.model.js';
import Company from '../models/company.model.js';
import Admin from '../models/admin.model.js';
import { Op } from 'sequelize';

import Notification from '../models/notification.model.js';

export const sendMessage = async (req, res) => {
    try {
        let { receiverId, content, role } = req.body;
        const senderId = req.adminId || req.companyId;
        const senderType = req.adminId ? 'admin' : 'company';
        const receiverType = senderType === 'admin' ? 'company' : 'admin';

        console.log(`MESSAGE SEND: From ${senderId} (${senderType}) to ${receiverId}. Role Hint: ${role}`);

        if (!receiverId || !content) return res.status(400).json({ message: "Missing fields", success: false });

        // 🟢 If sending to System Admin placeholder, find the real admin ID
        if (receiverId === '00000000-0000-0000-0000-000000000000') {
            const admin = await Admin.findOne();
            if (admin) {
                receiverId = admin.id;
                console.log(`Mapped placeholder to real Admin ID: ${receiverId}`);
            }
        }

        const message = await Message.create({
            senderId,
            senderType,
            receiverId,
            content
        });

        // 🟢 Create Notification
        await Notification.create({
            recipientId: receiverId,
            recipientType: receiverType,
            title: senderType === 'admin' ? 'New Message from Support' : 'New Message from Recruiter',
            message: content.substring(0, 50),
            type: 'NEW_MESSAGE',
            relatedId: senderId
        });

        return res.status(201).json({ success: true, message });
    } catch (error) {
        console.error("SEND MESSAGE ERROR:", error);
        return res.status(500).json({ message: error.message, success: false });
    }
};

export const getMessages = async (req, res) => {
    try {
        const userId = req.adminId || req.companyId;
        const userType = req.adminId ? 'admin' : 'company';
        let { otherId } = req.params;
        const { role } = req.query;

        console.log(`GET MESSAGES: CurrentUser ${userId} (${userType}) with OtherUser ${otherId}. Role Hint: ${role}`);

        // 🟢 Handle System Admin placeholder
        if (otherId === '00000000-0000-0000-0000-000000000000') {
            const admin = await Admin.findOne();
            if (admin) {
                otherId = admin.id;
                console.log(`Mapped otherId placeholder to real Admin ID: ${otherId}`);
            }
        }

        const messages = await Message.findAll({
            where: {
                [Op.or]: [
                    { senderId: userId, receiverId: otherId },
                    { senderId: otherId, receiverId: userId }
                ]
            },
            order: [['createdAt', 'ASC']]
        });

        console.log(`Found ${messages.length} messages`);

        return res.status(200).json({ success: true, messages });
    } catch (error) {
        console.error("GET MESSAGES ERROR:", error);
        return res.status(500).json({ message: error.message, success: false });
    }
};

export const getChatList = async (req, res) => {
    try {
        const adminId = req.adminId;
        console.log(`GET CHAT LIST for Admin: ${adminId}`);

        if (!adminId) return res.status(403).json({ message: "Admin only", success: false });

        const messages = await Message.findAll({
            attributes: ['senderId', 'receiverId'],
            where: {
                [Op.or]: [{ senderId: adminId }, { receiverId: adminId }]
            }
        });

        const companyIds = [...new Set(messages.flatMap(m => [m.senderId, m.receiverId]))].filter(id => id !== adminId);
        console.log(`Unique company IDs in chat: ${companyIds.join(', ')}`);

        const companies = await Company.findAll({
            where: { id: { [Op.in]: companyIds } },
            attributes: ['id', 'companyName', 'logo']
        });

        return res.status(200).json({ success: true, companies });
    } catch (error) {
        console.error("GET CHAT LIST ERROR:", error);
        return res.status(500).json({ message: error.message, success: false });
    }
};
