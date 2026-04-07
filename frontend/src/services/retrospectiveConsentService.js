import api from "./api";

const retrospectiveConsentService = {
  async createCampaign(payload) {
    const response = await api.post("/retrospective-consent/campaigns", payload);
    return response.data;
  },

  async getInviteDetails(token) {
    const response = await api.get(`/retrospective-consent/invite/${encodeURIComponent(token)}`);
    return response.data;
  },

  async submitConsent(token, payload) {
    const response = await api.post(
      `/retrospective-consent/invite/${encodeURIComponent(token)}/submit`,
      payload
    );
    return response.data;
  },

  async getCampaignStats(campaignId) {
    const response = await api.get(`/retrospective-consent/campaigns/${campaignId}/stats`);
    return response.data;
  },
};

export default retrospectiveConsentService;
