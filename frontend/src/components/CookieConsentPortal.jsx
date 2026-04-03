import React, { useState, useEffect } from 'react';
import '../styles/CookieConsentPortal.css';

const CookieConsentPortal = ({ onClose, templateData }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    contentDisplay: false,
    storing: false,
    authentication: false,
    storeAccess: false,
    functionality: false,
    advertising: false,
    personalizedContent: false,
    analytics: false,
    scanDevice: false,
    geolocation: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleAgreeAll = () => {
    console.log('User agreed to all cookies');
    setIsOpen(false);
  };

  const handleDisagreeAll = () => {
    console.log('User disagreed to all cookies');
    setIsOpen(false);
  };

  const handleSave = () => {
    console.log('User saved preferences');
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  if (!isOpen) return null;


  useEffect(() => {
    console.log("Received template - CookieCOnsentPortal:", templateData);
  }, [templateData]);

  return (
    <div className="cookie-portal-container">
      <div className="cookie-portal-banner">
        <div className="cookie-portal-header">
          <div className="cookie-portal-icon-container">
            <div className="cookie-portal-pen-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 2L22 6L12 16H8V12L18 2Z" fill="#2E75B7"/>
              </svg>
            </div>
          </div>
          <h2 className="cookie-portal-welcome-title">Welcome to {templateData ? templateData.name : "COMPANY"}</h2>
          <button className="cookie-portal-close-button" onClick={handleClose}>✕</button>
        </div>

        <div className="cookie-portal-content">
          <p className="cookie-portal-consent-text">
          {templateData
            ? templateData.portal.upper_text 
            : "We and our partners place cookies, access and use non-sensitive information from your device to improve our products and personalize ads and other contents throughout this website. You may accept all or part of these operations. To learn more about cookies, partners, and how we use your data, to review your options or these operations for each partner, visit our privacy center."
          }

          </p>

          <div className="cookie-portal-allow-section">
            <div className="cookie-portal-allow-text">YOU ALLOW</div>
            <div className="cookie-portal-allow-buttons">
              <button className="cookie-portal-disagree-all-button">Disagree to all</button>
              <button className="cookie-portal-agree-all-button">Agree to all</button>
            </div>
          </div>


        {!templateData ? (
          
          <div className="cookie-portal-consent-options">
            {/* Content display */}
            <div className="cookie-portal-consent-section">
              <div className="cookie-portal-section-header" onClick={() => toggleSection('contentDisplay')}>
                <span className={`cookie-portal-toggle-icon ${expandedSections.contentDisplay ? 'cookie-portal-minus' : 'cookie-portal-plus'}`}>
                  {expandedSections.contentDisplay ? '-' : '+'}
                </span>
                <span className="cookie-portal-section-title">Content display</span>
                <span className="cookie-portal-required-tag">REQUIRED</span>
              </div>
              {expandedSections.contentDisplay && (
                <div className="cookie-portal-section-content">
                  <p>Content description goes here...</p>
                </div>
              )}
            </div>

            {/* Storing information */}
            <div className="cookie-portal-consent-section">
              <div className="cookie-portal-section-header" onClick={() => toggleSection('storing')}>
                <span className={`cookie-portal-toggle-icon ${expandedSections.storing ? 'cookie-portal-minus' : 'cookie-portal-plus'}`}>
                  {expandedSections.storing ? '-' : '+'}
                </span>
                <span className="cookie-portal-section-title">Storing and/or accessing information on a terminal</span>
              </div>
              {expandedSections.storing && (
                <div className="cookie-portal-section-content">
                  <p className="cookie-portal-section-description">
                    Cookies, identifiers of your terminal or other information may be stored or consulted 
                    on your terminal for the purposes presented to you.
                  </p>
                  <div className="cookie-portal-action-buttons">
                    <button className="cookie-portal-disagree-button">Disagree</button>
                    <button className="cookie-portal-agree-button">Agree</button>
                  </div>
                </div>
              )}
            </div>

            {/* Authentication */}
            <div className="cookie-portal-consent-section">
              <div className="cookie-portal-section-header" onClick={() => toggleSection('authentication')}>
                <span className={`cookie-portal-toggle-icon ${expandedSections.authentication ? 'cookie-portal-minus' : 'cookie-portal-plus'}`}>
                  {expandedSections.authentication ? '-' : '+'}
                </span>
                <span className="cookie-portal-section-title">Authentication and authorization management</span>
              </div>
              {expandedSections.authentication && (
                <div className="cookie-portal-section-content">
                  <div className="cookie-portal-action-buttons">
                    <button className="cookie-portal-disagree-button">Disagree</button>
                    <button className="cookie-portal-agree-button">Agree</button>
                  </div>
                </div>
              )}
            </div>

            {/* Store access */}
            <div className="cookie-portal-consent-section">
              <div className="cookie-portal-section-header" onClick={() => toggleSection('storeAccess')}>
                <span className={`cookie-portal-toggle-icon ${expandedSections.storeAccess ? 'cookie-portal-minus' : 'cookie-portal-plus'}`}>
                  {expandedSections.storeAccess ? '-' : '+'}
                </span>
                <span className="cookie-portal-section-title">Store and/or access information on a device</span>
              </div>
              {expandedSections.storeAccess && (
                <div className="cookie-portal-section-content">
                  <div className="cookie-portal-action-buttons">
                    <button className="cookie-portal-disagree-button">Disagree</button>
                    <button className="cookie-portal-agree-button">Agree</button>
                  </div>
                </div>
              )}
            </div>

            {/* Functionality */}
            <div className="cookie-portal-consent-section">
              <div className="cookie-portal-section-header" onClick={() => toggleSection('functionality')}>
                <span className={`cookie-portal-toggle-icon ${expandedSections.functionality ? 'cookie-portal-minus' : 'cookie-portal-plus'}`}>
                  {expandedSections.functionality ? '-' : '+'}
                </span>
                <span className="cookie-portal-section-title">Functionality</span>
              </div>
              {expandedSections.functionality && (
                <div className="cookie-portal-section-content">
                  <div className="cookie-portal-action-buttons">
                    <button className="cookie-portal-disagree-button">Disagree</button>
                    <button className="cookie-portal-agree-button">Agree</button>
                  </div>
                </div>
              )}
            </div>

            {/* Advertising */}
            <div className="cookie-portal-consent-section">
              <div className="cookie-portal-section-header" onClick={() => toggleSection('advertising')}>
                <span className={`cookie-portal-toggle-icon ${expandedSections.advertising ? 'cookie-portal-minus' : 'cookie-portal-plus'}`}>
                  {expandedSections.advertising ? '-' : '+'}
                </span>
                <span className="cookie-portal-section-title">Personalised advertising and ad performance measurement</span>
              </div>
              {expandedSections.advertising && (
                <div className="cookie-portal-section-content">
                  <div className="cookie-portal-action-buttons">
                    <button className="cookie-portal-disagree-button">Disagree</button>
                    <button className="cookie-portal-agree-button">Agree</button>
                  </div>
                </div>
              )}
            </div>

            {/* Personalized content */}
            <div className="cookie-portal-consent-section">
              <div className="cookie-portal-section-header" onClick={() => toggleSection('personalizedContent')}>
                <span className={`cookie-portal-toggle-icon ${expandedSections.personalizedContent ? 'cookie-portal-minus' : 'cookie-portal-plus'}`}>
                  {expandedSections.personalizedContent ? '-' : '+'}
                </span>
                <span className="cookie-portal-section-title">Personalised content, content performance measurement, audience data, and product development</span>
              </div>
              {expandedSections.personalizedContent && (
                <div className="cookie-portal-section-content">
                  <div className="cookie-portal-action-buttons">
                    <button className="cookie-portal-disagree-button">Disagree</button>
                    <button className="cookie-portal-agree-button">Agree</button>
                  </div>
                </div>
              )}
            </div>

            {/* Analytics */}
            <div className="cookie-portal-consent-section">
              <div className="cookie-portal-section-header" onClick={() => toggleSection('analytics')}>
                <span className={`cookie-portal-toggle-icon ${expandedSections.analytics ? 'cookie-portal-minus' : 'cookie-portal-plus'}`}>
                  {expandedSections.analytics ? '-' : '+'}
                </span>
                <span className="cookie-portal-section-title">Analytics</span>
              </div>
              {expandedSections.analytics && (
                <div className="cookie-portal-section-content">
                  <div className="cookie-portal-action-buttons">
                    <button className="cookie-portal-disagree-button">Disagree</button>
                    <button className="cookie-portal-agree-button">Agree</button>
                  </div>
                </div>
              )}
            </div>

            {/* Scan device */}
            <div className="cookie-portal-consent-section">
              <div className="cookie-portal-section-header" onClick={() => toggleSection('scanDevice')}>
                <span className={`cookie-portal-toggle-icon ${expandedSections.scanDevice ? 'cookie-portal-minus' : 'cookie-portal-plus'}`}>
                  {expandedSections.scanDevice ? '-' : '+'}
                </span>
                <span className="cookie-portal-section-title">Actively scan device characteristics for identification</span>
              </div>
              {expandedSections.scanDevice && (
                <div className="cookie-portal-section-content">
                  <div className="cookie-portal-action-buttons">
                    <button className="cookie-portal-disagree-button">Disagree</button>
                    <button className="cookie-portal-agree-button">Agree</button>
                  </div>
                </div>
              )}
            </div>

            {/* Geolocation */}
            <div className="cookie-portal-consent-section">
              <div className="cookie-portal-section-header" onClick={() => toggleSection('geolocation')}>
                <span className={`cookie-portal-toggle-icon ${expandedSections.geolocation ? 'cookie-portal-minus' : 'cookie-portal-plus'}`}>
                  {expandedSections.geolocation ? '-' : '+'}
                </span>
                <span className="cookie-portal-section-title">Storage and access to geolocation information for targeted advertising purposes</span>
              </div>
              {expandedSections.geolocation && (
                <div className="cookie-portal-section-content">
                  <div className="cookie-portal-action-buttons">
                    <button className="cookie-portal-disagree-button">Disagree</button>
                    <button className="cookie-portal-agree-button">Agree</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        

      ) : (
        <div className="cookie-portal-dynamic-sections">
          {templateData.categories.map((category, index) => (
            <div key={index} className="cookie-portal-consent-section">
              {/* Category Header */}
              <div className="cookie-portal-section-header" onClick={() => toggleSection(`category-${index}`)}>
                <span className={`cookie-portal-toggle-icon ${expandedSections[`category-${index}`] ? 'cookie-portal-minus' : 'cookie-portal-plus'}`}>
                  {expandedSections[`category-${index}`] ? '-' : '+'}
                </span>
                <span className="cookie-portal-section-title">{category.name}</span>
              </div>
      
              {/* Category Content */}
              {expandedSections[`category-${index}`] && (
                <div className="cookie-portal-section-content">
                  <p className="cookie-portal-section-description">{category.description}</p>
      
                  {/* Subcategories Section */}
                  {category.subcategories && category.subcategories.length > 0 && (
                    <div className="cookie-portal-subcategories">
                      {category.subcategories.map((sub, subIndex) => (
                        <div key={subIndex} className="cookie-portal-subcategory">
                          <span className="cookie-portal-subcategory-title">{sub.name}</span>
                          <p className="cookie-portal-subcategory-description">{sub.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
      
                  {/* Action Buttons */}
                  <div className="cookie-portal-action-buttons">
                    <button className="cookie-portal-disagree-button">Disagree</button>
                    <button className="cookie-portal-agree-button">Agree</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      

          <div className="cookie-portal-consent-footnote">
            <p>
            {templateData 
              ? templateData.portal.lower_text 
              : "By giving consent to the purposes above, you also allow this website and its partners to operate the following data processing: Deliver and present advertising and content, Ensure security, prevent and detect fraud, and fix errors, Link different devices, Match and combine data from other data sources, and Save and communicate privacy choices."
            }

            </p>
          </div>

          <div className="cookie-portal-partners-save-section">
            <button className="cookie-portal-view-partners-button">View our partners</button>
            <div className="cookie-portal-save-container">
              <button className="cookie-portal-save-button">Save</button>
              <p className="cookie-portal-save-text">Set all your preferences to save and continue</p>
            </div>
          </div>

          <div className="cookie-portal-footer">
            <div className="cookie-portal-didomi-logo">
              <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="8" width="32" height="22" rx="2" fill="#2E75B7"/>
                <path d="M12 20L16 24L26 14" stroke="white" strokeWidth="2"/>
              </svg>
              <div className="cookie-portal-didomi-text">
                <span className="cookie-portal-didomi-brand">{templateData ? templateData.name : "COMPANY"}</span>
                <span className="cookie-portal-didomi-tagline">PRIVACY MANAGEMENT</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentPortal;