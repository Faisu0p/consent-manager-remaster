import express from "express";
import cors from "cors";
import { config } from "./config/env.js";
import userRoute from "./routes/userRoutes.js";
import accessLogRoute from "./routes/accessLogRoutes.js";
import bannerTemplateRoute from "./routes/bannerTemplateRoutes.js";
import scriptRoute from "./routes/scriptRoutes.js";
import privacyRoutes from "./routes/privacyRoutes.js";
import viewConsentRoutes from "./routes/viewConsentRoutes.js";
import myConsentRoutes from "./routes/myConsentRoutes.js";
import modifyBannerTemplateRoute from "./routes/modifyBannerTemplateRoutes.js";
import dsrRequestRoutes from "./routes/dsrRequestRoutes.js";
import consentUserapiRoutes from "./routes/consentUserapiRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Routes for users
app.use("/api/users", userRoute);

// Routes for access logs
app.use("/api/access-logs", accessLogRoute);

// Routes for banner templates
app.use("/api/banner-templates", bannerTemplateRoute);

// Routes for scripts
app.use("/api", scriptRoute);

// Routes for privacy settings
app.use("/privacy", privacyRoutes);

// Routes for viewing consents
app.use("/api/consents", viewConsentRoutes);

// Routes for user consents
app.use("/api/consent-details", myConsentRoutes);

// Routes for modifying banner templates (Admin only)
app.use("/api/modify-template", modifyBannerTemplateRoute);

// Routes for DSR requests (Data Subject Rights requests)
app.use("/api/dsr-requests", dsrRequestRoutes);

// Routes for consent user API
app.use('/api/external', consentUserapiRoutes);



const PORT = config.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
