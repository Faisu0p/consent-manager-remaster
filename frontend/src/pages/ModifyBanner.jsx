import React, {useState, useEffect} from "react";
import bannerService from "../services/bannerServices";
import modifyTemplateService from "../services/modifyTemplateService";
import "../styles/ModifyBanner.css";

const ModifyBanner = () => {

  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [versionHistory, setVersionHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [changeNote, setChangeNote] = useState("Modified template version");
  const [createdBy, setCreatedBy] = useState("admin");

  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [isMandatory, setIsMandatory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [subCategoryName, setSubCategoryName] = useState("");
  const [subCategoryDescription, setSubCategoryDescription] = useState("");

  const fetchTemplates = async (targetTemplateId = null) => {
    try {
      const response = await bannerService.getAllFullBannerTemplates();
      const filteredTemplates = response.templates.map((template) => ({
        id: template.id,
        template_family_id: template.template_family_id,
        version_number: template.version_number,
        status: template.status,
        name: template.name,
        upper_text: template.portal?.upper_text || "",
        lower_text: template.portal?.lower_text || "",
        categories: template.categories || []
      }));

      setTemplates(filteredTemplates);

      if (targetTemplateId) {
        const matchedTemplate = filteredTemplates.find((template) => template.id === targetTemplateId);
        if (matchedTemplate) {
          setSelectedTemplate(matchedTemplate);
        }
      }

      console.log("Filtered Templates:", filteredTemplates);
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const fetchVersionHistory = async (familyId) => {
    if (!familyId) {
      setVersionHistory([]);
      return;
    }

    setHistoryLoading(true);
    try {
      const response = await bannerService.getTemplateVersionHistory(familyId);
      setVersionHistory(response.versions || []);
    } catch (error) {
      console.error("Error fetching version history:", error);
      setVersionHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleTemplateChange = (e) => {
    const templateId = e.target.value;
    const template = templates.find((t) => t.id === parseInt(templateId));
  
    setSelectedTemplate(template || null);
    setCategories([]);
    if (template?.template_family_id) {
      fetchVersionHistory(template.template_family_id);
    } else {
      setVersionHistory([]);
    }
    console.log("Selected Template:", template);
  };
  

  const handleAddCategory = () => {
    if (!categoryName.trim()) {
      alert("Category name is required!");
      return;
    }
  
    const newCategory = {
      id: Date.now(),
      name: categoryName,
      description: categoryDescription,
      is_required: isMandatory,
      subcategories: [],
    };
  
    setCategories([...categories, newCategory]);
  
    if (selectedTemplate) {
      setSelectedTemplate({
        ...selectedTemplate,
        categories: [...selectedTemplate.categories, newCategory], // Update template categories
      });
    }
  
    setCategoryName("");
    setCategoryDescription("");
    setIsMandatory(false);
  };
  
  
  
  
  const handleAddSubcategory = () => {
    if (!selectedCategory) {
      alert("Please select a category first.");
      return;
    }
  
    const newSubcategory = { id: Date.now(), name: subCategoryName, description: subCategoryDescription };
  
    setCategories((prevCategories) =>
      prevCategories.map((category) =>
        category.name === selectedCategory
          ? { ...category, subcategories: [...category.subcategories, newSubcategory] }
          : category
      )
    );
  
    if (selectedTemplate) {
      setSelectedTemplate({
        ...selectedTemplate,
        categories: selectedTemplate.categories.map((category) =>
          category.name === selectedCategory
            ? { ...category, subcategories: [...category.subcategories, newSubcategory] }
            : category
        ),
      });
    }
  
    setSubCategoryName("");
    setSubCategoryDescription("");
  };
  
  useEffect(() => {
    console.log("Latest Categories:", categories);
  }, [categories]);







  const handleSavePreferences = async () => {
    if (!selectedTemplate) {
      console.warn("No template selected.");
      return;
    }
  
    // Prevent duplicate categories by filtering out ones already in selectedTemplate
    const mergedCategories = [
      ...selectedTemplate.categories, 
      ...categories.filter(
        (newCat) => !selectedTemplate.categories.some((existingCat) => existingCat.name === newCat.name)
      ),
    ];
  
    const formattedData = {
      templateId: selectedTemplate.id,
      categories: mergedCategories.map((category) => ({
        name: category.name,
        description: category.description || "",
        isMandatory: category.is_required || category.isMandatory || false,
        subcategories: (category.subcategories || []).map((sub) => ({
          name: sub.name,
          description: sub.description || "",
        })),
      })),
    };
  
    try {
      // Import the modifyTemplateService
      const response = await modifyTemplateService.modifyBannerTemplate(
        formattedData.templateId, 
        formattedData.categories,
        changeNote,
        createdBy
      );
      console.log("Server response:", response);
      alert("Banner template modified successfully!");
      await fetchTemplates(response.templateId || null);
      if (response.templateFamilyId) {
        await fetchVersionHistory(response.templateFamilyId);
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      alert("Failed to save preferences. Please try again.");
    }
  };

  const handleRestoreVersion = async (templateVersionId, versionNumber) => {
    try {
      const response = await bannerService.createVersionFromTemplate(templateVersionId, {
        status: "published",
        changeNote: `Rollback from version ${versionNumber}`,
        createdBy,
      });

      alert(`Rollback successful. New version v${response.versionNumber} is now published.`);
      await fetchTemplates(response.templateId || null);
      if (response.templateFamilyId) {
        await fetchVersionHistory(response.templateFamilyId);
      }
    } catch (error) {
      console.error("Error restoring version:", error);
      alert("Failed to restore version. Please try again.");
    }
  };
  
  
  
  

  return (
    <div className="modify-banner-container enterprise-page">
      <div className="modify-banner-header enterprise-page-header">
        <h1 className="modify-banner-heading enterprise-page-title">Modify Banner</h1>
        <p className="modify-banner-description enterprise-page-subtitle">
          Select an existing template and update categories, subcategories, and mandatory consent behavior.
        </p>
      </div>
      
      {/* Dropdown for Template Selection */}
      <div className="modify-banner-dropdown-container">
        <label htmlFor="template-select">Select a Template:</label>
        <select id="template-select" className="modify-banner-dropdown" onChange={handleTemplateChange}>
          <option value="">-- Choose a Template --</option>
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
              {template.version_number ? ` (v${template.version_number})` : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="modify-banner-versioning-controls">
        <label htmlFor="change-note-input">Change Note:</label>
        <textarea
          id="change-note-input"
          value={changeNote}
          onChange={(e) => setChangeNote(e.target.value)}
          placeholder="Describe what changed in this version"
        />

        <label htmlFor="created-by-input">Modified By:</label>
        <input
          id="created-by-input"
          type="text"
          value={createdBy}
          onChange={(e) => setCreatedBy(e.target.value)}
          placeholder="e.g. admin"
        />
      </div>
      
      {/* Layout with Two Sections */}
      <div className="modify-banner-content">
        
        
        {/* Left Section - Categories and Subcategories */}
        <div className="modify-banner-left">
          <h2>Add Categories & Subcategories</h2>
          <p className="modify-banner-info">
            You can add new categories and subcategories to existing banner templates.
          </p>

          {/* Add Category Section */}
          <div className="modify-banner-category">
            <h3>Create Consent Category</h3>
            <p>
              Define consent categories to specify the types of data collection and their purposes. Users will be able to grant or deny consent based on these categories.
            </p>
            <label>Category Name:</label>
            <input type="text" placeholder="Enter category name (e.g., Marketing Preferences)" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} />
            
            <label>Reason for Consent:</label>
            <textarea placeholder="Explain why this category requires consent (e.g., legal compliance, personalized marketing, etc.)" value={categoryDescription} onChange={(e) => setCategoryDescription(e.target.value)} ></textarea>

            <div className="modify-banner-checkbox">
              <input type="checkbox" id="mandatory-category" checked={isMandatory} onChange={(e) => setIsMandatory(e.target.checked)}/>
              <label htmlFor="mandatory-category">This category is mandatory for consent</label>
            </div>

            <button className="modify-banner-add-btn" onClick={handleAddCategory}>Add Category</button>

          </div>

          {/* Add Subcategory Section */}
          <div className="modify-banner-subcategory">
            <h3>Create Consent Subcategory</h3>
            <p>
              Define subcategories under each category to further specify data collection purposes. (This is optional)
            </p>

            <label>Select a Category:</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Choose a Category</option>
              {categories.map((category, index) => (
                <option key={index} value={category.name}>{category.name}</option>
              ))}
            </select>


            <label>Subcategory Name:</label>
            <input 
              type="text" 
              placeholder="Enter subcategory name (e.g., Email Marketing)" 
              value={subCategoryName}
              onChange={(e) => setSubCategoryName(e.target.value)}
            />            
            <label>Description:</label>
            <textarea 
              placeholder="Explain why this subcategory requires consent" 
              value={subCategoryDescription}
              onChange={(e) => setSubCategoryDescription(e.target.value)}
            ></textarea>
            <button className="modify-banner-add-btn" onClick={handleAddSubcategory}>Add Subcategory</button>
          </div>
        </div>




        
        {/* Right Section - Banner Preview */}
        <div className="modify-banner-right">
          <h2>Banner Preview</h2>
          {selectedTemplate?.version_number && (
            <p className="modify-banner-version-badge">
              Active Version: v{selectedTemplate.version_number} ({selectedTemplate.status || "published"})
            </p>
          )}

            <div className="modify-banner-portal-banner">

              <div className="modify-banner-portal-header">
                <div className="modify-banner-portal-icon-container">
                  <div className="modify-banner-portal-pen-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 2L22 6L12 16H8V12L18 2Z" fill="#2E75B7"/>
                    </svg>
                  </div>
                </div>
                <h1 className="modify-banner-company-name">Welcome to {selectedTemplate ? selectedTemplate.name : "Preview"}</h1>
              </div>

              <div className="modify-banner-portal-content">
                <p className="modify-banner-consent-text">
                  {selectedTemplate ? selectedTemplate.upper_text : "We use cookies to enhance your experience. You can manage your preferences here."}
                </p>
                
                {/* Dynamically render categories and subcategories */}
                <div className="modify-banner-portal-allow-section">
                  {selectedTemplate?.categories?.length > 0 ? (
                    selectedTemplate.categories.map((category) => (
                      <div key={category.id} className="modify-banner-portal-allow-item">
                        <label>
                          <input
                            type="checkbox"
                            className="modify-banner-category-checkbox"
                            defaultChecked={category.is_required} // Check if required
                          />
                          {category.name}
                        </label>
                        <ul>
                          {category.subcategories && category.subcategories.length > 0 ? (
                            category.subcategories.map((sub) => (
                              <li key={sub.id}>{sub.name}</li>
                            ))
                          ) : (
                            <li>No subcategories</li>
                          )}
                        </ul>
                      </div>
                    ))
                  ) : (
                    <p>No categories available</p>
                  )}
                </div>


                <p className="modify-banner-consent-text">
                  {selectedTemplate ? selectedTemplate.lower_text : "You can modify your preferences anytime in settings."}
                </p>
              </div>

              <div className="modify-banner-portal-footer">
                <div className="modify-banner-portal-logo-container">

                </div>
                <div className="modify-banner-portal-save-container">
                  <button className="modify-banner-portal-save-button" onClick={handleSavePreferences}>Save</button>
                  <p className="modify-banner-portal-save-text">Set all your preferences to save and continue</p>
                </div>
              </div>

            </div>

            <div className="modify-banner-version-history">
              <h3>Version History</h3>
              {historyLoading ? (
                <p>Loading versions...</p>
              ) : versionHistory.length === 0 ? (
                <p>No version history available.</p>
              ) : (
                <ul>
                  {versionHistory.map((version) => (
                    <li key={version.id}>
                      <div>
                        <strong>v{version.version_number}</strong>
                        <span> - {version.status}</span>
                        {version.change_note ? <p>{version.change_note}</p> : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRestoreVersion(version.id, version.version_number)}
                      >
                        Restore as New Version
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
        </div>

      </div>
    </div>
  );
};

export default ModifyBanner;