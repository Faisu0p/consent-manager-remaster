import React from "react";
import "../styles/Report.css";
import ConsentTrends from "../components/ConsentTrends";

const Report = () => {
  return (
    <div className="report-container enterprise-page">
      <div className="enterprise-page-header">
        <h1 className="enterprise-page-title">Reports & Analytics</h1>
        <p className="enterprise-page-subtitle">Review trend analysis, performance metrics, and consent insights.</p>
      </div>
      <ConsentTrends />
    </div>
  );
};

export default Report;
