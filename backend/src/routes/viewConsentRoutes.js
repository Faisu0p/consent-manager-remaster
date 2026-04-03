import express from "express";
import viewConsentController from "../controllers/viewConsentController.js";

const router = express.Router();

// Route to get all user consents
router.get("/all", viewConsentController.getAllConsents);

// Route to get consents for a specific user
router.get("/user/:userId", viewConsentController.getUserConsents);

export default router;
