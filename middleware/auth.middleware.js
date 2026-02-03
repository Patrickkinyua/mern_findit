import jwt from "jsonwebtoken"

export const authenticateToken = (req, res, next) => {
    // Try to get token from Authorization header first
    const authHeader = req.headers['authorization']
    let token = authHeader && authHeader.split(' ')[1]
    
    // If no token in header, try to get it from cookie
    if (!token && req.cookies) {
        token = req.cookies.token
    }
    
    if (!token) {
        return res.status(401).json({ message: "Access token required" });
    }
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid or expired token" });
        }
        req.user = user;
        next();
    });
}