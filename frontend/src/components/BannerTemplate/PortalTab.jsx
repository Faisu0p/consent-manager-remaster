import React, {useState} from "react";
import "../../styles/PortalTab.css"; // Reusing existing styles

const PortalTab = ({ bannerData, setBannerData, setActiveTab }) => {

    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const handleChange = (e) => {
        setBannerData({
            ...bannerData,
            portal: {
                ...bannerData.portal,
                template_id: 1,
                [e.target.name]: e.target.value
            },
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        console.log(bannerData);
        alert("Portal Created Successfully!");

        setTimeout(() => setIsSubmitting(false), 2000);
    };

    return (
        <div className="portal-tab-container">
            <h3 className="portal-tab-title">Create Portal</h3>

            <p className="portal-tab-description">
                This tab allows you to configure the portal section of the banner template. 
                The portal contains additional information users see when reviewing their consent preferences.
            </p>

            <form onSubmit={handleSubmit} className="portal-tab-form">

                <label className="portal-tab-label">Upper Text:</label>
                <textarea name="upper_text" className="portal-tab-textarea" placeholder="e.g., We and our partners use cookies to improve services and enhance security." value={bannerData.portal.upper_text} onChange={handleChange} required />

                <label className="portal-tab-label">Lower Text:</label>
                <textarea name="lower_text" className="portal-tab-textarea" placeholder="e.g., You can review and adjust your consent preferences at any time." value={bannerData.portal.lower_text} onChange={handleChange} required />

                <div className="portal-tab-buttons">
                    <button type="submit" className="portal-tab-submit" disabled={isSubmitting}>
                        {isSubmitting ? "Creating..." : "Create Portal"}
                    </button>

                    {!isSubmitting && (
                        <button type="button" className="portal-tab-next-step-button" onClick={() => setActiveTab("categories")}>
                            Next Step →
                        </button>
                    )}
                </div>

            </form>

        </div>
    );
};

export default PortalTab;
