import React from "react";
import { useEffect, useState } from "react";
import "../styles/Report.css";
import ConsentTrends from "../components/ConsentTrends";
import { fetchReportsAnalytics } from "../services/analyticsService";

const Report = () => {
  const [reportData, setReportData] = useState({ monthlyTrend: [], templateBreakdown: [], totals: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReportData = async () => {
      try {
        const data = await fetchReportsAnalytics();
        setReportData(data);
      } catch (error) {
        console.error("Failed to load report analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    loadReportData();
  }, []);

  return (
    <div className="report-container enterprise-page">
      <div className="enterprise-page-header">
        <h1 className="enterprise-page-title">Reports & Analytics</h1>
        <p className="enterprise-page-subtitle">Review trend analysis, performance metrics, and consent insights.</p>
      </div>
      <ConsentTrends
        data={reportData.monthlyTrend}
        templateBreakdown={reportData.templateBreakdown}
        totals={reportData.totals}
        loading={loading}
      />
    </div>
  );
};

export default Report;
