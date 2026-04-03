import express from "express";
import { getEmbedScript } from "../controllers/privacyController.js";

const router = express.Router();

router.get("/embed.js", getEmbedScript);

export default router;
