import sql from "mssql";
import connectDB from "../config/db.js";

const userModel = {

    // Create a new user
    async createUser(username, email, hashedPassword) {
        const pool = await connectDB();
        if (!pool) throw new Error("Database connection failed");

        const result = await pool
            .request()
            .input("username", sql.VarChar, username)
            .input("email", sql.VarChar, email)
            .input("password_hash", sql.VarChar, hashedPassword)
            .query(
                "INSERT INTO users (username, email, password_hash) OUTPUT INSERTED.id VALUES (@username, @email, @password_hash)"
            );

        return result.recordset[0].id;
    },


    // Delete a user
    async deleteUser(userId) {
        const pool = await connectDB();
        if (!pool) throw new Error("Database connection failed");
    
        // Delete user roles first (to maintain foreign key integrity)
        await pool
            .request()
            .input("user_id", sql.Int, userId)
            .query("DELETE FROM user_roles WHERE user_id = @user_id");
    
        // Delete user
        await pool
            .request()
            .input("user_id", sql.Int, userId)
            .query("DELETE FROM users WHERE id = @user_id");
    },

    
    // Assign a role to a user
    async assignRole(userId, roleId) {
        const pool = await connectDB();
        if (!pool) throw new Error("Database connection failed");

        await pool
            .request()
            .input("user_id", sql.Int, userId)
            .input("role_id", sql.Int, roleId)
            .query("INSERT INTO user_roles (user_id, role_id) VALUES (@user_id, @role_id)");
    },


    // Find a user by email
    async findUserByEmail(email) {
        const pool = await connectDB();
        if (!pool) throw new Error("Database connection failed");

        const result = await pool
            .request()
            .input("email", sql.VarChar, email)
            .query(`
                SELECT u.id, u.email, u.password_hash, r.role_name 
                FROM users u 
                JOIN user_roles ur ON u.id = ur.user_id 
                JOIN roles r ON ur.role_id = r.id 
                WHERE u.email = @email
            `);

        return result.recordset[0];
    },


    // Find a user by ID
    async findUserById(userId) {
        const pool = await connectDB();
        if (!pool) throw new Error("Database connection failed");
    
        const result = await pool
            .request()
            .input("user_id", sql.Int, userId)
            .query("SELECT id FROM users WHERE id = @user_id");
    
        return result.recordset[0] || null;
    },


    // Fetch details of all users (id, username, email, created_at, role_name)
    async getAllUsers() {
        const pool = await connectDB();
        if (!pool) throw new Error("Database connection failed");

        const result = await pool.query(`
            SELECT u.id, u.username, u.email, u.created_at, r.role_name 
            FROM users u
            JOIN user_roles ur ON u.id = ur.user_id
            JOIN roles r ON ur.role_id = r.id
        `);

        // Add "status" field to each user (temporarily hardcoded to "Active")
        return result.recordset.map(user => ({
            ...user,
            status: "Active" 
        }));
    },


    // Log access event (login/logout)
    async logAccessEvent(userId, action) {
        const pool = await connectDB();
        if (!pool) throw new Error("Database connection failed");

        await pool
            .request()
            .input("user_id", sql.Int, userId)
            .input("action", sql.VarChar, action) // "login" or "logout"
            .query("INSERT INTO access_logs (user_id, action, timestamp) VALUES (@user_id, @action, GETDATE())");
    }

    
};

export default userModel;
