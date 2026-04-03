import sql from "mssql";
import { config } from "./env.js";

const dbConfig = {
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  server: config.DB_SERVER,
  database: config.DB_DATABASE,
  port: parseInt(config.DB_PORT, 10) || 1433,
  options: {
    encrypt: config.DB_ENCRYPT,
    trustServerCertificate: true,
  },
};

// Function to create a database connection pool
const connectDB = async () => {
  try {
    const pool = await new sql.ConnectionPool(dbConfig).connect();
    console.log("✅ Connected to SQL Server");
    return pool;
  } catch (err) {
    console.error("❌ Database Connection Failed:", err);
    return null;
  }
};

export default connectDB;
