import React, { useState, useEffect } from "react";
import bannerTemplateService from "../../services/bannerServices";
import TemplateTab from "./TemplateTab";
import PortalTab from "./PortalTab";
import CategoryTab from "./CategoryTab";
import SubcategoryTab from "./SubcategoryTab";
import PartnerTab from "./PartnerTab";
import "./BannerTemplate.css";

const BannerTemplate = ({ bannerData, setBannerData, activeTab, setActiveTab }) => {
    const [selectedLanguage, setSelectedLanguage] = useState("");
    const [englishTemplates, setEnglishTemplates] = useState([]);
    const [parentTemplateId, setParentTemplateId] = useState("");

    const languages = [
        { code: "en", name: "English" },
        { code: "hi", name: "Hindi" },
        { code: "gu", name: "Gujarati" },
        { code: "mr", name: "Marathi" },
        { code: "pa", name: "Punjabi" },
        { code: "fr", name: "French" },
        { code: "es", name: "Spanish" },
        { code: "de", name: "German" }
    ];
    

    const handleLanguageChange = (e) => {
        const newLanguage = e.target.value;
        setSelectedLanguage(newLanguage);

        setParentTemplateId("");

        setBannerData(prevData => ({
            ...prevData,
            template: {
                ...prevData.template,
                language_code: newLanguage,
                parent_template_id: null
            }
        }));
        console.log("Selected Language:", newLanguage);
    };

    useEffect(() => {
        const fetchEnglishTemplates = async () => {
            try {
                const templates = await bannerTemplateService.getEnglishBannerTemplates();
                setEnglishTemplates(templates);
            } catch (error) {
                console.error("Error fetching English templates:", error);
            }
        };
    
        fetchEnglishTemplates();
    }, []);

    return (
        <div className="banner-template-container">
            <h2 className="banner-template-title">Consent Template Management</h2>
            <div className="banner-template-tabs">
                <button onClick={() => setActiveTab("templates")} disabled={!selectedLanguage} className={activeTab === "templates" ? "banner-template-active" : ""}>Consent Template</button>
                <button onClick={() => setActiveTab("portal")} disabled={!selectedLanguage} className={activeTab === "portal" ? "banner-template-active" : ""}>Preceding Notice</button>
                <button onClick={() => setActiveTab("categories")} disabled={!selectedLanguage} className={activeTab === "categories" ? "banner-template-active" : ""}>Lawful Purposes</button>
                <button onClick={() => setActiveTab("subcategories")} disabled={!selectedLanguage} className={activeTab === "subcategories" ? "banner-template-active" : ""}>Itemised Description</button>
                <button onClick={() => setActiveTab("partners")} disabled={!selectedLanguage} className={activeTab === "partners" ? "banner-template-active" : ""}>Data Processor Details</button>
            </div>

            <div className="banner-template-language-selection">
                <label>Select Language:</label>
                <select value={bannerData.template?.language_code || ""} onChange={handleLanguageChange}>
                    <option value="">-- Select Language --</option>
                    {languages.map(lang => (
                        <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                </select>
            </div>

            {selectedLanguage && selectedLanguage !== "en" && (
                <div className="banner-template-parent-template-selection">
                    <label>Select English Template:</label>
                    <select value={parentTemplateId} onChange={(e) => {
                        const selectedId = e.target.value;
                        setParentTemplateId(selectedId);
                        setBannerData(prevData => ({
                            ...prevData,
                            template: {
                                ...prevData.template,
                                parent_template_id: selectedId || null 
                            }
                        }));
                    }}>
                        <option value="">-- Select English Template --</option>
                        {englishTemplates.map(template => (
                            <option key={template.id} value={template.id}>{template.name}</option>
                        ))}
                    </select>
                </div>
            )}

            {selectedLanguage && (
                <div className="banner-template-content">
                    {activeTab === "templates" && <TemplateTab bannerData={bannerData} setBannerData={setBannerData} setActiveTab={setActiveTab} />}
                    {activeTab === "portal" && <PortalTab bannerData={bannerData} setBannerData={setBannerData} setActiveTab={setActiveTab}/>}
                    {activeTab === "categories" && <CategoryTab bannerData={bannerData} setBannerData={setBannerData} setActiveTab={setActiveTab}/>}
                    {activeTab === "subcategories" && <SubcategoryTab bannerData={bannerData} setBannerData={setBannerData} setActiveTab={setActiveTab}/>}
                    {activeTab === "partners" && <PartnerTab bannerData={bannerData} setBannerData={setBannerData} />}
                </div>
            )}
        </div>
    );
};

export default BannerTemplate;