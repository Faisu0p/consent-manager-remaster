import React, { useEffect, useState } from "react";
import "../../styles/SubcategoryTab.css";

const SubcategoryTab = ({ bannerData, setBannerData, setActiveTab }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        console.log("Updated bannerData:", bannerData);
    }, [bannerData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBannerData(prevData => ({
            ...prevData,
            subcategoryForm: { ...prevData.subcategoryForm, [name]: value }
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        setBannerData(prevData => ({
            ...prevData,
            subcategories: [
                ...prevData.subcategories,
                {
                    id: Date.now(),
                    subcategoryCategoryId: prevData.subcategoryForm.subcategoryCategoryId,
                    subcategoryName: prevData.subcategoryForm.subcategoryName,
                    subcategoryDescription: prevData.subcategoryForm.subcategoryDescription
                }
            ],
            subcategoryForm: { subcategoryCategoryId: "", subcategoryName: "", subcategoryDescription: "" }
        }));

        setTimeout(() => setIsSubmitting(false), 2000);
    };

    return (
        <div className="sub-category-container">
            <h3 className="sub-category-title">Create Consent Subcategory</h3>
            <p className="sub-category-description">Define subcategories under each category to further specify data collection purposes.(This is optional)</p>

            <form onSubmit={handleSubmit} className="sub-category-form">
                <label className="sub-category-label">Select a Category: 
                    <select name="subcategoryCategoryId" value={bannerData.subcategoryForm?.subcategoryCategoryId || ""} onChange={handleChange} className="sub-category-dropdown" required>
                        <option value="">Choose a Category</option>
                        {bannerData.categories.map(category => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                    </select>
                </label>

                <label className="sub-category-label">Subcategory Name: 
                    <input type="text" name="subcategoryName" placeholder="Enter subcategory name (e.g., Email Marketing)" value={bannerData.subcategoryForm?.subcategoryName || ""} onChange={handleChange} className="sub-category-input" required />
                </label>

                <label className="sub-category-label">Description: 
                    <textarea name="subcategoryDescription" placeholder="Explain why this subcategory requires consent" value={bannerData.subcategoryForm?.subcategoryDescription || ""} onChange={handleChange} className="sub-category-textarea" required />
                </label>

                <div className="sub-category-buttons">
                    <button type="submit" className="sub-category-submit" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Add Subcategory"}</button>
                    {!isSubmitting && <button type="button" className="sub-category-next-step-button" onClick={() => setActiveTab("partners")}>Next Step →</button>}
                </div>
            </form>
            
        </div>
    );
};

export default SubcategoryTab;
