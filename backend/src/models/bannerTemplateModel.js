import sql from "mssql";
import connectDB from "../config/db.js";

const bannerTemplateModel = {

// Create a new banner template
async createBannerTemplate(name, mainText, infoParagraph, headerText, buttonAcceptText, buttonRejectText, buttonConfigureText, language_code) {
    const pool = await connectDB();
    if (!pool) throw new Error("Database connection failed");

    const result = await pool
        .request()
        .input("name", sql.NVarChar, name)
        .input("main_text", sql.NVarChar(sql.MAX), mainText)
        .input("info_paragraph", sql.NVarChar(sql.MAX), infoParagraph)
        .input("header_text", sql.NVarChar(sql.MAX), headerText)
        .input("button_accept_text", sql.NVarChar, buttonAcceptText)
        .input("button_reject_text", sql.NVarChar, buttonRejectText)
        .input("button_configure_text", sql.NVarChar, buttonConfigureText)
        .input("language_code", sql.NVarChar, language_code)
        .query(`
            INSERT INTO banner_templates (name, main_text, info_paragraph, header_text, button_accept_text, button_reject_text, button_configure_text, language_code) 
            OUTPUT INSERTED.id
            VALUES (@name, @main_text, @info_paragraph, @header_text, @button_accept_text, @button_reject_text, @button_configure_text, @language_code)
        `);

    return result.recordset[0].id;
},


// Create a new consent portal
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

    

// Create a new consent category
async createConsentCategory(templateId, name, description, isRequired) {
    const pool = await connectDB();
    if (!pool) throw new Error("Database connection failed");

    const result = await pool
        .request()
        .input("template_id", sql.Int, templateId)
        .input("name", sql.NVarChar(255), name)  // Supports Unicode
        .input("description", sql.NVarChar(sql.MAX), description)  // Supports long text in multiple languages
        .input("is_required", sql.Bit, isRequired ? 1 : 0) // Ensure boolean is properly stored
        .query(`
            INSERT INTO consent_categories (template_id, name, description, is_required) 
            OUTPUT INSERTED.id
            VALUES (@template_id, @name, @description, @is_required)
        `);

    return result.recordset[0].id;
},


// Create a new consent subcategory
async createConsentSubcategory(categoryId, name, description) {
    const pool = await connectDB();
    if (!pool) throw new Error("Database connection failed");

    const result = await pool
        .request()
        .input("category_id", sql.Int, categoryId)
        .input("name", sql.NVarChar(255), name)  // Unicode support
        .input("description", sql.NVarChar(sql.MAX), description)  // Long text support
        .query(`
            INSERT INTO consent_subcategories (category_id, name, description) 
            OUTPUT INSERTED.id
            VALUES (@category_id, @name, @description)
        `);

    return result.recordset[0].id;
},


// Create a new partner
async createPartner(templateId, name, isBlocked) {
    const pool = await connectDB();
    if (!pool) throw new Error("Database connection failed");

    const result = await pool
        .request()
        .input("template_id", sql.Int, templateId)
        .input("name", sql.NVarChar(255), name)  // Unicode support
        .input("is_blocked", sql.Bit, Boolean(isBlocked))  // Ensure boolean value
        .query(`
            INSERT INTO partners (template_id, name, is_blocked) 
            OUTPUT INSERTED.id
            VALUES (@template_id, @name, @is_blocked)
        `);

    return result.recordset[0].id;
},



    // Get all banner templates
    async getAllBannerTemplates() {
        const pool = await connectDB();
        if (!pool) throw new Error("Database connection failed");

        const result = await pool.query("SELECT * FROM banner_templates");

        return result.recordset;
    },

    // Get a specific banner template by ID
    async getBannerTemplateById(templateId) {
        const pool = await connectDB();
        if (!pool) throw new Error("Database connection failed");

        const result = await pool
            .request()
            .input("template_id", sql.Int, templateId)
            .query("SELECT * FROM banner_templates WHERE id = @template_id");

        return result.recordset.length > 0 ? result.recordset[0] : null; 
    },


    // Get a specific consent portal by template ID
    async getConsentPortalByTemplateId(templateId) {
        const pool = await connectDB();
        if (!pool) throw new Error("Database connection failed");
    
        const result = await pool
            .request()
            .input("template_id", sql.Int, templateId)
            .query("SELECT * FROM consent_portal WHERE template_id = @template_id");
    
        return result.recordset;
    },
    

    // Get all consent categories for a specific template
    async getConsentCategories(templateId) {
        const pool = await connectDB();
        if (!pool) throw new Error("Database connection failed");

        const result = await pool
            .request()
            .input("template_id", sql.Int, templateId)
            .query("SELECT * FROM consent_categories WHERE template_id = @template_id");

        return result.recordset;
    },

    // Get all consent subcategories for a specific category
    async getConsentSubcategories(categoryId) {
        const pool = await connectDB();
        if (!pool) throw new Error("Database connection failed");

        const result = await pool
            .request()
            .input("category_id", sql.Int, categoryId)
            .query("SELECT * FROM consent_subcategories WHERE category_id = @category_id");

        return result.recordset;
    },

    // Get all partners for a specific template
    async getPartners(templateId) {
        const pool = await connectDB();
        if (!pool) throw new Error("Database connection failed");

        const result = await pool
            .request()
            .input("template_id", sql.Int, templateId)
            .query("SELECT * FROM partners WHERE template_id = @template_id");

        return result.recordset;
    },

    // All Banner Templates
    async getAllBannerTemplates() {
        const pool = await connectDB();
        if (!pool) throw new Error("Database connection failed");

        const result = await pool.query("SELECT * FROM banner_templates");
        return result.recordset;
    },

    // All Consent Portals
    async getAllConsentPortals() {
        const pool = await connectDB();
        if (!pool) throw new Error("Database connection failed");

        const result = await pool.query("SELECT * FROM consent_portal");
        return result.recordset;
    },

    // All Consent Categories
    async getAllConsentCategories() {
        const pool = await connectDB();
        if (!pool) throw new Error("Database connection failed");

        const result = await pool.query("SELECT * FROM consent_categories");
        return result.recordset;
    },

    // All Consent Subcategories
    async getAllConsentSubcategories() {
        const pool = await connectDB();
        if (!pool) throw new Error("Database connection failed");

        const result = await pool.query("SELECT * FROM consent_subcategories");
        return result.recordset;
    },

    // All Partners
    async getAllPartners() {
        const pool = await connectDB();
        if (!pool) throw new Error("Database connection failed");

        const result = await pool.query("SELECT * FROM partners");
        return result.recordset;
    },

    async getEnglishBannerTemplates() {
        const pool = await connectDB();
        if (!pool) throw new Error("Database connection failed");
    
        const result = await pool
            .request()
            .query("SELECT id, name FROM banner_templates WHERE language_code = 'en'");
    
        return result.recordset; // Returns an array of English templates
    },

    // Link a banner template to a specific language
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

    // Get a template ID by language
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
    
        return result.recordset; // Returns array of { language_code, template_id }
    }
    
    
    
    
    

};

export default bannerTemplateModel;
