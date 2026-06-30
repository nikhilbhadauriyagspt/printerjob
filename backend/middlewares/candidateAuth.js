import jwt from 'jsonwebtoken';

const candidateAuth = async (req, res, next) => {
    try {
        const token = req.cookies.candidateToken;
        if (!token) {
            return res.status(401).json({
                message: "User not authenticated",
                success: false
            });
        }
        const decode = await jwt.verify(token, process.env.JWT_SECRET);
        if (!decode) {
            return res.status(401).json({
                message: "Invalid token",
                success: false
            });
        }
        req.candidateId = decode.candidateId;
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", success: false });
    }
}

export default candidateAuth;
