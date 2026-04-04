import React, { useEffect, useState } from "react";
import "../styles/Dashboard.css"; // Use common styles
import UserGrid from "../components/UserTile";
import ConsentOverview from "../components/ConsentOverview";
import RecentActivity from "../components/RecentActivity";
import AnalyticsReports from "../components/AnalyticsReports";
import QuickActions from "../components/QuickActions";
import ComplianceStatus from "../components/ComplianceStatus";
import { fetchDashboardAnalytics } from "../services/analyticsService";

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [dailyTrend, setDailyTrend] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [compliance, setCompliance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await fetchDashboardAnalytics();

        const formattedUsers = data.users.map((user) => ({
          id: user.id,
          name: user.username,
          role: user.role_name,
        }));

        setUsers(formattedUsers);
        setSummary(data.summary);
        setDailyTrend(data.dailyTrend);
        setRecentActivities(data.recentActivities);
        setCompliance(data.compliance);
      } catch (err) {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  return (
    <div className="dashboard-container enterprise-page">
      <div className="dashboard-content">
        <div className="enterprise-page-header">
          <h1 className="enterprise-page-title">Dashboard Overview</h1>
          <p className="enterprise-page-subtitle">Track consent operations, compliance health, and user activity in one place.</p>
        </div>

        <div className="dashboard-grid">
          <ConsentOverview summary={summary} loading={loading} />
          <AnalyticsReports trendData={dailyTrend} loading={loading} />
          <RecentActivity activities={recentActivities} loading={loading} />
          <ComplianceStatus compliance={compliance} summary={summary} loading={loading} />
          {/* <QuickActions /> */}
        </div>

        <div className="dashboard-status">
          {loading && <p className="dashboard-loading">Loading users...</p>}
          {error && <p className="dashboard-error">{error}</p>}
        </div>
        {!loading && !error && <UserGrid users={users} />}
      </div>
    </div>
  );
};

export default Dashboard;
