import React, { useEffect, useState } from "react";
import "../../styles/CategoryTab.css";

const CategoryTab = ({ bannerData, setBannerData, setActiveTab }) => {

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setBannerData(prevData => ({
            ...prevData,
            categoryForm: {
                ...prevData.categoryForm,
                [name]: type === "checkbox" ? checked : value
            }
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        setBannerData(prevData => ({
            ...prevData,
            categories: [
                ...(prevData.categories || []),
                {
                    id: Date.now(),
                    templateId: 1,
                    name: prevData.categoryForm.name,
                    description: prevData.categoryForm.description,
                    isRequired: prevData.categoryForm.isRequired
                }
            ],
            categoryForm: { templateId: 1, name: "", description: "", isRequired: false }
        }));
        setTimeout(() => setIsSubmitting(false), 2000);

    };

    useEffect(() => {
        console.log(bannerData);
    }, [bannerData]);

    return (
        <div className="category-tab-container">
            <h3 className="category-tab-title">Create Consent Category</h3>
            <p className="category-tab-description">
            Define consent categories to specify the types of data collection and their purposes. Users will be able to grant or deny consent based on these categories.
            </p>


            <form onSubmit={handleSubmit} className="category-tab-form">
                <label className="category-tab-label">
                    Category Name:
                    <input type="text" name="name" className="category-tab-input" placeholder="Enter category name (e.g., Marketing Preferences)" value={bannerData.categoryForm?.name || ""} onChange={handleChange} required />
                </label>

                <label className="category-tab-label">
                Reason for Consent:
                    <textarea name="description" className="category-tab-textarea" placeholder="Explain why this category requires consent (e.g., legal compliance, personalized marketing, etc.)" value={bannerData.categoryForm?.description || ""} onChange={handleChange} required />
                </label>

                <label className="category-tab-checkbox-label">
                    <input type="checkbox" name="isRequired" className="category-tab-checkbox" checked={bannerData.categoryForm?.isRequired || false} onChange={handleChange} />
                    This category is mandatory for consent
                </label>

                <div className="category-tab-buttons">
                    <button type="submit" className="category-tab-submit" disabled={isSubmitting}>
                        {isSubmitting ? "Creating..." : "Add Category"}
                    </button>

                    {!isSubmitting && (
                        <button type="button" className="category-tab-next-step-button" onClick={() => setActiveTab("subcategories")}>
                            Next Step →
                        </button>
                    )}
                </div>

            </form>
        </div>
    );
};

export default CategoryTab;
