import sql from "mssql";
import connectDB from "../config/db.js";

const accessLogModel = {
    // Fetch access logs with user details
    async getAccessLogs() {
        const pool = await connectDB();
        if (!pool) throw new Error("Database connection failed");

        try {
            const result = await pool.request().query(`
                SELECT 
                    al.id, 
                    al.user_id, 
                    u.username AS user_name, 
                    u.email AS user_email, 
                    al.action, 
                    al.timestamp 
                FROM access_logs al
                JOIN users u ON al.user_id = u.id
                ORDER BY al.timestamp DESC
            `);
            return result.recordset;
        } catch (error) {
            console.error("Error fetching access logs:", error);
            throw new Error("Database error");
        }
    }
};

export default accessLogModel;
