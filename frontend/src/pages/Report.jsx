import React from "react";
import "../styles/Report.css";
import ConsentTrends from "../components/ConsentTrends";

const Report = () => {
  return (
    <div className="report-container">
      <h1>Welcome to Report & Analytics</h1>
      <ConsentTrends />
    </div>
  );
};

export default Report;
