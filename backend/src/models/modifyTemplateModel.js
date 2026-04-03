import sql from "mssql";
import connectDB from "../config/db.js";

const modifyTemplateModel = {
    
    // Fetch existing categories for a given template
    async getExistingCategories(templateId) {
        const pool = await connectDB();
        if (!pool) throw new Error("Database connection failed");

        const result = await pool
            .request()
            .input("templateId", sql.Int, templateId)
            .query(`SELECT id, name FROM consent_categories WHERE template_id = @templateId`);

        return result.recordset; // Returns list of existing categories
    },

    // Fetch existing subcategories for a given category
    async getExistingSubcategories(categoryId) {
        const pool = await connectDB();
        if (!pool) throw new Error("Database connection failed");

        const result = await pool
            .request()
            .input("categoryId", sql.Int, categoryId)
            .query(`SELECT id, name FROM consent_subcategories WHERE category_id = @categoryId`);

        return result.recordset; // Returns list of existing subcategories
    },

    // Insert a new category
    async addCategory(templateId, name, description, isMandatory) {
        const pool = await connectDB();
        if (!pool) throw new Error("Database connection failed");

        const result = await pool
            .request()
            .input("templateId", sql.Int, templateId)
            .input("name", sql.NVarChar, name)
            .input("description", sql.NVarChar, description)
            .input("isMandatory", sql.Bit, isMandatory)
            .query(`
                INSERT INTO consent_categories (template_id, name, description, is_required) 
                OUTPUT INSERTED.id 
                VALUES (@templateId, @name, @description, @isMandatory)
            `);

        return result.recordset[0].id; // Return new category ID
    },

    // Insert a new subcategory
    async addSubcategory(categoryId, name, description) {
        const pool = await connectDB();
        if (!pool) throw new Error("Database connection failed");

        const result = await pool
            .request()
            .input("categoryId", sql.Int, categoryId)
            .input("name", sql.NVarChar, name)
            .input("description", sql.NVarChar, description)
            .query(`
                INSERT INTO consent_subcategories (category_id, name, description) 
                VALUES (@categoryId, @name, @description)
            `);

        return result.rowsAffected[0]; // Return success status
    }
};

export default modifyTemplateModel;
