import sql from "mssql";
import connectDB from "../config/db.js";

const consentUserapiModel = {



    //Api's for User Details 

    // ✅ Get all users details
    async getAllUsers() {
        const pool = await connectDB();
        if (!pool) throw new Error("Database connection failed");
    
        const result = await pool.request().query(`
            SELECT id, email, username, phone FROM consent_users
        `);
    
        return result.recordset;
    },

    // ✅ Get user details by email
    async getUserByEmail(email) {
        const pool = await connectDB();
        if (!pool) throw new Error("Database connection failed");

        const result = await pool.request()
            .input("email", sql.NVarChar, email)
            .query(`
                SELECT id, email, username, phone
                FROM consent_users
                WHERE email = @email
            `);

        return result.recordset[0] || null;
    },

    // ✅ Get user details by phone number
    async getUserByPhone(phone) {
        const pool = await connectDB();
        if (!pool) throw new Error("Database connection failed");

        const result = await pool.request()
            .input("phone", sql.NVarChar, phone)
            .query(`
                SELECT id, email, username, phone
                FROM consent_users
                WHERE phone = @phone
            `);

        return result.recordset[0] || null;
    },

    // ✅ Get user details by ID
    async getUserById(id) {
        const pool = await connectDB();
        if (!pool) throw new Error("Database connection failed");

        const result = await pool.request()
            .input("id", sql.Int, id)
            .query(`
                SELECT id, email, username, phone
                FROM consent_users
                WHERE id = @id
            `);

        return result.recordset[0] || null;
    },

    // ✅ Get user details by username
    async getUserByUsername(username) {
        const pool = await connectDB();
        if (!pool) throw new Error("Database connection failed");

        const result = await pool.request()
            .input("username", sql.NVarChar, username)
            .query(`
                SELECT id, email, username, phone
                FROM consent_users
                WHERE username = @username
            `);

        return result.recordset[0] || null;
    },
    




// ________________________Api for consent Details _____________________________
// ✅ Get user consent by email
async getUserConsentDetailsByEmail(email) {
    const pool = await connectDB();
    try {
        const request = pool.request();
        request.input("email", email);

        const result = await request.query(`
            -- Fetch user consent details by email
            SELECT 
                cu.email, 
                bt.name AS template_name, 
                STRING_AGG(cc.name, ', ') AS selected_categories, 
                c.given AS consent_given, 
                c.timestamp
            FROM consent_users cu
            INNER JOIN consents c ON cu.id = c.consent_user_id
            LEFT JOIN consent_selected_categories csc ON c.id = csc.consent_id
            LEFT JOIN consent_categories cc ON csc.category_id = cc.id
            INNER JOIN banner_templates bt ON cc.template_id = bt.id
            WHERE cu.email = @email
            GROUP BY cu.email, bt.name, c.given, c.timestamp;
        `);

        return result.recordset;

    } catch (err) {
        console.error("Error fetching user consent details:", err);
        throw err;
    }
},

// Get user consent details by phone number
async getUserConsentDetailsByPhone(phone) {
    const pool = await connectDB();
    try {
        const request = pool.request();
        request.input("phone", phone);

        const result = await request.query(`
            -- Fetch user consent details by phone number
            SELECT 
                cu.phone, 
                bt.name AS template_name, 
                STRING_AGG(cc.name, ', ') AS selected_categories, 
                c.given AS consent_given, 
                c.timestamp
            FROM consent_users cu
            INNER JOIN consents c ON cu.id = c.consent_user_id
            LEFT JOIN consent_selected_categories csc ON c.id = csc.consent_id
            LEFT JOIN consent_categories cc ON csc.category_id = cc.id
            INNER JOIN banner_templates bt ON cc.template_id = bt.id
            WHERE cu.phone = @phone
            GROUP BY cu.phone, bt.name, c.given, c.timestamp;
        `);

        return result.recordset;

    } catch (err) {
        console.error("Error fetching user consent details:", err);
        throw err;
    }
},


// Get user consent details by user ID
async getUserConsentDetailsById(id) {
    const pool = await connectDB();
    try {
        const request = pool.request();
        request.input("id", id);

        const result = await request.query(`
            -- Fetch user consent details by user ID
            SELECT 
                cu.id, 
                bt.name AS template_name, 
                STRING_AGG(cc.name, ', ') AS selected_categories, 
                c.given AS consent_given, 
                c.timestamp
            FROM consent_users cu
            INNER JOIN consents c ON cu.id = c.consent_user_id
            LEFT JOIN consent_selected_categories csc ON c.id = csc.consent_id
            LEFT JOIN consent_categories cc ON csc.category_id = cc.id
            INNER JOIN banner_templates bt ON cc.template_id = bt.id
            WHERE cu.id = @id
            GROUP BY cu.id, bt.name, c.given, c.timestamp;
        `);

        return result.recordset;

    } catch (err) {
        console.error("Error fetching user consent details:", err);
        throw err;
    }
},


// Get user consent details by username
async getUserConsentDetailsByUsername(username) {
    const pool = await connectDB();
    try {
        const request = pool.request();
        request.input("username", username);

        const result = await request.query(`
            -- Fetch user consent details by username
            SELECT 
                cu.username, 
                bt.name AS template_name, 
                STRING_AGG(cc.name, ', ') AS selected_categories, 
                c.given AS consent_given, 
                c.timestamp
            FROM consent_users cu
            INNER JOIN consents c ON cu.id = c.consent_user_id
            LEFT JOIN consent_selected_categories csc ON c.id = csc.consent_id
            LEFT JOIN consent_categories cc ON csc.category_id = cc.id
            INNER JOIN banner_templates bt ON cc.template_id = bt.id
            WHERE cu.username = @username
            GROUP BY cu.username, bt.name, c.given, c.timestamp;
        `);

        return result.recordset;

    } catch (err) {
        console.error("Error fetching user consent details:", err);
        throw err;
    }
},







    
    // ✅ Get users who gave consent
    async getUsersWithConsent() {
        const pool = await connectDB();
        if (!pool) throw new Error("Database connection failed");

        const result = await pool.request().query(`
            SELECT DISTINCT cu.*
            FROM consent_users cu
            INNER JOIN consents c ON cu.id = c.consent_user_id
            WHERE c.given = 1
        `);

        return result.recordset;
    },

    // ✅ Get users who did not give consent
    async getUsersWithoutConsent() {
        const pool = await connectDB();
        if (!pool) throw new Error("Database connection failed");

        const result = await pool.request().query(`
            SELECT cu.*
            FROM consent_users cu
            WHERE cu.id NOT IN (
                SELECT consent_user_id FROM consents WHERE given = 1
            )
        `);

        return result.recordset;
    }
};

export default consentUserapiModel;
