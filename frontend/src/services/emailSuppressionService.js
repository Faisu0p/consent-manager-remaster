import api from "./api";

const emailSuppressionService = {
  async getAllSuppressedEmails() {
    try {
      const response = await api.get("/email-suppressions");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching suppressed emails:", error.response?.data || error.message);
      throw error;
    }
  },

  async addSuppressedEmail(payload) {
    try {
      const response = await api.post("/email-suppressions", payload);
      return response.data;
    } catch (error) {
      console.error("Error adding suppressed email:", error.response?.data || error.message);
      throw error;
    }
  },

  async deleteSuppressedEmail(id) {
    try {
      const response = await api.delete(`/email-suppressions/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting suppressed email:", error.response?.data || error.message);
      throw error;
    }
  },
};

export default emailSuppressionService;