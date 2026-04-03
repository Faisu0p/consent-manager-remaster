import React, {useState, useEffect} from "react";
import bannerService from "../services/bannerServices";
import modifyTemplateService from "../services/modifyTemplateService";
import "../styles/ModifyBanner.css";

const ModifyBanner = () => {

  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [isMandatory, setIsMandatory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [subCategoryName, setSubCategoryName] = useState("");
  const [subCategoryDescription, setSubCategoryDescription] = useState("");

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await bannerService.getAllFullBannerTemplates();
        const filteredTemplates = response.templates.map((template) => ({
          id: template.id,
          name: template.name,
          upper_text: template.portal?.upper_text || "",
          lower_text: template.portal?.lower_text || "",
          categories: template.categories || []
        }));
  
        setTemplates(filteredTemplates);
        console.log("Filtered Templates:", filteredTemplates);
      } catch (error) {
        console.error("Error fetching templates:", error);
      }
    };
  
    fetchTemplates();
  }, []);

  const handleTemplateChange = (e) => {
    const templateId = e.target.value;
    const template = templates.find((t) => t.id === parseInt(templateId));
  
    setSelectedTemplate(template || null);
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
        formattedData.categories
      );
      console.log("Server response:", response);
      alert("Banner template modified successfully!");
    } catch (error) {
      console.error("Error saving preferences:", error);
      alert("Failed to save preferences. Please try again.");
    }
  };
  
  
  
  

  return (
    <div className="modify-banner-container">
      
      {/* Section Heading */}
      <h1 className="modify-banner-heading">Modify Banner Section</h1>
      <p className="modify-banner-description">
        Here you can modify existing banners by adding categories or subcategories.
        Here you can modify existing banners by adding categories or subcategories.
        Here you can modify existing banners by adding categories or subcategories.
      </p>
      
      {/* Dropdown for Template Selection */}
      <div className="modify-banner-dropdown-container">
        <label htmlFor="template-select">Select a Template:</label>
        <select id="template-select" className="modify-banner-dropdown" onChange={handleTemplateChange}>
          <option value="">-- Choose a Template --</option>
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
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
        </div>

      </div>
    </div>
  );
};

export default ModifyBanner;