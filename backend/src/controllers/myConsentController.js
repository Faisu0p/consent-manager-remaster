import myConsentModel from "../models/myConsentModel.js";

const myConsentController = {
    // Get all user consent-related data
    async getAllConsentDetails(req, res) {
        try {
            const userId = req.params.userId;

            // Fetching all the data in parallel to improve performance
            const [email, username, phoneNumber, consentGiven, templateName, categories, subcategories, selectedCategories] = await Promise.all([
                myConsentModel.getUserEmail(userId),
                myConsentModel.getUsername(userId),
                myConsentModel.getPhoneNumber(userId),
                myConsentModel.checkConsentGiven(userId),
                myConsentModel.getTemplateName(userId),
                myConsentModel.getAllCategoriesForTemplate(userId),
                myConsentModel.getSubcategoriesByCategory(userId),
                myConsentModel.getSelectedCategories(userId)
            ]);

            // Returning all data in one response object
            res.status(200).json({
                success: true,
                data: {
                    email,
                    username,
                    phoneNumber,
                    consentGiven,
                    templateName,
                    categories,
                    subcategories,
                    selectedCategories
                }
            });

        } catch (error) {
            console.error("Error fetching consent details:", error);
            res.status(500).json({ success: false, message: "Server error" });
        }
    },

    // Update User Consent
    async updateUserConsent(req, res) {
        try {
            const { userId, consentGiven, selectedCategories } = req.body;

            if (!userId || !consentGiven) {
                return res.status(400).json({ success: false, message: "Missing required fields" });
            }

            // Call model function to update consent data
            const result = await myConsentModel.updateUserConsent(userId, consentGiven, selectedCategories || []);

            res.status(200).json({ success: true, message: result.message });
        } catch (error) {
            console.error("Error updating user consent:", error);
            res.status(500).json({ success: false, message: "Server error" });
        }
    },

    // Get Consent History Grouped by Sessions
    async getConsentHistoryGrouped(req, res) {
        try {
            const userId = req.params.userId;
    
            if (!userId) {
                return res.status(400).json({ success: false, message: "User ID is required" });
            }
    
            const groupedHistory = await myConsentModel.getConsentHistoryGroupedBySession(userId);
    
            res.status(200).json({
                success: true,
                data: groupedHistory
            });
        } catch (error) {
            console.error("Error fetching grouped consent history:", error);
            res.status(500).json({ success: false, message: "Server error" });
        }
    }
    




};

export default myConsentController;
