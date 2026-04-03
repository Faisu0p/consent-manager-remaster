import api from "./api";

const bannerService = {


  // Create a new banner template along with portal, categories, subcategories, and partners
  createFullBannerTemplate: async (bannerData) => {
    try {
      const response = await api.post("/banner-templates/create-full", bannerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  
  // Create a new banner template
  createBannerTemplate: async (data) => {
    try {
      const response = await api.post("/banner-templates/create", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },


  // Create a new Consent Portal entry
  createConsentPortal: async (data) => {
    try {
      const response = await api.post("/consent-portal/create", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create a new consent category
  createConsentCategory: async (data) => {
    try {
      const response = await api.post("/banner-templates/consent-category/create", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create a new consent subcategory
  createConsentSubcategory: async (data) => {
    try {
      const response = await api.post("/banner-templates/consent-subcategory/create", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create a new partner
  createPartner: async (data) => {
    try {
      const response = await api.post("/banner-templates/partner/create", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all banner templates
  getAllBannerTemplates: async () => {
    try {
      const response = await api.get("/banner-templates/all-templates");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get Consent Portal entry by templateId
  getConsentPortalByTemplateId: async (templateId) => {
    try {
      const response = await api.get(`/consent-portal/${templateId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all consent categories for a specific template
  getConsentCategories: async (templateId) => {
    try {
      const response = await api.get(`/banner-templates/consent-categories/${templateId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all consent subcategories for a specific category
  getConsentSubcategories: async (categoryId) => {
    try {
      const response = await api.get(`/banner-templates/consent-subcategories/${categoryId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all partners for a specific template
  getPartners: async (templateId) => {
    try {
      const response = await api.get(`/banner-templates/partners/${templateId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all full banner templates with related data
  getAllFullBannerTemplates: async () => {
    try {
      const response = await api.get("/banner-templates/full-templates");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getEnglishBannerTemplates: async () => {
    try {
      const response = await api.get("/banner-templates/english-templates");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

};

export default bannerService;
