import sql from "mssql";
import connectDB from "../config/db.js";
import bcrypt from "bcryptjs";

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

    // Create a new consent user in current schema (email + password)
    async createConsentUser(username, email, phone) {
        try {
            const pool = await connectDB();
            if (!pool) throw new Error("Database connection failed");

            if (!email) {
                throw new Error("Email is required to create consent user");
            }

            const seed = `${username || email}:${Date.now()}`;
            const passwordHash = await bcrypt.hash(seed, 10);

            const result = await pool
                .request()
                .input("email", sql.VarChar, email)
                .input("password", sql.VarChar, passwordHash)
                .query(
                    "INSERT INTO consent_users (email, password) OUTPUT INSERTED.id VALUES (@email, @password)"
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

    // Find user by email. Phone lookup is not supported by current consent_users schema.
async getConsentUserByEmailOrPhone(email, phone) {
    try {
        const pool = await connectDB();
        if (!pool) throw new Error("Database connection failed");

            if (!email) {
                return null;
            }

        const result = await pool
            .request()
                .input("email", sql.VarChar, email)
            .query(`
                SELECT id FROM consent_users 
                    WHERE email = @email
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
