import emailSuppressionModel from "../models/emailSuppressionModel.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const emailSuppressionController = {
  async createSuppressedEmail(req, res) {
    try {
      const { email, source = "manual", notes = null } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required." });
      }

      if (!EMAIL_REGEX.test(email.trim().toLowerCase())) {
        return res.status(400).json({ message: "Please enter a valid email address." });
      }

      const result = await emailSuppressionModel.addSuppressedEmail({ email, source, notes });

      if (result.alreadyExists) {
        return res.status(409).json({
          message: "Email is already in suppression list.",
          data: result.record,
        });
      }

      return res.status(201).json({
        message: "Email added to suppression list.",
        data: result.record,
      });
    } catch (error) {
      console.error("Error creating suppressed email:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  },

  async getAllSuppressedEmails(req, res) {
    try {
      const records = await emailSuppressionModel.getAllSuppressedEmails();
      return res.status(200).json({ data: records });
    } catch (error) {
      console.error("Error fetching suppressed emails:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  },

  async deleteSuppressedEmail(req, res) {
    try {
      const { id } = req.params;
      const deleted = await emailSuppressionModel.removeSuppressedEmailById(Number(id));

      if (!deleted) {
        return res.status(404).json({ message: "Suppressed email not found." });
      }

      return res.status(200).json({ message: "Suppressed email removed successfully." });
    } catch (error) {
      console.error("Error deleting suppressed email:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  },
};

export default emailSuppressionController;