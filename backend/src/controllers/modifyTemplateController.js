import bannerTemplateModel from "../models/bannerTemplateModel.js";
import { validationResult } from "express-validator";

const modifyTemplateController = {
    // Create a new template version from an existing template and append new categories/subcategories.
    async modifyBannerTemplate(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { templateId, categories, changeNote, createdBy } = req.body;

        try {
            const sourceTemplate = await bannerTemplateModel.getBannerTemplateById(templateId);
            if (!sourceTemplate) {
                return res.status(404).json({ error: "Template not found" });
            }

            const sourcePortalRows = await bannerTemplateModel.getConsentPortalByTemplateId(sourceTemplate.id);
            const sourcePortal = sourcePortalRows.length > 0 ? sourcePortalRows[0] : null;
            const sourcePartners = await bannerTemplateModel.getPartners(sourceTemplate.id);

            const sourceCategories = await bannerTemplateModel.getConsentCategories(sourceTemplate.id);
            const enrichedSourceCategories = await Promise.all(
                sourceCategories.map(async (category) => ({
                    ...category,
                    subcategories: await bannerTemplateModel.getConsentSubcategories(category.id),
                }))
            );

            const categoryByName = new Map();

            for (const category of enrichedSourceCategories) {
                categoryByName.set(category.name.toLowerCase(), {
                    name: category.name,
                    description: category.description || "",
                    is_required: Boolean(category.is_required),
                    subcategories: (category.subcategories || []).map((sub) => ({
                        name: sub.name,
                        description: sub.description || "",
                    })),
                });
            }

            for (const incomingCategory of categories) {
                const key = incomingCategory.name.toLowerCase();
                const existing = categoryByName.get(key);

                if (!existing) {
                    categoryByName.set(key, {
                        name: incomingCategory.name,
                        description: incomingCategory.description || "",
                        is_required: Boolean(incomingCategory.isMandatory),
                        subcategories: (incomingCategory.subcategories || []).map((sub) => ({
                            name: sub.name,
                            description: sub.description || "",
                        })),
                    });
                    continue;
                }

                const existingSubByName = new Set(existing.subcategories.map((sub) => sub.name.toLowerCase()));
                for (const subcategory of incomingCategory.subcategories || []) {
                    const subName = subcategory.name.toLowerCase();
                    if (!existingSubByName.has(subName)) {
                        existing.subcategories.push({
                            name: subcategory.name,
                            description: subcategory.description || "",
                        });
                    }
                }
            }

            const mergedCategories = Array.from(categoryByName.values());

            const newTemplateVersionId = await bannerTemplateModel.createBannerTemplate(
                sourceTemplate.name,
                sourceTemplate.main_text,
                sourceTemplate.info_paragraph,
                sourceTemplate.header_text,
                sourceTemplate.button_accept_text,
                sourceTemplate.button_reject_text,
                sourceTemplate.button_configure_text,
                sourceTemplate.language_code,
                {
                    templateFamilyId: sourceTemplate.template_family_id || null,
                    previousVersionId: sourceTemplate.id,
                    status: "published",
                    changeNote: changeNote || "Modified template version",
                    createdBy: createdBy || null,
                }
            );

            if (sourcePortal) {
                await bannerTemplateModel.createConsentPortal(
                    newTemplateVersionId,
                    sourcePortal.upper_text,
                    sourcePortal.lower_text
                );
            }

            for (const partner of sourcePartners) {
                await bannerTemplateModel.createPartner(
                    newTemplateVersionId,
                    partner.name,
                    partner.is_blocked
                );
            }

            for (const category of mergedCategories) {
                const newCategoryId = await bannerTemplateModel.createConsentCategory(
                    newTemplateVersionId,
                    category.name,
                    category.description,
                    Boolean(category.is_required)
                );

                for (const subcategory of category.subcategories) {
                    await bannerTemplateModel.createConsentSubcategory(
                        newCategoryId,
                        subcategory.name,
                        subcategory.description
                    );
                }
            }

            const newVersion = await bannerTemplateModel.getBannerTemplateById(newTemplateVersionId);

            res.status(200).json({
                message: "Template modified successfully. A new version has been created.",
                templateId: newTemplateVersionId,
                templateFamilyId: newVersion?.template_family_id || null,
                versionNumber: newVersion?.version_number || null,
                status: newVersion?.status || "published",
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Server error" });
        }
    }
};

export default modifyTemplateController;
