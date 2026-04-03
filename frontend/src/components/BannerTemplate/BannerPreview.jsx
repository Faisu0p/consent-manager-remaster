import React from "react";
import "./BannerPreview.css";

const BannerPreview = ({ bannerData, activeTab }) => {
  return (
    <div className="preview-component-banner-preview">
      <h3>Preview</h3>

      {activeTab === "templates" && (
        <div className="preview-component-template-preview">
          <h2>{bannerData.template.name || "Secure Banking"}</h2>
          <h4>{bannerData.template.headerText || "Your Security is Our Priority"}</h4>
          <p>{bannerData.template.mainText || "We use cookies to enhance your banking experience, ensure secure transactions, and improve our services. By selecting 'Accept & Continue', you consent to the use of essential and analytical cookies for secure banking and improved services."}</p>
          <p>{bannerData.template.infoParagraph || "Essential cookies ensure secure logins and fraud prevention. Others help personalize your banking experience. You can manage your preferences anytime."}</p>

          <div className="preview-component-buttons">
            <button>{bannerData.template.buttonAcceptText || "Accept & Continue"}</button>
            <button>{bannerData.template.buttonRejectText || "Decline Cookies"}</button>
            <button>{bannerData.template.buttonConfigureText || "Manage Preferences"}</button>
          </div>
        </div>
      )}

      {(activeTab === "portal" || activeTab === "categories" || activeTab === "subcategories") && (
        <div className="preview-component-portal-preview">
          <h2>{bannerData.template.name || "Secure Banking"}</h2>
          <p>
            {bannerData.portal.upper_text ||
              "We and our partners use cookies and process data to provide a personalized experience, analyze site usage, and enhance security. You can review and adjust your preferences below."}
          </p>


          {bannerData.categories.length > 0 ? (
            <div className="preview-component-categories-preview">
              {bannerData.categories.map((category) => (
                <div key={category.id} className="preview-component-category-item">
                  <label>
                    <input type="checkbox" />
                    {category.name}
                  </label>
                  <ul className="preview-component-subcategories-list">
                    {bannerData.subcategories
                      .filter((sub) => Number(sub.subcategoryCategoryId) === Number(category.id))
                      .map((subcategory) => (
                        <li key={subcategory.id}>
                          {subcategory.subcategoryName} - {subcategory.subcategoryDescription}
                        </li>
                      ))}
                  </ul>
                  <div className="preview-component-category-description">
                    {category.description}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>Please create itemized categories for consent collection.</p>
          )}



          <p>
            {bannerData.portal.lower_text ||
              "For any inquiries, please contact our Data Protection Office at abc.com. You can update your consent anytime by logging into our mobile app or portal and selecting 'My Privacy'"}
          </p>
        </div>
      )}

      {activeTab === "partners" && (
        <div className="preview-component-template-preview">
          <h2>Our Partners</h2>
          {bannerData.partners && bannerData.partners.length > 0 ? (
            <ul className="preview-component-partners-list">
              {bannerData.partners.map((partner) => (
                <li key={partner.id} className="preview-component-partner-item">
                  <label className="preview-component-checkbox-label">
                    <input
                      type="checkbox"
                      defaultChecked={partner.isBlocked}
                      disabled={partner.isBlocked}
                      className="preview-component-partner-checkbox"
                    />
                    {partner.partnerName}
                  </label>
                  {partner.isBlocked && <span className="preview-component-required"> - Required</span>}
                </li>
              ))}
            </ul>
          ) : (
            <p>No partners available</p>
          )}
        </div>
      )}

    </div>
  );
};

export default BannerPreview;
