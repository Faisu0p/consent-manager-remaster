import express from "express";
import { body } from "express-validator";
import modifyTemplateController from "../controllers/modifyTemplateController.js";

const router = express.Router();

// Modify an existing banner template (Only Admins can access)
router.put(
    "/update",
    [
        body("templateId").isInt().withMessage("Template ID is required"),
        body("categories").isArray().withMessage("Categories must be an array"),
        body("categories.*.name").notEmpty().withMessage("Category name is required"),
        body("categories.*.description").notEmpty().withMessage("Category description is required"),
        body("categories.*.isMandatory").isBoolean().withMessage("isMandatory must be a boolean value"),
        body("categories.*.subcategories").optional().isArray().withMessage("Subcategories must be an array"),
        body("categories.*.subcategories.*.name").optional().notEmpty().withMessage("Subcategory name is required"),
        body("categories.*.subcategories.*.description").optional().notEmpty().withMessage("Subcategory description is required"),
    ],
    // authMiddleware(["Admin"]), // Uncomment when enabling authentication
    modifyTemplateController.modifyBannerTemplate
);

export default router;
