import bannerTemplateModel from "../models/bannerTemplateModel.js";
import { validationResult } from "express-validator";

const bannerTemplateController = {

    // Create a new banner template (This is the full version that includes all related data)
    async createFullBannerTemplate(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { template, portal, categories, subcategories, partners } = req.body;

        try {
            // Step 1: Create the banner template and get its database ID
            const templateId = await bannerTemplateModel.createBannerTemplate(
                template.name,
                template.mainText,
                template.infoParagraph,
                template.headerText,
                template.buttonAcceptText,
                template.buttonRejectText,
                template.buttonConfigureText,
                template.language_code
            );

            if (template.parent_template_id && template.parent_template_id !== "null") {
                await bannerTemplateModel.linkBannerTemplateLanguage(
                    templateId,
                    parseInt(template.parent_template_id, 10), // Convert to integer
                    template.language_code
                );
            }
            

            // Step 2: Create the consent portal (if exists)
            if (portal) {
                await bannerTemplateModel.createConsentPortal(
                    templateId,
                    portal.upper_text,
                    portal.lower_text
                );
            }

            // Step 3: Store mapping of old category IDs (from frontend) to new DB-generated IDs
            const categoryIdMap = {};

            // Step 4: Insert categories and store their new IDs
            for (const category of categories) {
                const categoryId = await bannerTemplateModel.createConsentCategory(
                    templateId,
                    category.name,
                    category.description,
                    category.isRequired
                );

                // Map old category ID (frontend-generated) to new categoryId
                categoryIdMap[category.id] = categoryId;
            }

            // Step 5: Insert subcategories and link them to the correct categoryId
            for (const subcategory of subcategories) {
                const correctCategoryId = categoryIdMap[subcategory.subcategoryCategoryId]; // Get mapped category ID

                if (!correctCategoryId) {
                    console.warn(`Warning: Subcategory '${subcategory.name}' has an invalid category reference`);
                    continue; // Skip this subcategory if category is missing
                }

                await bannerTemplateModel.createConsentSubcategory(
                    correctCategoryId,
                    subcategory.subcategoryName,
                    subcategory.subcategoryDescription
                );
            }

            // Step 6: Insert partners
            for (const partner of partners) {
                await bannerTemplateModel.createPartner(
                    templateId,
                    partner.partnerName,
                    partner.isBlocked
                );
            }

            // Step 7: Respond with success
            res.status(201).json({ message: "Banner template and related data created successfully", templateId });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Server error" });
        }
    },



    async getAllFullBannerTemplates(req, res) {
        try {
            // Step 1: Fetch all banner templates
            const bannerTemplates = await bannerTemplateModel.getAllBannerTemplates();

            // Step 2: Fetch all related data
            const consentPortals = await bannerTemplateModel.getAllConsentPortals();
            const consentCategories = await bannerTemplateModel.getAllConsentCategories();
            const consentSubcategories = await bannerTemplateModel.getAllConsentSubcategories();
            const partners = await bannerTemplateModel.getAllPartners();

            // Step 3: Create a map to organize related data by template_id
            const templatesMap = {};

            // Initialize templates in the map
            for (const template of bannerTemplates) {
                templatesMap[template.id] = {
                    ...template,
                    portal: null,
                    categories: [],
                    partners: [],
                };
            }

            // Step 4: Assign consent portal to its template
            for (const portal of consentPortals) {
                if (templatesMap[portal.template_id]) {
                    templatesMap[portal.template_id].portal = portal;
                }
            }

            // Step 5: Assign categories and create category map for subcategories
            const categoryMap = {};
            for (const category of consentCategories) {
                if (templatesMap[category.template_id]) {
                    templatesMap[category.template_id].categories.push({
                        ...category,
                        subcategories: [],
                    });
                    categoryMap[category.id] = templatesMap[category.template_id].categories[
                        templatesMap[category.template_id].categories.length - 1
                    ]; // Store reference to category object
                }
            }

            // Step 6: Assign subcategories to their respective categories
            for (const subcategory of consentSubcategories) {
                if (categoryMap[subcategory.category_id]) {
                    categoryMap[subcategory.category_id].subcategories.push(subcategory);
                }
            }

            // Step 7: Assign partners to their respective templates
            for (const partner of partners) {
                if (templatesMap[partner.template_id]) {
                    templatesMap[partner.template_id].partners.push(partner);
                }
            }

            // Step 8: Convert the map to an array and send response
            res.status(200).json({ templates: Object.values(templatesMap) });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Server error while fetching banner templates" });
        }
    },
    



    // Create a new banner template
    async createBannerTemplate(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, mainText, infoParagraph, headerText, buttonAcceptText, buttonRejectText, buttonConfigureText, language_code } = req.body;

        try {
            // Create the banner template
            const templateId = await bannerTemplateModel.createBannerTemplate(
                name, 
                mainText, 
                infoParagraph, 
                headerText, 
                buttonAcceptText, 
                buttonRejectText, 
                buttonConfigureText,
                language_code
            );

            res.status(201).json({ message: "Banner template created successfully", templateId });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Server error" });
        }
    },


    // Create a new consent portal
    async createConsentPortal(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
    
        const { templateId, upperText, lowerText } = req.body;
    
        try {
            // Create the consent portal entry
            const portalId = await bannerTemplateModel.createConsentPortal(templateId, upperText, lowerText);
    
            res.status(201).json({ message: "Consent portal entry created successfully", portalId });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Server error" });
        }
    },
    

    // Create a new consent category
    async createConsentCategory(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { templateId, name, description, isRequired } = req.body;

        try {
            // Create the consent category
            const categoryId = await bannerTemplateModel.createConsentCategory(templateId, name, description, isRequired);

            res.status(201).json({ message: "Consent category created successfully", categoryId });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Server error" });
        }
    },

    // Create a new consent subcategory
    async createConsentSubcategory(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { categoryId, name, description } = req.body;

        try {
            // Create the consent subcategory
            const subcategoryId = await bannerTemplateModel.createConsentSubcategory(categoryId, name, description);

            res.status(201).json({ message: "Consent subcategory created successfully", subcategoryId });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Server error" });
        }
    },

    // Create a new partner
    async createPartner(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { templateId, name, isBlocked } = req.body;

        try {
            // Create the partner
            const partnerId = await bannerTemplateModel.createPartner(templateId, name, isBlocked);

            res.status(201).json({ message: "Partner created successfully", partnerId });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Server error" });
        }
    },

    // Get all banner templates
    async getAllBannerTemplates(req, res) {
        try {
            const templates = await bannerTemplateModel.getAllBannerTemplates();
            res.json(templates);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Server error" });
        }
    },


    // Get a specific consent portal by template ID
    async getConsentPortalByTemplateId(req, res) {
        const { templateId } = req.params;
    
        try {
            const portalEntry = await bannerTemplateModel.getConsentPortalByTemplateId(parseInt(templateId, 10));
            
            if (portalEntry.length === 0) {
                return res.status(404).json({ message: "No consent portal entry found for this template" });
            }
    
            res.json(portalEntry);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Server error" });
        }
    },
    

    // Get all consent categories for a specific template
    async getConsentCategories(req, res) {
        const { templateId } = req.params;

        try {
            const categories = await bannerTemplateModel.getConsentCategories(parseInt(templateId, 10));
            res.json(categories);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Server error" });
        }
    },

    // Get all consent subcategories for a specific category
    async getConsentSubcategories(req, res) {
        const { categoryId } = req.params;

        try {
            const subcategories = await bannerTemplateModel.getConsentSubcategories(parseInt(categoryId, 10));
            res.json(subcategories);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Server error" });
        }
    },

    // Get all partners for a specific template
    async getPartners(req, res) {
        const { templateId } = req.params;

        try {
            const partners = await bannerTemplateModel.getPartners(parseInt(templateId, 10));
            res.json(partners);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Server error" });
        }
    },

    async getEnglishBannerTemplates(req, res) {
        try {
            const englishTemplates = await bannerTemplateModel.getEnglishBannerTemplates();
            res.json(englishTemplates);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Server error" });
        }
    },
    
};

export default bannerTemplateController;
