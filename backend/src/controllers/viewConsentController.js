import viewConsentModel from "../models/viewConsentModel.js";

const viewConsentController = {
    // Get all user consents
    async getAllConsents(req, res) {
        try {
            const consents = await viewConsentModel.getAllConsents();
            res.status(200).json({ success: true, consents });
        } catch (error) {
            console.error("Error fetching consents:", error);
            res.status(500).json({ success: false, message: "Server error" });
        }
    },

    // Get consents for a specific user
    async getUserConsents(req, res) {
        try {
            const { userId } = req.params;
            if (!userId || isNaN(userId)) {
                return res.status(400).json({ success: false, message: "Valid User ID is required" });
            }
    
            const consents = await viewConsentModel.getUserConsents(userId);
    
            if (!consents || consents.length === 0) {
                return res.status(404).json({ success: false, message: "No consents found for this user" });
            }
    
            // Fetch categories and partners in parallel for better performance
            await Promise.all(consents.map(async (consent) => {
                const categories = await viewConsentModel.getCategoriesByConsentId(consent.consent_id);
    
                // Fetch subcategories for each category concurrently
                await Promise.all(categories.map(async (category) => {
                    category.subcategories = await viewConsentModel.getSubcategoriesByCategoryId(category.category_id);
                }));
    
                // Attach the structured categories and partners data
                consent.categories = categories;
                consent.partners = await viewConsentModel.getPartnersByTemplateId(consent.template_id);
    
                // Remove unnecessary fields
                delete consent.category_names;
                delete consent.category_subcategory_mapping;
                delete consent.partner_names;
            }));
    
            res.status(200).json({ success: true, consents });
        } catch (error) {
            console.error("Error fetching user consents:", error);
            res.status(500).json({ success: false, message: "Server error", error: error.message });
        }
    }
    

};

export default viewConsentController;
