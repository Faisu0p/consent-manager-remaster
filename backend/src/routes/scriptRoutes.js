import express from "express";
import { getFullBannerTemplateById, generateConsentScript, registerAndStoreConsent} from "../controllers/scriptController.js";

const router = express.Router();

// Route to fetch full banner template details
router.get("/banner-template/:templateId", getFullBannerTemplateById);

// Route to generate the consent script dynamically
router.get("/generate-script/:templateId", generateConsentScript);

// Route to register a new consent user and store consent details
router.post("/register-and-store-consent", registerAndStoreConsent);


export default router;
