import React, { useEffect, useMemo, useState } from 'react';
import '../styles/CookieConsentPortal.css';

const CookieConsentPortal = ({ onClose, templateData }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);

  const handleSave = () => {
    console.log('User saved preferences', selectedCategoryIds);
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  if (!isOpen) return null;


  useEffect(() => {
    console.log("Received template - CookieCOnsentPortal:", templateData);
  }, [templateData]);

  const categories = useMemo(() => {
    if (templateData?.categories?.length) {
      return templateData.categories;
    }

    return [
      {
        id: 1,
        name: 'Essential Cookies',
        subcategories: [{ name: 'Session Management' }, { name: 'Security' }],
      },
      {
        id: 2,
        name: 'Analytics Cookies',
        subcategories: [{ name: 'Traffic Analysis' }, { name: 'Performance Insights' }],
      },
      {
        id: 3,
        name: 'Marketing Cookies',
        subcategories: [{ name: 'Ad Measurement' }, { name: 'Personalized Promotions' }],
      },
    ];
  }, [templateData]);

  useEffect(() => {
    setSelectedCategoryIds(categories.map((category) => category.id));
  }, [categories]);

  const toggleCategory = (categoryId) => {
    setSelectedCategoryIds((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      }
      return [...prev, categoryId];
    });
  };

  return (
    <div className="cookie-portal-container">
      <div className="cookie-portal-banner">
        <div className="cookie-portal-header">
          <div className="cookie-portal-header-left">
            <div className="cookie-portal-icon-container">
              <div className="cookie-portal-pen-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 2L22 6L12 16H8V12L18 2Z" fill="#2E75B7"/>
                </svg>
              </div>
            </div>
            <h2 className="cookie-portal-welcome-title">Welcome to {templateData ? templateData.name : "COMPANY"}</h2>
          </div>
          <button className="cookie-portal-close-button" onClick={handleClose}>✕</button>
        </div>

        <div className="cookie-portal-content">
          <p className="cookie-portal-consent-text">
          {templateData
            ? templateData.portal?.upper_text 
            : "We use cookies to enhance your experience. You can manage your preferences here."
          }

          </p>

          <div className="cookie-portal-allow-section">
            {categories.map((category) => (
              <div key={category.id} className="cookie-portal-allow-item">
                <label>
                  <input
                    type="checkbox"
                    checked={selectedCategoryIds.includes(category.id)}
                    onChange={() => toggleCategory(category.id)}
                  />
                  {category.name}
                </label>
                {category.subcategories && category.subcategories.length > 0 && (
                  <ul>
                    {category.subcategories.map((sub, subIndex) => (
                      <li key={`${category.id}-${subIndex}`}>{sub.name}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          <div className="cookie-portal-consent-footnote">
            <p>
            {templateData 
              ? templateData.portal?.lower_text 
              : "We use cookies to enhance your experience. You can manage your preferences here."
            }

            </p>
          </div>

        </div>

        <div className="cookie-portal-footer">
          <div className="cookie-portal-logo-container">
            <svg width="110" height="30" viewBox="0 0 110 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="110" height="30" rx="8" fill="#fff1f6"/>
              <text x="55" y="19" textAnchor="middle" fill="#e91e63" fontSize="18" fontWeight="700" fontFamily="Arial, Helvetica, sans-serif">LYKAA</text>
            </svg>
            <span>Powered by Konsento</span>
          </div>

          <div className="cookie-portal-save-container">
            <button className="cookie-portal-save-button" onClick={handleSave}>Save</button>
            <p className="cookie-portal-save-text">Set all your preferences to save and continue</p>
            </div>
          </div>
      </div>
    </div>
  );
};

export default CookieConsentPortal;