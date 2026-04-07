import sql from "mssql";
import connectDB from "../config/db.js";

let versioningSupportCached = null;

const hasVersioningSupport = async (pool) => {
  if (versioningSupportCached !== null) {
    return versioningSupportCached;
  }

  const result = await pool
    .request()
    .query("SELECT OBJECT_ID('banner_template_versions', 'U') AS version_table_id");

  versioningSupportCached = Boolean(result.recordset[0]?.version_table_id);
  return versioningSupportCached;
};

const buildLatestTemplateVersionsQuery = () => `
  WITH ranked AS (
    SELECT
      v.*,
      ROW_NUMBER() OVER (
        PARTITION BY v.template_family_id
        ORDER BY
          CASE WHEN v.status = 'published' THEN 0 WHEN v.status = 'draft' THEN 1 ELSE 2 END,
          v.version_number DESC,
          v.id DESC
      ) AS rn
    FROM banner_template_versions v
    WHERE ISNULL(v.is_deleted, 0) = 0
  )
  SELECT *
  FROM ranked
  WHERE rn = 1
`;

const bannerTemplateModel = {
  async createTemplateFamily(name, createdBy = null) {
    const pool = await connectDB();
    if (!pool) throw new Error("Database connection failed");

    const result = await pool
      .request()
      .input("name", sql.NVarChar(255), name)
      .input("created_by", sql.NVarChar(255), createdBy)
      .query(`
        INSERT INTO template_families (name, created_by)
        OUTPUT INSERTED.id
        VALUES (@name, @created_by)
      `);

    return result.recordset[0].id;
  },

  async getNextVersionNumber(templateFamilyId) {
    const pool = await connectDB();
    if (!pool) throw new Error("Database connection failed");

    const result = await pool
      .request()
      .input("template_family_id", sql.Int, templateFamilyId)
      .query(`
        SELECT ISNULL(MAX(version_number), 0) + 1 AS next_version
        FROM banner_template_versions
        WHERE template_family_id = @template_family_id
      `);

    return result.recordset[0].next_version;
  },

  async archivePublishedVersionsInFamily(templateFamilyId, excludeVersionId = null) {
    const pool = await connectDB();
    if (!pool) throw new Error("Database connection failed");

    const request = pool
      .request()
      .input("template_family_id", sql.Int, templateFamilyId)
      .input("exclude_version_id", sql.Int, excludeVersionId);

    await request.query(`
      UPDATE banner_template_versions
      SET status = 'archived'
      WHERE template_family_id = @template_family_id
        AND status = 'published'
        AND (@exclude_version_id IS NULL OR id <> @exclude_version_id)
    `);

    await pool
      .request()
      .input("template_family_id", sql.Int, templateFamilyId)
      .input("exclude_version_id", sql.Int, excludeVersionId)
      .query(`
        UPDATE banner_templates
        SET status = 'archived'
        WHERE template_family_id = @template_family_id
          AND status = 'published'
          AND (@exclude_version_id IS NULL OR id <> @exclude_version_id)
      `);
  },

  async createBannerTemplateVersion({
    name,
    mainText,
    infoParagraph,
    headerText,
    buttonAcceptText,
    buttonRejectText,
    buttonConfigureText,
    languageCode,
    templateFamilyId = null,
    status = "published",
    previousVersionId = null,
    changeNote = null,
    createdBy = null,
  }) {
    const pool = await connectDB();
    if (!pool) throw new Error("Database connection failed");

    const canUseVersioning = await hasVersioningSupport(pool);
    if (!canUseVersioning) {
      const legacyInsert = await pool
        .request()
        .input("name", sql.NVarChar, name)
        .input("main_text", sql.NVarChar(sql.MAX), mainText)
        .input("info_paragraph", sql.NVarChar(sql.MAX), infoParagraph)
        .input("header_text", sql.NVarChar(sql.MAX), headerText)
        .input("button_accept_text", sql.NVarChar, buttonAcceptText)
        .input("button_reject_text", sql.NVarChar, buttonRejectText)
        .input("button_configure_text", sql.NVarChar, buttonConfigureText)
        .input("language_code", sql.NVarChar, languageCode)
        .query(`
          INSERT INTO banner_templates (
            name,
            main_text,
            info_paragraph,
            header_text,
            button_accept_text,
            button_reject_text,
            button_configure_text,
            language_code
          )
          OUTPUT INSERTED.id
          VALUES (
            @name,
            @main_text,
            @info_paragraph,
            @header_text,
            @button_accept_text,
            @button_reject_text,
            @button_configure_text,
            @language_code
          )
        `);

      return {
        id: legacyInsert.recordset[0].id,
        template_family_id: null,
        version_number: 1,
        status,
      };
    }

    const familyId =
      templateFamilyId ||
      (await this.createTemplateFamily(name || "Untitled Template", createdBy));

    const nextVersionNumber = await this.getNextVersionNumber(familyId);
    const normalizedStatus = status || "draft";

    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    let insertedVersion;
    try {
      const idResult = await new sql.Request(transaction).query(`
        SELECT
          CASE
            WHEN bt.max_id > btv.max_id THEN bt.max_id + 1
            ELSE btv.max_id + 1
          END AS next_id
        FROM
          (SELECT ISNULL(MAX(id), 0) AS max_id FROM banner_templates WITH (UPDLOCK, HOLDLOCK)) bt
        CROSS JOIN
          (SELECT ISNULL(MAX(id), 0) AS max_id FROM banner_template_versions WITH (UPDLOCK, HOLDLOCK)) btv
      `);

      const templateId = idResult.recordset[0].next_id;

      await new sql.Request(transaction)
        .input("id", sql.Int, templateId)
        .input("template_family_id", sql.Int, familyId)
        .input("version_number", sql.Int, nextVersionNumber)
        .input("status", sql.NVarChar(20), normalizedStatus)
        .input("language_code", sql.NVarChar(20), languageCode)
        .input("name", sql.NVarChar(255), name)
        .input("main_text", sql.NVarChar(sql.MAX), mainText)
        .input("info_paragraph", sql.NVarChar(sql.MAX), infoParagraph)
        .input("header_text", sql.NVarChar(sql.MAX), headerText)
        .input("button_accept_text", sql.NVarChar(255), buttonAcceptText)
        .input("button_reject_text", sql.NVarChar(255), buttonRejectText)
        .input("button_configure_text", sql.NVarChar(255), buttonConfigureText)
        .query(`
          SET IDENTITY_INSERT banner_templates ON;

          INSERT INTO banner_templates (
            id,
            template_family_id,
            version_number,
            status,
            name,
            main_text,
            info_paragraph,
            header_text,
            button_accept_text,
            button_reject_text,
            button_configure_text,
            language_code
          )
          VALUES (
            @id,
            @template_family_id,
            @version_number,
            @status,
            @name,
            @main_text,
            @info_paragraph,
            @header_text,
            @button_accept_text,
            @button_reject_text,
            @button_configure_text,
            @language_code
          );

          SET IDENTITY_INSERT banner_templates OFF;
        `);

      await new sql.Request(transaction)
        .input("id", sql.Int, templateId)
        .input("template_family_id", sql.Int, familyId)
        .input("version_number", sql.Int, nextVersionNumber)
        .input("status", sql.NVarChar(20), normalizedStatus)
        .input("change_note", sql.NVarChar(sql.MAX), changeNote)
        .input("previous_version_id", sql.Int, previousVersionId)
        .input("language_code", sql.NVarChar(20), languageCode)
        .input("name", sql.NVarChar(255), name)
        .input("main_text", sql.NVarChar(sql.MAX), mainText)
        .input("info_paragraph", sql.NVarChar(sql.MAX), infoParagraph)
        .input("header_text", sql.NVarChar(sql.MAX), headerText)
        .input("button_accept_text", sql.NVarChar(255), buttonAcceptText)
        .input("button_reject_text", sql.NVarChar(255), buttonRejectText)
        .input("button_configure_text", sql.NVarChar(255), buttonConfigureText)
        .input("created_by", sql.NVarChar(255), createdBy)
        .query(`
          SET IDENTITY_INSERT banner_template_versions ON;

          INSERT INTO banner_template_versions (
            id,
            template_family_id,
            version_number,
            status,
            change_note,
            previous_version_id,
            language_code,
            name,
            main_text,
            info_paragraph,
            header_text,
            button_accept_text,
            button_reject_text,
            button_configure_text,
            created_by,
            published_at
          )
          VALUES (
            @id,
            @template_family_id,
            @version_number,
            @status,
            @change_note,
            @previous_version_id,
            @language_code,
            @name,
            @main_text,
            @info_paragraph,
            @header_text,
            @button_accept_text,
            @button_reject_text,
            @button_configure_text,
            @created_by,
            CASE WHEN @status = 'published' THEN SYSDATETIME() ELSE NULL END
          );

          SET IDENTITY_INSERT banner_template_versions OFF;
        `);

      await transaction.commit();

      insertedVersion = {
        id: templateId,
        template_family_id: familyId,
        version_number: nextVersionNumber,
        status: normalizedStatus,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }

    if (normalizedStatus === "published") {
      await this.archivePublishedVersionsInFamily(familyId, insertedVersion.id);
    }

    return insertedVersion;
  },

  async createBannerTemplate(
    name,
    mainText,
    infoParagraph,
    headerText,
    buttonAcceptText,
    buttonRejectText,
    buttonConfigureText,
    language_code,
    options = {}
  ) {
    const version = await this.createBannerTemplateVersion({
      name,
      mainText,
      infoParagraph,
      headerText,
      buttonAcceptText,
      buttonRejectText,
      buttonConfigureText,
      languageCode: language_code,
      templateFamilyId: options.templateFamilyId || null,
      status: options.status || "published",
      previousVersionId: options.previousVersionId || null,
      changeNote: options.changeNote || null,
      createdBy: options.createdBy || null,
    });

    return version.id;
  },

  async createConsentPortal(templateId, upperText, lowerText) {
    const pool = await connectDB();
    if (!pool) throw new Error("Database connection failed");

    const result = await pool
      .request()
      .input("template_id", sql.Int, templateId)
      .input("upper_text", sql.NVarChar(sql.MAX), upperText)
      .input("lower_text", sql.NVarChar(sql.MAX), lowerText)
      .query(`
        INSERT INTO consent_portal (template_id, upper_text, lower_text)
        OUTPUT INSERTED.id
        VALUES (@template_id, @upper_text, @lower_text)
      `);

    return result.recordset[0].id;
  },

  async createConsentCategory(templateId, name, description, isRequired) {
    const pool = await connectDB();
    if (!pool) throw new Error("Database connection failed");

    const result = await pool
      .request()
      .input("template_id", sql.Int, templateId)
      .input("name", sql.NVarChar(255), name)
      .input("description", sql.NVarChar(sql.MAX), description)
      .input("is_required", sql.Bit, isRequired ? 1 : 0)
      .query(`
        INSERT INTO consent_categories (template_id, name, description, is_required)
        OUTPUT INSERTED.id
        VALUES (@template_id, @name, @description, @is_required)
      `);

    return result.recordset[0].id;
  },

  async createConsentSubcategory(categoryId, name, description) {
    const pool = await connectDB();
    if (!pool) throw new Error("Database connection failed");

    const result = await pool
      .request()
      .input("category_id", sql.Int, categoryId)
      .input("name", sql.NVarChar(255), name)
      .input("description", sql.NVarChar(sql.MAX), description)
      .query(`
        INSERT INTO consent_subcategories (category_id, name, description)
        OUTPUT INSERTED.id
        VALUES (@category_id, @name, @description)
      `);

    return result.recordset[0].id;
  },

  async createPartner(templateId, name, isBlocked) {
    const pool = await connectDB();
    if (!pool) throw new Error("Database connection failed");

    const result = await pool
      .request()
      .input("template_id", sql.Int, templateId)
      .input("name", sql.NVarChar(255), name)
      .input("is_blocked", sql.Bit, Boolean(isBlocked))
      .query(`
        INSERT INTO partners (template_id, name, is_blocked)
        OUTPUT INSERTED.id
        VALUES (@template_id, @name, @is_blocked)
      `);

    return result.recordset[0].id;
  },

  async getAllBannerTemplates() {
    const pool = await connectDB();
    if (!pool) throw new Error("Database connection failed");

    const canUseVersioning = await hasVersioningSupport(pool);
    if (!canUseVersioning) {
      const legacy = await pool.query("SELECT * FROM banner_templates");
      return legacy.recordset;
    }

    const latest = await pool.query(buildLatestTemplateVersionsQuery());
    return latest.recordset;
  },

  async getVersionHistoryByFamilyId(templateFamilyId) {
    const pool = await connectDB();
    if (!pool) throw new Error("Database connection failed");

    const canUseVersioning = await hasVersioningSupport(pool);
    if (!canUseVersioning) {
      return [];
    }

    const result = await pool
      .request()
      .input("template_family_id", sql.Int, templateFamilyId)
      .query(`
        SELECT *
        FROM banner_template_versions
        WHERE template_family_id = @template_family_id
          AND ISNULL(is_deleted, 0) = 0
        ORDER BY version_number DESC
      `);

    return result.recordset;
  },

  async getBannerTemplateById(templateId, options = {}) {
    const pool = await connectDB();
    if (!pool) throw new Error("Database connection failed");

    const canUseVersioning = await hasVersioningSupport(pool);
    if (!canUseVersioning) {
      const legacy = await pool
        .request()
        .input("template_id", sql.Int, templateId)
        .query("SELECT * FROM banner_templates WHERE id = @template_id");
      return legacy.recordset.length > 0 ? legacy.recordset[0] : null;
    }

    if (options.versionNumber) {
      const byFamilyAndVersion = await pool
        .request()
        .input("template_family_id", sql.Int, templateId)
        .input("version_number", sql.Int, options.versionNumber)
        .query(`
          SELECT TOP 1 *
          FROM banner_template_versions
          WHERE template_family_id = @template_family_id
            AND version_number = @version_number
            AND ISNULL(is_deleted, 0) = 0
        `);

      if (byFamilyAndVersion.recordset.length > 0) {
        return byFamilyAndVersion.recordset[0];
      }
    }

    const byVersionId = await pool
      .request()
      .input("template_id", sql.Int, templateId)
      .query(`
        SELECT TOP 1 *
        FROM banner_template_versions
        WHERE id = @template_id
          AND ISNULL(is_deleted, 0) = 0
      `);

    if (byVersionId.recordset.length > 0) {
      return byVersionId.recordset[0];
    }

    const byFamilyLatest = await pool
      .request()
      .input("template_family_id", sql.Int, templateId)
      .query(`
        SELECT TOP 1 *
        FROM banner_template_versions
        WHERE template_family_id = @template_family_id
          AND ISNULL(is_deleted, 0) = 0
        ORDER BY
          CASE WHEN status = 'published' THEN 0 WHEN status = 'draft' THEN 1 ELSE 2 END,
          version_number DESC,
          id DESC
      `);

    return byFamilyLatest.recordset.length > 0 ? byFamilyLatest.recordset[0] : null;
  },

  async getConsentPortalByTemplateId(templateId) {
    const pool = await connectDB();
    if (!pool) throw new Error("Database connection failed");

    const result = await pool
      .request()
      .input("template_id", sql.Int, templateId)
      .query("SELECT * FROM consent_portal WHERE template_id = @template_id");

    return result.recordset;
  },

  async getConsentCategories(templateId) {
    const pool = await connectDB();
    if (!pool) throw new Error("Database connection failed");

    const result = await pool
      .request()
      .input("template_id", sql.Int, templateId)
      .query("SELECT * FROM consent_categories WHERE template_id = @template_id");

    return result.recordset;
  },

  async getConsentSubcategories(categoryId) {
    const pool = await connectDB();
    if (!pool) throw new Error("Database connection failed");

    const result = await pool
      .request()
      .input("category_id", sql.Int, categoryId)
      .query("SELECT * FROM consent_subcategories WHERE category_id = @category_id");

    return result.recordset;
  },

  async getPartners(templateId) {
    const pool = await connectDB();
    if (!pool) throw new Error("Database connection failed");

    const result = await pool
      .request()
      .input("template_id", sql.Int, templateId)
      .query("SELECT * FROM partners WHERE template_id = @template_id");

    return result.recordset;
  },

  async getAllConsentPortals() {
    const pool = await connectDB();
    if (!pool) throw new Error("Database connection failed");

    const result = await pool.query("SELECT * FROM consent_portal");
    return result.recordset;
  },

  async getAllConsentCategories() {
    const pool = await connectDB();
    if (!pool) throw new Error("Database connection failed");

    const result = await pool.query("SELECT * FROM consent_categories");
    return result.recordset;
  },

  async getAllConsentSubcategories() {
    const pool = await connectDB();
    if (!pool) throw new Error("Database connection failed");

    const result = await pool.query("SELECT * FROM consent_subcategories");
    return result.recordset;
  },

  async getAllPartners() {
    const pool = await connectDB();
    if (!pool) throw new Error("Database connection failed");

    const result = await pool.query("SELECT * FROM partners");
    return result.recordset;
  },

  async getEnglishBannerTemplates() {
    const pool = await connectDB();
    if (!pool) throw new Error("Database connection failed");

    const canUseVersioning = await hasVersioningSupport(pool);
    if (!canUseVersioning) {
      const legacy = await pool
        .request()
        .query("SELECT id, name FROM banner_templates WHERE language_code = 'en'");
      return legacy.recordset;
    }

    const result = await pool.query(`
      WITH ranked AS (
        SELECT
          v.id,
          v.name,
          v.template_family_id,
          v.version_number,
          ROW_NUMBER() OVER (
            PARTITION BY v.template_family_id
            ORDER BY
              CASE WHEN v.status = 'published' THEN 0 WHEN v.status = 'draft' THEN 1 ELSE 2 END,
              v.version_number DESC,
              v.id DESC
          ) AS rn
        FROM banner_template_versions v
        WHERE v.language_code = 'en'
          AND ISNULL(v.is_deleted, 0) = 0
      )
      SELECT id, name, template_family_id, version_number
      FROM ranked
      WHERE rn = 1
    `);

    return result.recordset;
  },

  async linkBannerTemplateLanguage(templateId, mainTemplateId, languageCode) {
    const pool = await connectDB();
    if (!pool) throw new Error("Database connection failed");

    await pool
      .request()
      .input("template_id", sql.Int, templateId)
      .input("main_template_id", sql.Int, mainTemplateId)
      .input("language_code", sql.NVarChar, languageCode)
      .query(`
        INSERT INTO banner_template_languages (template_id, main_template_id, language_code)
        VALUES (@template_id, @main_template_id, @language_code)
      `);
  },

  async getTemplateIdByLanguage(mainTemplateId, languageCode) {
    const pool = await connectDB();
    if (!pool) throw new Error("Database connection failed");

    const result = await pool
      .request()
      .input("main_template_id", sql.Int, mainTemplateId)
      .input("language_code", sql.NVarChar, languageCode)
      .query(`
        SELECT template_id
        FROM banner_template_languages
        WHERE main_template_id = @main_template_id
          AND language_code = @language_code
      `);

    return result.recordset.length > 0 ? result.recordset[0] : null;
  },

  async getAvailableLanguages(mainTemplateId) {
    const pool = await connectDB();
    if (!pool) throw new Error("Database connection failed");

    const result = await pool
      .request()
      .input("main_template_id", sql.Int, mainTemplateId)
      .query(`
        SELECT language_code, template_id
        FROM banner_template_languages
        WHERE main_template_id = @main_template_id
      `);

    return result.recordset;
  },
};

export default bannerTemplateModel;
