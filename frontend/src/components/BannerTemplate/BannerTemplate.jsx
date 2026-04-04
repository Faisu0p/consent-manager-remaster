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

    const steps = [
        { id: "templates", label: "Consent Template" },
        { id: "portal", label: "Preceding Notice" },
        { id: "categories", label: "Lawful Purposes" },
        { id: "subcategories", label: "Itemised Description" },
        { id: "partners", label: "Data Processor Details" }
    ];

    const activeStepIndex = steps.findIndex((step) => step.id === activeTab);
    const completedPercentage = activeStepIndex >= 0 ? ((activeStepIndex + 1) / steps.length) * 100 : 0;

    const goToPreviousStep = () => {
        if (activeStepIndex > 0) {
            setActiveTab(steps[activeStepIndex - 1].id);
        }
    };

    const goToNextStep = () => {
        if (activeStepIndex < steps.length - 1) {
            setActiveTab(steps[activeStepIndex + 1].id);
        }
    };

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
            <div className="banner-template-header">
                <h2 className="banner-template-title">Create Banner Workflow</h2>
                <p className="banner-template-subtitle">Complete each step to configure the banner and review updates live.</p>
            </div>

            <div className="banner-template-tabs">
                {steps.map((step, index) => (
                    <button
                        key={step.id}
                        onClick={() => setActiveTab(step.id)}
                        disabled={!selectedLanguage}
                        className={activeTab === step.id ? "banner-template-active" : ""}
                    >
                        <span className="banner-template-step-index">{index + 1}</span>
                        <span>{step.label}</span>
                    </button>
                ))}
            </div>

            {selectedLanguage && (
                <div className="banner-template-progress">
                    <div className="banner-template-progress-meta">
                        <span>Step {activeStepIndex + 1} of {steps.length}</span>
                        <span>{Math.round(completedPercentage)}% complete</span>
                    </div>
                    <div className="banner-template-progress-track">
                        <div className="banner-template-progress-fill" style={{ width: `${completedPercentage}%` }}></div>
                    </div>
                </div>
            )}

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

            {selectedLanguage && (
                <div className="banner-template-footer-nav">
                    <button type="button" onClick={goToPreviousStep} disabled={activeStepIndex <= 0}>Back</button>
                    <button type="button" onClick={goToNextStep} disabled={activeStepIndex >= steps.length - 1}>Next</button>
                </div>
            )}
        </div>
    );
};

export default BannerTemplate;