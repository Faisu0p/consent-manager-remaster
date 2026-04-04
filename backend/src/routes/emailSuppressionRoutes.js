import express from "express";
import emailSuppressionController from "../controllers/emailSuppressionController.js";

const router = express.Router();

router.post("/", emailSuppressionController.createSuppressedEmail);
router.get("/", emailSuppressionController.getAllSuppressedEmails);
router.delete("/:id", emailSuppressionController.deleteSuppressedEmail);

export default router;