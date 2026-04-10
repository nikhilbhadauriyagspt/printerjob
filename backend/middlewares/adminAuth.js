import jwt from 'jsonwebtoken';

const adminAuth = async (req, res, next) => {
    try {
        const token = req.cookies.adminToken;
        if (!token) {
            return res.status(401).json({
                message: "No token, authorization denied",
                success: false
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({
                message: "Token is not valid",
                success: false
            });
        }

        req.adminId = decoded.adminId;
        req.role = decoded.role;
        next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({ message: "Auth error", success: false });
    }
};

export default adminAuth;
