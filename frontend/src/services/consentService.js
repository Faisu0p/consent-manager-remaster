import api from "./api";

const consentService = {
  async getConsents() {
    try {
      const response = await api.get("/consents/all");
      return response.data.consents; // <-- Extract consents array
    } catch (error) {
      console.error("Error fetching consents:", error.response?.data || error.message);
      throw error;
    }
  },
  
  async getUserConsents(userId) {
    try {
      if (!userId) throw new Error("User ID is required");

      const response = await api.get(`/consents/user/${userId}`);
      return response.data.consents; // Extract consents array
    } catch (error) {
      console.error("Error fetching user consents:", error.response?.data || error.message);
      throw error;
    }
  },

  async getAllConsentDetails(userId) {
    try {
      if (!userId) throw new Error("User ID is required");

      const response = await api.get(`/consent-details/all/${userId}`);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching all consent details:", error.response?.data || error.message);
      throw error;
    }
  },

  async updateUserConsent(consentData) {
    try {
      if (!consentData.userId) throw new Error("User ID is required");

      const response = await api.post("/consent-details/update", consentData);
      return response.data;
    } catch (error) {
      console.error("Error updating user consent:", error.response?.data || error.message);
      throw error;
    }
  },

  async getConsentHistoryGrouped(userId) {
    try {
      if (!userId) throw new Error("User ID is required");

      const response = await api.get(`/consent-details/consent-history/${userId}`);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching grouped consent history:", error.response?.data || error.message);
      throw error;
    }
  }


};

export default consentService;
