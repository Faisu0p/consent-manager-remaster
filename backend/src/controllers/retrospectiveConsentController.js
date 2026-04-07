import crypto from "crypto";
import bannerTemplateModel from "../models/bannerTemplateModel.js";
import consentModel from "../models/consentModel.js";
import retrospectiveConsentModel from "../models/retrospectiveConsentModel.js";
import { sendRetrospectiveConsentEmail } from "../services/emailService.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const buildConsentLink = (token) => {
  const baseUrl = process.env.FRONTEND_BASE_URL?.trim() || "http://localhost:5173";
  return `${baseUrl.replace(/\/$/, "")}/retrospective-consent?token=${encodeURIComponent(token)}`;
};

const parseEmails = (emails = []) => {
  const seen = new Set();
  const valid = [];
  const invalid = [];

  for (const raw of emails) {
    const email = String(raw || "").trim().toLowerCase();
    if (!email) {
      continue;
    }

    if (!EMAIL_REGEX.test(email)) {
      invalid.push(email);
      continue;
    }

    if (!seen.has(email)) {
      seen.add(email);
      valid.push(email);
    }
  }

  return { valid, invalid };
};

const parseExpiryDays = (value) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return 30;
  }
  return Math.max(1, Math.min(365, parsed));
};

const formatTemplateBody = (template, data) => {
  return template
    .replaceAll("{{clientName}}", data.clientName)
    .replaceAll("{{consentLink}}", data.consentLink)
    .replaceAll("{{email}}", data.email);
};

const getInviteStatus = (invite) => {
  if (!invite) {
    return "invalid";
  }

  if (invite.status !== "pending") {
    return invite.status;
  }

  const isExpired = new Date(invite.expires_at).getTime() < Date.now();
  return isExpired ? "expired" : "pending";
};

