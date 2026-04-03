import React, { useState, useEffect } from "react";
import "../../styles/PartnerTab.css";

const PartnerTab = ({ bannerData, setBannerData }) => {
    const [partnerForm, setPartnerForm] = useState({ partnerName: "", isBlocked: false });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setPartnerForm({ ...partnerForm, [name]: type === "checkbox" ? checked : value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const newPartner = { id: Date.now(), partnerTemplateId: 1, ...partnerForm };

        setTimeout(() => {
            setBannerData((prevData) => ({ ...prevData, partners: [...prevData.partners, newPartner] }));
            setPartnerForm({ partnerName: "", isBlocked: false });

            setIsSubmitting(false);
        }
        , 1000);
    };

    useEffect(() => console.log("Updated Banner Data:", bannerData), [bannerData]);

    return (
        <div className="partner-tab-container">

            <h3 className="partner-tab-title">Create Partner</h3>
            <p className="partner-tab-description">
                Add multiple partners to manage consent-based interactions. Select "Required Partner" if sharing consent with this partner is mandatory.
            </p>

            <form onSubmit={handleSubmit} className="partner-tab-form">
                <label className="partner-tab-label">Partner Name:
                    <input type="text" name="partnerName" className="partner-tab-input" placeholder="Enter partner name (e.g., Google Analytics)" value={partnerForm.partnerName} onChange={handleChange} required />
                </label>

                <label className="partner-tab-checkbox-label">
                    <input type="checkbox" name="isBlocked" className="partner-tab-checkbox" checked={partnerForm.isBlocked} onChange={handleChange} />
                    Required Partner
                </label>

                <button type="submit" className="partner-tab-submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Add Partner"}
                </button>
            </form>

        </div>
    );
};

export default PartnerTab;
