import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

const authMiddleware = (requiredRoles = []) => {
    return (req, res, next) => {
        const token = req.header("Authorization");

        if (!token) {
            return res.status(401).json({ error: "Access denied. No token provided." });
        }

        try {
            const decoded = jwt.verify(token.replace("Bearer ", ""), config.JWT_SECRET);
            req.user = decoded; // Attach user info to request

            // Check if user has the required role
            if (requiredRoles.length > 0) {
                if (!decoded.role) {
                    return res.status(403).json({ error: "Access denied. Role not assigned." });
                }
                if (!requiredRoles.includes(decoded.role)) {
                    return res.status(403).json({ error: "Access denied. Insufficient permissions." });
                }
            }

            next();
        } catch (err) {
            console.error("JWT Error:", err);
            return res.status(400).json({ error: "Invalid token." });
        }
    };
};

export default authMiddleware;

