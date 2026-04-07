import api from "./api";

const modifyTemplateService = {
  async modifyBannerTemplate(templateId, categories, changeNote = "Modified template version", createdBy = "admin") {
    try {
      const response = await api.put("/modify-template/update", {
        templateId,
        categories,
        changeNote,
        createdBy,
      });
      return response.data;
    } catch (error) {
      console.error("Error modifying banner template:", error);
      throw error.response?.data || { error: "An unexpected error occurred" };
    }
  },
};

export default modifyTemplateService;
