import express from "express";
import retrospectiveConsentController from "../controllers/retrospectiveConsentController.js";

const router = express.Router();

router.post("/campaigns", retrospectiveConsentController.createCampaign);
router.get("/campaigns/:campaignId/stats", retrospectiveConsentController.getCampaignStats);
router.get("/invite/:token", retrospectiveConsentController.getInviteDetails);
router.post("/invite/:token/submit", retrospectiveConsentController.submitInviteConsent);

export default router;
