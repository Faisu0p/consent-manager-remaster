import React, { useEffect } from 'react';
import '../styles/CookieConsent.css';

const CookieConsent = ({ openPortal, templateData }) => {

  useEffect(() => {
    console.log("Received template - CookieConsent:", templateData);
  }, [templateData]);

  return (
    <div className="cookie-banner-container">
      <div className="cookie-banner-banner">
        <div className="cookie-banner-header">
          <h1 className="cookie-banner-company-name">{templateData ? templateData.name : "COMPANY"}</h1>
          <h2 className="cookie-banner-title">{templateData ? templateData.header_text : "Do you agree to let us use cookies?"}</h2>
        </div>

        <div className="cookie-banner-content">
          <p className="cookie-banner-intro">{templateData ? templateData.main_text : "We and our 19 partners use cookies and trackers."}</p>

        {!templateData && (
          <div className="cookie-banner-purposes">
            <div className="cookie-banner-purpose-item">
              <div className="cookie-banner-checkbox-icon">✓</div>
              <div className="cookie-banner-purpose-text">Provide live support and access to our help center</div>
            </div>
            <div className="cookie-banner-purpose-item">
              <div className="cookie-banner-checkbox-icon">✓</div>
              <div className="cookie-banner-purpose-text">Generate insights to improve the interface</div>
            </div>
            <div className="cookie-banner-purpose-item">
              <div className="cookie-banner-checkbox-icon">✓</div>
              <div className="cookie-banner-purpose-text">Help you navigate and display important information</div>
            </div>
            <div className="cookie-banner-purpose-item">
              <div className="cookie-banner-checkbox-icon">✓</div>
              <div className="cookie-banner-purpose-text">Measure marketing effectiveness and offer updates</div>
            </div>
            <div className="cookie-banner-purpose-item">
              <div className="cookie-banner-checkbox-icon">✓</div>
              <div className="cookie-banner-purpose-text">Manage authentication and monitor errors</div>
            </div>
          </div>
        )}

          <p className="cookie-banner-details">
          {templateData ? templateData.info_paragraph : "Some cookies are needed for technical purposes, while others help with ads, insights, and more.Learn more in our privacy center."}
          </p>

          <div className="cookie-banner-buttons">
            <button className="cookie-banner-configure-button" onClick={openPortal}>{templateData ? templateData.button_configure_text : "Configure"}</button>
            <button className="cookie-banner-disagree-button">{templateData ? templateData.button_reject_text : "I disagree"}</button>
            <button className="cookie-banner-agree-button">{templateData ? templateData.button_accept_text : "I agree"}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
