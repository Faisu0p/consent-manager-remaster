import sql from "mssql";
import connectDB from "../config/db.js";

const viewConsentModel = {
    // Get all user consents with merged categories
    async getAllConsents() {
        const pool = await connectDB();
        if (!pool) throw new Error("Database connection failed");

        const result = await pool
            .request()
            .query(`
                SELECT 
                    c.id AS consent_id,
                    cu.id AS user_id,
                    cu.email AS user_email,  
                    bt.name AS template_name,   
                    COALESCE(STRING_AGG(cc.name, ', '), 'No Consent Given') AS category_names, 
                    c.given AS consent_status,  
                    c.timestamp AS consent_date
                FROM consents c
                JOIN consent_users cu ON c.consent_user_id = cu.id
                LEFT JOIN consent_selected_categories csc ON c.id = csc.consent_id  
                LEFT JOIN consent_categories cc ON csc.category_id = cc.id  
                LEFT JOIN banner_templates bt ON cc.template_id = bt.id  
                GROUP BY c.id, cu.id, cu.email, bt.name, c.given, c.timestamp
                ORDER BY c.timestamp DESC;
            `);

        return result.recordset;
    },

    async getUserConsents(userId) {
        const pool = await connectDB();
        if (!pool) throw new Error("Database connection failed");

        const result = await pool
            .request()
            .input("user_id", sql.Int, userId)
            .query(`
                SELECT 
                    c.id AS consent_id,
                    cu.id AS user_id,
                    cu.email AS user_email,  
                    bt.id AS template_id,    -- Ensure you are selecting this
                    bt.name AS template_name, -- Ensure you are selecting this
                    COALESCE(STRING_AGG(cc.name, ', '), 'No Consent Given') AS category_names, 
                    COALESCE(
                        STRING_AGG(CONCAT(cc.name, ': ', cs.name), '; '), 
                        'No Subcategories'
                    ) AS category_subcategory_mapping,
                    COALESCE(STRING_AGG(p.name, ', '), 'No Partners') AS partner_names,
                    c.given AS consent_status,  
                    c.timestamp AS consent_date
                FROM consents c
                JOIN consent_users cu ON c.consent_user_id = cu.id
                LEFT JOIN consent_selected_categories csc ON c.id = csc.consent_id  
                LEFT JOIN consent_categories cc ON csc.category_id = cc.id  
                LEFT JOIN banner_templates bt ON cc.template_id = bt.id  -- Ensure this join is present
                LEFT JOIN consent_subcategories cs ON cc.id = cs.category_id  
                LEFT JOIN partners p ON bt.id = p.template_id
                WHERE cu.id = @user_id
                GROUP BY c.id, cu.id, cu.email, bt.id, bt.name, c.given, c.timestamp
                ORDER BY c.timestamp DESC;
            `);

        return result.recordset;
    },

    async getCategoriesByConsentId(consentId) {
        const pool = await connectDB();
        if (!pool) throw new Error("Database connection failed");

        const result = await pool
            .request()
            .input("consent_id", sql.Int, consentId)
            .query(`
                SELECT cc.id AS category_id, cc.name AS category_name 
                FROM consent_selected_categories csc
                JOIN consent_categories cc ON csc.category_id = cc.id
                WHERE csc.consent_id = @consent_id;
            `);

        return result.recordset;
    },

    async getSubcategoriesByCategoryId(categoryId) {
        const pool = await connectDB();
        if (!pool) throw new Error("Database connection failed");

        const result = await pool
            .request()
            .input("category_id", sql.Int, categoryId)
            .query(`
                SELECT cs.id AS subcategory_id, cs.name AS subcategory_name 
                FROM consent_subcategories cs
                WHERE cs.category_id = @category_id;
            `);

        return result.recordset;
    },

    async getPartnersByTemplateId(templateId) {
        const pool = await connectDB();
        if (!pool) throw new Error("Database connection failed");

        const result = await pool
            .request()
            .input("template_id", sql.Int, templateId)
            .query(`
                SELECT p.id AS partner_id, p.name AS partner_name
                FROM partners p
                WHERE p.template_id = @template_id;
            `);

        return result.recordset;
    }

};

export default viewConsentModel;
