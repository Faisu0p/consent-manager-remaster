import React, { useEffect, useState } from "react";
import "../styles/TemplateLibrary.css";
import { FaEye, FaPlus, FaEdit } from "react-icons/fa";

import ConsentManagement from "../components/ConsentManagement";
import Customization from "./Customization";
import ModifyBanner from "./ModifyBanner";

const TemplateLibrary = () => {
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem("templateLibrary.activeTab");
    return savedTab || "customization";
  });

  useEffect(() => {
    localStorage.setItem("templateLibrary.activeTab", activeTab);
  }, [activeTab]);

  const tabItems = [
    {
      id: "customization",
      label: "Create Banner",
      description: "Build a consent banner and preview edits in real time.",
      icon: <FaPlus />,
    },
    {
      id: "templates",
      label: "View Templates",
      description: "Browse existing templates and generate deployment script.",
      icon: <FaEye />,
    },
    {
      id: "modify",
      label: "Modify Banner",
      description: "Update categories, subcategories, and consent behavior.",
      icon: <FaEdit />,
    },
  ];

  const activeTabItem = tabItems.find((item) => item.id === activeTab);

  const renderTabContent = () => {
    switch (activeTab) {
      case "templates":
        return <ConsentManagement />;
      case "customization":
        return <Customization />;
      case "modify":
        return <ModifyBanner />;
      default:
        return null;
    }
  };

  return (
    <div className="template-library-container enterprise-page">
      <div className="template-library-header enterprise-page-header">
        <h1 className="enterprise-page-title">Template Library</h1>
        <p className="subtitle enterprise-page-subtitle">
          Manage banner creation, template viewing, and modification workflows from a unified workspace.
        </p>
        <div className="template-library-meta">
          <span className="template-library-meta-pill">3 Workspace Modes</span>
          <span className="template-library-meta-pill">Live Preview Ready</span>
          <span className="template-library-meta-pill">No Flow Changes</span>
        </div>
      </div>

      <div className="template-library-tabs" role="tablist" aria-label="Template library workspace modes">
        {tabItems.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
            title={tab.description}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`template-library-panel-${tab.id}`}
            id={`template-library-tab-${tab.id}`}
          >
            <span className="tab-button-icon">{tab.icon}</span>
            <span className="tab-button-copy">
              <strong>{tab.label}</strong>
              <small>{tab.description}</small>
            </span>
          </button>
        ))}
      </div>

      <div className="template-library-active-tab-note enterprise-panel">
        <h2>{activeTabItem?.label}</h2>
        <p>{activeTabItem?.description}</p>
      </div>

      <div
        className="tab-content"
        role="tabpanel"
        id={`template-library-panel-${activeTab}`}
        aria-labelledby={`template-library-tab-${activeTab}`}
      >
        <div className="template-library-tab-content-inner" key={activeTab}>
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default TemplateLibrary;
