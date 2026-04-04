import React from "react";
import "../styles/User.css";
import UserManagement from "../components/UserManagement";

const User = () => {
  return (
    <div className="user-container enterprise-page">
      <div className="enterprise-page-header">
        <h1 className="enterprise-page-title">Users</h1>
        <p className="enterprise-page-subtitle">
          Manage platform users, roles, and account lifecycle from a centralized admin workspace.
        </p>
      </div>

      <div className="user-container-section">
        <h2 className="section-title">User Directory</h2>
        <UserManagement />
      </div>
    </div>
  );
};

export default User;