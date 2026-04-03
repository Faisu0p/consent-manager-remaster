import modifyTemplateModel from "../models/modifyTemplateModel.js";
import { validationResult } from "express-validator";

const modifyTemplateController = {
    // Modify an existing banner template and add new categories/subcategories if needed
    async modifyBannerTemplate(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { templateId, categories } = req.body;

        try {
            // Step 1: Fetch existing categories for the template
            const existingCategories = await modifyTemplateModel.getExistingCategories(templateId);
            const existingCategoryNames = new Set(existingCategories.map(cat => cat.name));

            // Step 2: Insert new categories if they don’t exist
            const categoryIdMap = {}; // Store category names & IDs
            for (const category of categories) {
                if (!existingCategoryNames.has(category.name)) {
                    const newCategoryId = await modifyTemplateModel.addCategory(
                        templateId,
                        category.name,
                        category.description,
                        category.isMandatory
                    );
                    categoryIdMap[category.name] = newCategoryId;
                } else {
                    const existingCategory = existingCategories.find(cat => cat.name === category.name);
                    categoryIdMap[category.name] = existingCategory.id;
                }
            }

            // Step 3: Insert new subcategories for each category
            for (const category of categories) {
                const correctCategoryId = categoryIdMap[category.name]; // Get the mapped category ID
                const existingSubcategories = await modifyTemplateModel.getExistingSubcategories(correctCategoryId);
                const existingSubcategoryNames = new Set(existingSubcategories.map(sub => sub.name));

                for (const subcategory of category.subcategories) {
                    if (!existingSubcategoryNames.has(subcategory.name)) {
                        await modifyTemplateModel.addSubcategory(
                            correctCategoryId,
                            subcategory.name,
                            subcategory.description
                        );
                    }
                }
            }

            // Step 4: Respond with success message
            res.status(200).json({ message: "Template modified successfully. New categories/subcategories added where needed." });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Server error" });
        }
    }
};

export default modifyTemplateController;
