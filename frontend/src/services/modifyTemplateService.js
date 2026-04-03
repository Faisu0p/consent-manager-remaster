import api from "./api";

const modifyTemplateService = {
  async modifyBannerTemplate(templateId, categories) {
    try {
      const response = await api.put("/modify-template/update", { templateId, categories });
      return response.data;
    } catch (error) {
      console.error("Error modifying banner template:", error);
      throw error.response?.data || { error: "An unexpected error occurred" };
    }
  },
};

export default modifyTemplateService;
