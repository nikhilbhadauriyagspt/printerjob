import jwt from "jsonwebtoken";

const companyAuth = async (req, res, next) => {
    try {
        const token = req.cookies.companyToken;
        if (!token) {
            return res.status(401).json({ message: "User not authenticated", success: false });
        }
        const decode = await jwt.verify(token, process.env.JWT_SECRET);
        if (!decode) {
            return res.status(401).json({ message: "Invalid token", success: false });
        }
        req.companyId = decode.companyId;
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: "Authentication failed", success: false });
    }
}

export default companyAuth;
