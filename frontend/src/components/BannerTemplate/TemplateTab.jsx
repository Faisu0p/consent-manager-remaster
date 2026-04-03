import React, {useState} from "react";
import "../../styles/TemplateTab.css"

const TemplateTab = ({ bannerData, setBannerData, setActiveTab }) => {

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setBannerData({
            ...bannerData,
            template: { 
                ...bannerData.template, 
                [e.target.name]: e.target.value 
            },
        });
    };
    

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        console.log(bannerData);
        alert("Template Created Successfully!");

        setTimeout(() => setIsSubmitting(false), 2000);
    };

    return (
        <div className="template-tab-container">
            <h3 className="template-tab-title">Create Main Banner Template</h3>

            <p className="template-tab-description">
                This tab allows you to create and configure a main banner template, 
                including its text content and button labels. Users will see this banner 
                when they interact with consent options on your platform.
            </p>

            <form onSubmit={handleSubmit} className="template-tab-form">

                <label className="template-tab-label">Template Name:</label>
                <input type="text" name="name" className="template-tab-input" placeholder="e.g., Secure Banking Notice" value={bannerData.template.name} onChange={handleChange} required />

                <label className="template-tab-label">Header Text:</label>
                <input type="text" name="headerText" className="template-tab-input" placeholder="e.g., Your Security is Our Priority" value={bannerData.template.headerText} onChange={handleChange} required />

                <label className="template-tab-label">Main Message:</label>
                <textarea name="mainText" className="template-tab-textarea" placeholder="e.g., We use cookies to ensure secure transactions." value={bannerData.template.mainText} onChange={handleChange} required />

                <label className="template-tab-label">Additional Info:</label>
                <textarea name="infoParagraph" className="template-tab-textarea" placeholder="e.g., Essential cookies enable secure logins." value={bannerData.template.infoParagraph} onChange={handleChange} required />

                <label className="template-tab-label">Accept Button:</label>
                <input type="text" name="buttonAcceptText" className="template-tab-input" placeholder="e.g., Accept & Continue" value={bannerData.template.buttonAcceptText} onChange={handleChange} required />

                <label className="template-tab-label">Reject Button:</label>
                <input type="text" name="buttonRejectText" className="template-tab-input" placeholder="e.g., Decline Cookies" value={bannerData.template.buttonRejectText} onChange={handleChange} required />

                <label className="template-tab-label">Configure Button:</label>
                <input type="text" name="buttonConfigureText" className="template-tab-input" placeholder="e.g., Manage Preferences" value={bannerData.template.buttonConfigureText} onChange={handleChange} required />

                <div className="template-tab-buttons">
                    <button type="submit" className="template-tab-submit" disabled={isSubmitting}>
                        {isSubmitting ? "Creating..." : "Create Template"}
                    </button>

                    {!isSubmitting && (
                        <button type="button" className="template-tab-next-step-button" onClick={() => setActiveTab("portal")}>
                            Next Step →
                        </button>
                    )}
                </div>

            </form>

        </div>
    );
};

export default TemplateTab;
