import sql from "mssql";
import connectDB from "../config/db.js";

const myConsentModel = {
    // Fetch User's Email
    async getUserEmail(userId) {
        const pool = await connectDB();
        if (!pool) throw new Error("Database connection failed");

        const result = await pool
            .request()
            .input("user_id", sql.Int, userId)
            .query(`
                SELECT email
                FROM consent_users
                WHERE id = @user_id;
            `);

        return result.recordset;
    },

    // Fetch User's Username
    async getUsername(userId) {
        const pool = await connectDB();
        if (!pool) throw new Error("Database connection failed");

        const result = await pool
            .request()
            .input("user_id", sql.Int, userId)
            .query(`
                SELECT username
                FROM consent_users
                WHERE id = @user_id;
            `);

        return result.recordset;
    },

    // Fetch User's Phone Number
    async getPhoneNumber(userId) {
        const pool = await connectDB();
        if (!pool) throw new Error("Database connection failed");

        const result = await pool
            .request()
            .input("user_id", sql.Int, userId)
            .query(`
                SELECT phone
                FROM consent_users
                WHERE id = @user_id;
            `);

        return result.recordset;
    },



    // Check If Consent is Given
    async checkConsentGiven(userId) {
        const pool = await connectDB();
        if (!pool) throw new Error("Database connection failed");

        const result = await pool
            .request()
            .input("user_id", sql.Int, userId)
            .query(`
                SELECT CASE 
                        WHEN EXISTS (SELECT 1 FROM consent_selected_categories WHERE consent_id = @user_id) 
                        THEN 'Yes' 
                        ELSE 'No' 
                      END AS consent_given;
            `);

        return result.recordset;
    },

    // Fetch Template Name
    async getTemplateName(userId) {
        const pool = await connectDB();
        if (!pool) throw new Error("Database connection failed");

        const result = await pool
            .request()
            .input("user_id", sql.Int, userId)
            .query(`
                SELECT DISTINCT bt.name AS template_name
                FROM consent_selected_categories csc
                JOIN consent_categories cc ON csc.category_id = cc.id
                JOIN banner_templates bt ON cc.template_id = bt.id
                WHERE csc.consent_id = @user_id;
            `);

        return result.recordset;
    },

    // Fetch All Category Names, IDs, Description, and 'Is Required' for the Template (All Categories, Not Selected Ones)
    async getAllCategoriesForTemplate(userId) {
        const pool = await connectDB();
        if (!pool) throw new Error("Database connection failed");

        const result = await pool
            .request()
            .input("user_id", sql.Int, userId)
            .query(`
                SELECT DISTINCT cc.id AS category_id, 
                                cc.name AS category_name, 
                                cc.description AS category_description, 
                                cc.is_required
                FROM consent_categories cc
                WHERE cc.template_id IN (
                    SELECT DISTINCT cc.template_id
                    FROM consent_selected_categories csc
                    JOIN consent_categories cc ON csc.category_id = cc.id
                    WHERE csc.consent_id = @user_id
                );
            `);

        return result.recordset;
    },

    // Fetch Category IDs, Subcategory Names, IDs, and Subcategory Descriptions
    async getSubcategoriesByCategory(userId) {
        const pool = await connectDB();
        if (!pool) throw new Error("Database connection failed");

        const result = await pool
            .request()
            .input("user_id", sql.Int, userId)
            .query(`
                SELECT DISTINCT cc.id AS category_id, 
                                sc.id AS subcategory_id, 
                                sc.name AS subcategory_name, 
                                sc.description AS subcategory_description
                FROM consent_categories cc
                JOIN consent_subcategories sc ON cc.id = sc.category_id
                WHERE cc.id IN (SELECT category_id FROM consent_selected_categories WHERE consent_id = @user_id);
            `);

        return result.recordset;
    },

    // Fetch Selected Categories (IDs)
    async getSelectedCategories(userId) {
        const pool = await connectDB();
        if (!pool) throw new Error("Database connection failed");

        const result = await pool
            .request()
            .input("user_id", sql.Int, userId)
            .query(`
                SELECT DISTINCT category_id
                FROM consent_selected_categories
                WHERE consent_id = @user_id;
            `);

        return result.recordset;
    },


// Update User Consent
async updateUserConsent(userId, consentGiven, selectedCategories) {
    const pool = await connectDB();
    if (!pool) throw new Error("Database connection failed");

    const transaction = pool.transaction();
    await transaction.begin();

    try {
        // Fetch the current selected categories for the user
        const result = await pool
            .request()
            .input("user_id", sql.Int, userId)
            .query(`
                SELECT category_id FROM consent_selected_categories WHERE consent_id = @user_id;
            `);

        const existingCategoryIds = result.recordset.map(row => row.category_id);

        // Save existing selected categories into consent_history before making any changes
        for (const categoryId of existingCategoryIds) {
            await pool
                .request()
                .input("user_id", sql.Int, userId)
                .input("category_id", sql.Int, categoryId)
                .input("action", sql.VarChar, "update")
                .input("timestamp", sql.DateTime, new Date())
                .query(`
                    INSERT INTO consent_history (consent_id, category_id, action, timestamp)
                    VALUES (@user_id, @category_id, @action, @timestamp);
                `);
        }

        // ✅ Update `given` status in the `consents` table
        await pool
            .request()
            .input("user_id", sql.Int, userId)
            .input("given", sql.Bit, consentGiven === "Yes" ? 1 : 0)
            .query(`
                UPDATE consents 
                SET given = @given 
                WHERE consent_user_id = @user_id;
            `);

        if (consentGiven === "No") {
            // ✅ If consent is "No", log and delete selected categories
            for (const categoryId of existingCategoryIds) {
                await pool
                    .request()
                    .input("user_id", sql.Int, userId)
                    .input("category_id", sql.Int, categoryId)
                    .input("action", sql.VarChar, "delete")
                    .input("timestamp", sql.DateTime, new Date())
                    .query(`
                        INSERT INTO consent_history (consent_id, category_id, action, timestamp)
                        VALUES (@user_id, @category_id, @action, @timestamp);
                    `);
            }

            await pool
                .request()
                .input("user_id", sql.Int, userId)
                .query(`
                    DELETE FROM consent_selected_categories WHERE consent_id = @user_id;
                `);
        } else {
            // ✅ If consent is "Yes", update selected categories
            const newCategoryIds = selectedCategories.map(cat => cat.category_id);

            // Find categories to delete
            const categoriesToDelete = existingCategoryIds.filter(id => !newCategoryIds.includes(id));
            for (const categoryId of categoriesToDelete) {
                await pool
                    .request()
                    .input("user_id", sql.Int, userId)
                    .input("category_id", sql.Int, categoryId)
                    .query(`
                        DELETE FROM consent_selected_categories 
                        WHERE consent_id = @user_id AND category_id = @category_id;
                    `);

                await pool
                    .request()
                    .input("user_id", sql.Int, userId)
                    .input("category_id", sql.Int, categoryId)
                    .input("action", sql.VarChar, "delete")
                    .input("timestamp", sql.DateTime, new Date())
                    .query(`
                        INSERT INTO consent_history (consent_id, category_id, action, timestamp)
                        VALUES (@user_id, @category_id, @action, @timestamp);
                    `);
            }

            // Insert new selected categories
            for (const categoryId of newCategoryIds) {
                if (!existingCategoryIds.includes(categoryId)) {
                    await pool
                        .request()
                        .input("user_id", sql.Int, userId)
                        .input("category_id", sql.Int, categoryId)
                        .query(`
                            INSERT INTO consent_selected_categories (consent_id, category_id) 
                            VALUES (@user_id, @category_id);
                        `);

                    await pool
                        .request()
                        .input("user_id", sql.Int, userId)
                        .input("category_id", sql.Int, categoryId)
                        .input("action", sql.VarChar, "add")
                        .input("timestamp", sql.DateTime, new Date())
                        .query(`
                            INSERT INTO consent_history (consent_id, category_id, action, timestamp)
                            VALUES (@user_id, @category_id, @action, @timestamp);
                        `);
                }
            }
        }

        await transaction.commit();
        return { success: true, message: "Consent updated successfully." };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
},



// Fetch Consent History Grouped by Sessions
async getConsentHistoryGroupedBySession(userId) {
    const pool = await connectDB();
    if (!pool) throw new Error("Database connection failed");

    const result = await pool
        .request()
        .input("user_id", sql.Int, userId)
        .query(`
            WITH history_with_gap AS (
                SELECT *,
                       LAG(timestamp) OVER (PARTITION BY consent_id ORDER BY timestamp) AS prev_timestamp
                FROM consent_history
                WHERE consent_id = @user_id
            ),
            session_grouped AS (
                SELECT *,
                       SUM(CASE 
                               WHEN DATEDIFF(SECOND, prev_timestamp, timestamp) > 30 
                               OR prev_timestamp IS NULL THEN 1 
                               ELSE 0 
                           END) OVER (PARTITION BY consent_id ORDER BY timestamp) AS session_id
                FROM history_with_gap
            )
            SELECT 
                ROW_NUMBER() OVER (ORDER BY session_id) AS "S.No",
                MIN(timestamp) AS "Date",  -- First timestamp in each session
                STRING_AGG(CAST(category_id AS VARCHAR), ', ') AS "Category IDs", 
                STRING_AGG(CAST(action AS VARCHAR), ', ') AS "Actions"  -- Aggregated actions
            FROM session_grouped
            GROUP BY consent_id, session_id
            ORDER BY "S.No";
        `);

    return result.recordset;
}






};

export default myConsentModel;
