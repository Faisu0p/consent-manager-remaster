import express from "express";
import accessLogController from "../controllers/accessLogController.js";
import authMiddleware from "../middleware/authMiddleware.js"; // Protect route

const router = express.Router();

// Fetch access logs (Only Admins can access)
router.get("/", authMiddleware(["Admin"]), accessLogController.getAccessLogs);

export default router;
