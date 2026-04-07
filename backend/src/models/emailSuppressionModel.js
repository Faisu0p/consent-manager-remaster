import sql from "mssql";
import connectDB from "../config/db.js";

const emailSuppressionModel = {
  async ensureTable() {
    const pool = await connectDB();
    if (!pool) throw new Error("Database connection failed");

    await pool.request().query(`
      IF OBJECT_ID('email_suppressions', 'U') IS NULL
      BEGIN
        CREATE TABLE email_suppressions (
          id INT IDENTITY(1,1) PRIMARY KEY,
          email NVARCHAR(255) NOT NULL UNIQUE,
          source NVARCHAR(100) NOT NULL DEFAULT 'manual',
          notes NVARCHAR(500) NULL,
          created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
          updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
        );
      END;
    `);
  },

  async upsertSuppressedEmail({ email, source = "manual", notes = null }) {
    await this.ensureTable();

    const pool = await connectDB();
    if (!pool) throw new Error("Database connection failed");

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await pool
      .request()
      .input("email", sql.NVarChar(255), normalizedEmail)
      .query(`
        SELECT id, email, source, notes, created_at, updated_at
        FROM email_suppressions
        WHERE email = @email;
      `);

    if (existing.recordset.length > 0) {
      return { alreadyExists: true, record: existing.recordset[0] };
    }

    await pool
      .request()
      .input("email", sql.NVarChar(255), normalizedEmail)
      .input("source", sql.NVarChar(100), source)
      .input("notes", sql.NVarChar(500), notes)
      .query(`
        INSERT INTO email_suppressions (email, source, notes)
        VALUES (@email, @source, @notes);
      `);

    const inserted = await pool
      .request()
      .input("email", sql.NVarChar(255), normalizedEmail)
      .query(`
        SELECT id, email, source, notes, created_at, updated_at
        FROM email_suppressions
        WHERE email = @email;
      `);

    return { alreadyExists: false, record: inserted.recordset[0] };
  },

  async addSuppressedEmail({ email, source = "manual", notes = null }) {
    return this.upsertSuppressedEmail({ email, source, notes });
  },

  async getAllSuppressedEmails() {
    await this.ensureTable();

    const pool = await connectDB();
    if (!pool) throw new Error("Database connection failed");

    const result = await pool.request().query(`
      SELECT id, email, source, notes, created_at, updated_at
      FROM email_suppressions
      ORDER BY created_at DESC;
    `);

    return result.recordset;
  },

  async removeSuppressedEmailById(id) {
    await this.ensureTable();

    const pool = await connectDB();
    if (!pool) throw new Error("Database connection failed");

    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query(`
        DELETE FROM email_suppressions
        OUTPUT DELETED.id
        WHERE id = @id;
      `);

    return result.recordset.length > 0;
  },
};

export default emailSuppressionModel;