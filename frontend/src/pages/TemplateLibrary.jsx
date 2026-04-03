import React, { useState } from "react";
import "../styles/TemplateLibrary.css";
import { FaEye, FaPlus, FaEdit } from "react-icons/fa";

import ConsentManagement from "../components/ConsentManagement";
import Customization from "./Customization";
import ModifyBanner from "./ModifyBanner";

const TemplateLibrary = () => {
  const [activeTab, setActiveTab] = useState("customization");

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
    <div className="template-library-container">
      <div className="template-library-header">
        <h1>Template Library</h1>
        <p className="subtitle">
          Manage your templates, customize banners, and preview configurations — all in one place.
        </p>
        <p className="subtitle">_________________________________________________________________________________________________________________________________________________________________________________________</p>
      </div>

      <div className="template-library-tabs">

      <button
          className={`tab-button ${activeTab === "customization" ? "active" : ""}`}
          onClick={() => setActiveTab("customization")}
          title="Create a new banner by selecting a template"
        >
          <FaPlus /> Create Banner
        </button>
        <button
          className={`tab-button ${activeTab === "templates" ? "active" : ""}`}
          onClick={() => setActiveTab("templates")}
          title="Browse and view all available templates"
        >
          <FaEye /> View Templates
        </button>
        <button
          className={`tab-button ${activeTab === "modify" ? "active" : ""}`}
          onClick={() => setActiveTab("modify")}
          title="Edit an existing banner to update its settings"
        >
          <FaEdit /> Modify Banner
        </button>
      </div>

      <div className="tab-content">{renderTabContent()}</div>
    </div>
  );
};

export default TemplateLibrary;