const retrospectiveConsentController = {
  async createCampaign(req, res) {
    try {
      const {
        clientName,
        templateId,
        emails,
        emailSubject,
        emailBody,
        expiresInDays = 30,
      } = req.body;

      if (!clientName || typeof clientName !== "string") {
        return res.status(400).json({ message: "clientName is required" });
      }

      const parsedTemplateId = Number.parseInt(templateId, 10);
      if (Number.isNaN(parsedTemplateId)) {
        return res.status(400).json({ message: "templateId must be a valid number" });
      }

      if (!Array.isArray(emails) || emails.length === 0) {
        return res.status(400).json({ message: "emails array is required" });
      }

      const template = await bannerTemplateModel.getBannerTemplateById(parsedTemplateId);
      if (!template) {
        return res.status(404).json({ message: "Banner template not found" });
      }

      const { valid: validEmails, invalid: invalidEmails } = parseEmails(emails);

      if (validEmails.length === 0) {
        return res.status(400).json({
          message: "No valid emails found in payload",
          invalidEmails,
        });
      }

      const subject =
        (emailSubject && String(emailSubject).trim()) ||
        `${clientName.trim()}: please review your consent preferences`;

      const bodyTemplate =
        (emailBody && String(emailBody).trim()) ||
        "Hello,\n\n{{clientName}} needs your consent preferences in our consent platform. Please click the link below to continue:\n\n{{consentLink}}\n\nIf this was not expected, you can ignore this email.";

      const campaignId = await retrospectiveConsentModel.createCampaign({
        clientName: clientName.trim(),
        templateId: parsedTemplateId,
        emailSubject: subject,
        emailBody: bodyTemplate,
        createdBy: req.user?.email || null,
      });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseExpiryDays(expiresInDays));

      const sent = [];
      const failed = [];

      for (const email of validEmails) {
        const token = crypto.randomBytes(32).toString("hex");
        const tokenHash = hashToken(token);
        const consentLink = buildConsentLink(token);
        const renderedBody = formatTemplateBody(bodyTemplate, {
          clientName: clientName.trim(),
          consentLink,
          email,
        });

        const inviteId = await retrospectiveConsentModel.createInvite({
          campaignId,
          email,
          tokenHash,
          expiresAt,
        });

        try {
          await sendRetrospectiveConsentEmail({
            to: email,
            subject,
            text: renderedBody,
            html: renderedBody.replace(/\n/g, "<br />"),
          });

          await retrospectiveConsentModel.updateInviteAfterDelivery(inviteId, { wasSent: true });

          sent.push({ inviteId, email });
        } catch (emailError) {
          await retrospectiveConsentModel.updateInviteAfterDelivery(inviteId, {
            wasSent: false,
          });
          failed.push({ inviteId, email, error: emailError.message });
        }
      }

      res.status(201).json({
        message: "Retrospective consent campaign created",
        campaignId,
        templateId: parsedTemplateId,
        totalEmails: validEmails.length,
        sentCount: sent.length,
        failedCount: failed.length,
        invalidEmails,
        failed,
      });
    } catch (error) {
      console.error("Error creating retrospective campaign:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  async getInviteDetails(req, res) {
    try {
      const { token } = req.params;
      if (!token) {
        return res.status(400).json({ message: "Invite token is required" });
      }

      const tokenHash = hashToken(token);
      const invite = await retrospectiveConsentModel.getInviteByTokenHash(tokenHash);
      const status = getInviteStatus(invite);

      if (!invite || status === "invalid") {
        return res.status(404).json({ message: "Invite not found" });
      }

      if (status === "expired") {
        await retrospectiveConsentModel.markInviteStatus(invite.id, "expired");
        return res.status(410).json({ message: "Invite link has expired" });
      }

      if (status !== "pending") {
        return res.status(409).json({ message: `Invite already ${status}` });
      }

      const template = await bannerTemplateModel.getBannerTemplateById(invite.template_id);
      if (!template) {
        return res.status(404).json({ message: "Template not found for invite" });
      }

      const categories = await bannerTemplateModel.getConsentCategories(invite.template_id);
      const categoriesWithSubcategories = await Promise.all(
        categories.map(async (category) => ({
          ...category,
          subcategories: await bannerTemplateModel.getConsentSubcategories(category.id),
        }))
      );

      const portal = await bannerTemplateModel.getConsentPortalByTemplateId(invite.template_id);

      res.status(200).json({
        invite: {
          campaignId: invite.campaign_id,
          email: invite.email,
          clientName: invite.client_name,
          templateId: invite.template_id,
          expiresAt: invite.expires_at,
        },
        template,
        categories: categoriesWithSubcategories,
        portal: portal[0] || null,
      });
    } catch (error) {
      console.error("Error fetching retrospective invite details:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  async submitInviteConsent(req, res) {
    try {
      const { token } = req.params;
      const { given, selectedCategories = [] } = req.body;

      if (!token) {
        return res.status(400).json({ message: "Invite token is required" });
      }

      if (typeof given !== "boolean") {
        return res.status(400).json({ message: "given must be boolean" });
      }

      if (!Array.isArray(selectedCategories) || !selectedCategories.every(Number.isInteger)) {
        return res.status(400).json({ message: "selectedCategories must be an integer array" });
      }

      const tokenHash = hashToken(token);
      const invite = await retrospectiveConsentModel.getInviteByTokenHash(tokenHash);
      const status = getInviteStatus(invite);

      if (!invite || status === "invalid") {
        return res.status(404).json({ message: "Invite not found" });
      }

      if (status === "expired") {
        await retrospectiveConsentModel.markInviteStatus(invite.id, "expired");
        return res.status(410).json({ message: "Invite link has expired" });
      }

      if (status !== "pending") {
        return res.status(409).json({ message: `Invite already ${status}` });
      }

      const templateCategories = await bannerTemplateModel.getConsentCategories(invite.template_id);
      const templateCategoryIds = templateCategories.map((category) => category.id);

      const invalidCategory = selectedCategories.find((categoryId) => !templateCategoryIds.includes(categoryId));
      if (invalidCategory) {
        return res.status(400).json({
          message: `Selected category ${invalidCategory} does not belong to this consent template`,
        });
      }

      if (given) {
        const requiredCategoryIds = templateCategories
          .filter((category) => category.is_required)
          .map((category) => category.id);

        const missingRequired = requiredCategoryIds.filter(
          (requiredId) => !selectedCategories.includes(requiredId)
        );

        if (missingRequired.length > 0) {
          return res.status(400).json({
            message: "All required consent categories must be accepted",
            missingRequiredCategories: missingRequired,
          });
        }
      }

      const existingUser = await consentModel.getConsentUserByEmail(invite.email);
      const consentUserId =
        existingUser?.id ||
        (await consentModel.createConsentUser(invite.email.split("@")[0], invite.email, null));

      const consentId = await consentModel.createConsent(consentUserId, given);

      if (given && selectedCategories.length > 0) {
        await consentModel.createConsentCategories(consentId, selectedCategories);
      }

      await retrospectiveConsentModel.markInviteStatus(
        invite.id,
        given ? "accepted" : "rejected",
        { consentUserId, consentId }
      );

      res.status(200).json({
        message: "Consent submitted successfully",
        consentUserId,
        consentId,
      });
    } catch (error) {
      console.error("Error submitting retrospective consent:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  async getCampaignStats(req, res) {
    try {
      const campaignId = Number.parseInt(req.params.campaignId, 10);
      if (Number.isNaN(campaignId)) {
        return res.status(400).json({ message: "campaignId must be a valid number" });
      }

      const stats = await retrospectiveConsentModel.getCampaignInviteStats(campaignId);
      res.status(200).json({ campaignId, stats });
    } catch (error) {
      console.error("Error fetching campaign stats:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};

export default retrospectiveConsentController;
