import sql from "mssql";
import connectDB from "../config/db.js";

const consentModel = {
    // Check if a user exists by email
    async getConsentUserByEmail(email) {
        try {
            const pool = await connectDB();
            if (!pool) throw new Error("Database connection failed");

            const result = await pool
                .request()
                .input("email", sql.VarChar, email)
                .query("SELECT id FROM consent_users WHERE email = @email");

            return result.recordset.length > 0 ? result.recordset[0] : null;
        } catch (error) {
            console.error("Error in getConsentUserByEmail:", error);
            throw error;
        }
    },

    // Create a new consent user (with username, email, and phone)
    async createConsentUser(username, email, phone) {
        try {
            const pool = await connectDB();
            if (!pool) throw new Error("Database connection failed");

            const result = await pool
                .request()
                .input("username", sql.VarChar, username)
                .input("email", sql.VarChar, email)
                .input("phone", sql.VarChar, phone)
                .query(
                    "INSERT INTO consent_users (username, email, phone) OUTPUT INSERTED.id VALUES (@username, @email, @phone)"
                );

            return result.recordset[0].id;
        } catch (error) {
            console.error("Error in createConsentUser:", error);
            throw error;
        }
    },

    // Insert a new consent record
    async createConsent(consentUserId, given) {
        try {
            const pool = await connectDB();
            if (!pool) throw new Error("Database connection failed");

            const result = await pool
                .request()
                .input("consentUserId", sql.Int, consentUserId)
                .input("given", sql.Bit, given)
                .query(
                    "INSERT INTO consents (consent_user_id, given) OUTPUT INSERTED.id VALUES (@consentUserId, @given)"
                );

            return result.recordset[0].id;
        } catch (error) {
            console.error("Error in createConsent:", error);
            throw error;
        }
    },

    // Insert selected consent categories
    async createConsentCategories(consentId, categoryIds) {
        const pool = await connectDB();
        if (!pool) throw new Error("Database connection failed");

        const transaction = pool.transaction();

        try {
            await transaction.begin();

            for (const categoryId of categoryIds) {
                const request = transaction.request(); // New request per iteration
                await request
                    .input("consentId", sql.Int, consentId)
                    .input("categoryId", sql.Int, categoryId)
                    .query(
                        "INSERT INTO consent_selected_categories (consent_id, category_id) VALUES (@consentId, @categoryId)"
                    );
            }

            await transaction.commit();
            return true;
        } catch (error) {
            await transaction.rollback();
            console.error("Error in createConsentCategories:", error);
            throw error;
        }
    },

    // Add this function to find a user by either email or phone
async getConsentUserByEmailOrPhone(email, phone) {
    try {
        const pool = await connectDB();
        if (!pool) throw new Error("Database connection failed");

        const result = await pool
            .request()
            .input("email", sql.VarChar, email || '')
            .input("phone", sql.VarChar, phone || '')
            .query(`
                SELECT id FROM consent_users 
                WHERE (email = @email AND @email != '') 
                   OR (phone = @phone AND @phone != '')
            `);

        return result.recordset.length > 0 ? result.recordset[0] : null;
    } catch (error) {
        console.error("Error in getConsentUserByEmailOrPhone:", error);
        throw error;
    }
},

// Add this function to check if a consent already exists for a user
async getConsentByUserId(userId) {
    try {
        const pool = await connectDB();
        if (!pool) throw new Error("Database connection failed");

        const result = await pool
            .request()
            .input("userId", sql.Int, userId)
            .query("SELECT id FROM consents WHERE consent_user_id = @userId");

        return result.recordset.length > 0 ? result.recordset[0] : null;
    } catch (error) {
        console.error("Error in getConsentByUserId:", error);
        throw error;
    }
}
};

export default consentModel;
