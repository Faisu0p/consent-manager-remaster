import React, { useEffect, useState } from "react";
import "../styles/Dashboard.css"; // Use common styles
import UserGrid from "../components/UserTile";
import { getAllUsers } from "../services/userServices";
import ConsentOverview from "../components/ConsentOverview";
import RecentActivity from "../components/RecentActivity";
import AnalyticsReports from "../components/AnalyticsReports";
import QuickActions from "../components/QuickActions";
import ComplianceStatus from "../components/ComplianceStatus";

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers();

        // Map API response to match expected format
        const formattedUsers = data.map((user) => ({
          id: user.id,
          name: user.username,
          role: user.role_name,
        }));

        setUsers(formattedUsers);
      } catch (err) {
        setError("Failed to load users.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <h1>Welcome to the KONSENTO Dashboard</h1>

_____________________________________________________________________________________________________________________________________________________________________________________________

        <div className="dashboard-grid">
          <ConsentOverview />
          <AnalyticsReports />
          <RecentActivity />
          <ComplianceStatus />
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
