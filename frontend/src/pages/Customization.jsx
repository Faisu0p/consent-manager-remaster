import React, { useState } from "react";
import bannerService from "../services/bannerServices";
import "../styles/Customization.css";
import BannerTemplate from "../components/BannerTemplate/BannerTemplate";
import BannerPreview from "../components/BannerTemplate/BannerPreview";

const Customization = () => {

  const [bannerData, setBannerData] = useState({
    template: {
      name: "",
      mainText: "",
      infoParagraph: "",
      headerText: "",
      buttonAcceptText: "",
      buttonRejectText: "",
      buttonConfigureText: "",
      language_code: "",
      parent_template_id: "",
    },
    portal: {
      template_id: "",
      upper_text: "",
      lower_text: "",
    },
    categories: [],
    subcategories: [],
    partners: []
  });

  const [activeTab, setActiveTab] = useState("templates");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

    // Function to display banner data in the console
    const handleDisplayBannerData = () => {
      console.log("Current Banner Data:", bannerData);
    };

      // Function to send banner data to the backend
      const handleSubmit = async () => {
        setLoading(true);
        setMessage("");
      
        // Ensure correct data types
        const cleanedData = {
          ...bannerData,
          categories: bannerData.categories.map(category => ({
            ...category,
            is_required: Boolean(category.is_required), // Ensure boolean
          })),
          partners: bannerData.partners.map(partner => ({
            ...partner,
            name: partner.name?.trim() || "Unnamed Partner", // Prevent empty name
            is_blocked: Boolean(partner.is_blocked), // Ensure boolean
          })),
        };
      
        try {
          const response = await bannerService.createFullBannerTemplate(cleanedData);
          setMessage("Banner template created successfully!");
          console.log("Response:", response);
        } catch (error) {
          setMessage(`Error: ${JSON.stringify(error.errors, null, 2)}`);
          console.error("API Error:", error);
        } finally {
          setLoading(false);
        }
      };
      
    return (
      <div className="customization-container">
        <div className="customization-main">
          <BannerTemplate
            bannerData={bannerData}
            setBannerData={setBannerData}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          {/* Center BannerPreview vertically */}
          <div className="preview-wrapper">
            <BannerPreview bannerData={bannerData} activeTab={activeTab} />
          </div>
        </div>

    
        <div className="customization-buttons">
          <button onClick={handleDisplayBannerData} className="display-banner-btn">
            Show Banner Data
          </button>
          <button
            onClick={handleSubmit}
            className="submit-banner-btn"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Banner Data"}
          </button>
        </div>
    
        {message && <p className="api-message">{message}</p>}
      </div>
    );
      
};

export default Customization;
