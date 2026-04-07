import sql from "mssql";
import connectDB from "../config/db.js";

const retrospectiveConsentModel = {
  async createCampaign({ clientName, templateId, emailSubject, emailBody, createdBy }) {
    const pool = await connectDB();
    if (!pool) throw new Error("Database connection failed");

    const result = await pool
      .request()
      .input("client_name", sql.NVarChar(255), clientName)
      .input("template_id", sql.Int, templateId)
      .input("email_subject", sql.NVarChar(255), emailSubject)
      .input("email_body", sql.NVarChar(sql.MAX), emailBody)
      .input("created_by", sql.NVarChar(255), createdBy || null)
      .query(`
        INSERT INTO retrospective_consent_campaigns (
          client_name,
          template_id,
          email_subject,
          email_body,
          created_by
        )
        OUTPUT INSERTED.id
        VALUES (@client_name, @template_id, @email_subject, @email_body, @created_by)
      `);

    return result.recordset[0]?.id;
  },

  async createInvite({ campaignId, email, tokenHash, expiresAt, lastSentAt = null }) {
    const pool = await connectDB();
    if (!pool) throw new Error("Database connection failed");

    const result = await pool
      .request()
      .input("campaign_id", sql.Int, campaignId)
      .input("email", sql.NVarChar(255), email)
      .input("token_hash", sql.NVarChar(128), tokenHash)
      .input("expires_at", sql.DateTime2, expiresAt)
      .input("last_sent_at", sql.DateTime2, lastSentAt)
      .query(`
        INSERT INTO retrospective_consent_invites (
          campaign_id,
          email,
          token_hash,
          expires_at,
          last_sent_at
        )
        OUTPUT INSERTED.id
        VALUES (
          @campaign_id,
          @email,
          @token_hash,
          @expires_at,
          @last_sent_at
        )
      `);

    return result.recordset[0]?.id;
  },

  async updateInviteAfterDelivery(inviteId, { wasSent }) {
    const pool = await connectDB();
    if (!pool) throw new Error("Database connection failed");

    if (wasSent) {
      await pool
        .request()
        .input("id", sql.Int, inviteId)
        .query(`
          UPDATE retrospective_consent_invites
          SET
            last_sent_at = SYSDATETIME(),
            updated_at = SYSDATETIME()
          WHERE id = @id
        `);
      return;
    }

    await pool
      .request()
      .input("id", sql.Int, inviteId)
      .input("status", sql.NVarChar(20), "delivery_failed")
      .query(`
        UPDATE retrospective_consent_invites
        SET
          status = @status,
          updated_at = SYSDATETIME()
        WHERE id = @id
      `);
  },

  async getInviteByTokenHash(tokenHash) {
    const pool = await connectDB();
    if (!pool) throw new Error("Database connection failed");

    const result = await pool
      .request()
      .input("token_hash", sql.NVarChar(128), tokenHash)
      .query(`
        SELECT
          rci.id,
          rci.campaign_id,
          rci.email,
          rci.status,
          rci.expires_at,
          rci.responded_at,
          rci.consent_user_id,
          rci.consent_id,
          rcc.client_name,
          rcc.template_id,
          rcc.email_subject,
          rcc.email_body
        FROM retrospective_consent_invites rci
        INNER JOIN retrospective_consent_campaigns rcc
          ON rcc.id = rci.campaign_id
        WHERE rci.token_hash = @token_hash
      `);

    return result.recordset[0] || null;
  },

  async markInviteStatus(inviteId, status, { consentUserId = null, consentId = null } = {}) {
    const pool = await connectDB();
    if (!pool) throw new Error("Database connection failed");

    await pool
      .request()
      .input("id", sql.Int, inviteId)
      .input("status", sql.NVarChar(20), status)
      .input("consent_user_id", sql.Int, consentUserId)
      .input("consent_id", sql.Int, consentId)
      .query(`
        UPDATE retrospective_consent_invites
        SET
          status = @status,
          responded_at = CASE WHEN @status IN ('accepted', 'rejected') THEN SYSDATETIME() ELSE responded_at END,
          consent_user_id = COALESCE(@consent_user_id, consent_user_id),
          consent_id = COALESCE(@consent_id, consent_id),
          updated_at = SYSDATETIME()
        WHERE id = @id
      `);
  },

  async getCampaignInviteStats(campaignId) {
    const pool = await connectDB();
    if (!pool) throw new Error("Database connection failed");

    const result = await pool
      .request()
      .input("campaign_id", sql.Int, campaignId)
      .query(`
        SELECT
          COUNT(1) AS total,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
          SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) AS accepted,
          SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected,
          SUM(CASE WHEN status = 'expired' THEN 1 ELSE 0 END) AS expired
        FROM retrospective_consent_invites
        WHERE campaign_id = @campaign_id
      `);

    return result.recordset[0] || {
      total: 0,
      pending: 0,
      accepted: 0,
      rejected: 0,
      expired: 0,
    };
  },
};

export default retrospectiveConsentModel;
