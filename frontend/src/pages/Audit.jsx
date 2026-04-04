import React from "react";
import "../styles/Audit.css";
import AccessLogsTable from "../components/AccessLogsTable";

const Audit = () => {
  return (
    <div className="audit-container enterprise-page">
      <div className="enterprise-page-header">
        <h1 className="enterprise-page-title">Audit Logs</h1>
        <p className="enterprise-page-subtitle">Monitor immutable activity records across consent and user-management workflows.</p>
      </div>

      <section className="audit-section enterprise-panel">
        <h2 className="audit-section-title">Access Log Timeline</h2>
        <p className="audit-section-subtitle">Review account-level actions and system access events with pagination support.</p>
        <AccessLogsTable />
      </section>
    </div>
  );
};

export default Audit;
