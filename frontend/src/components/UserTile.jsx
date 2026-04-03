import React from "react";
import Avatar from "react-avatar";
import { FaUserShield, FaUser, FaUsers, FaHeadset, FaBriefcase, FaTools } from "react-icons/fa";
import "../styles/UserTile.css"; // Import the CSS file

const roleIcons = {
  Admin: <FaUserShield className="user-tiles-role-icon user-tiles-admin" />,
  "Customer Support": <FaHeadset className="user-tiles-role-icon user-tiles-customer-support" />,
  Executive: <FaBriefcase className="user-tiles-role-icon user-tiles-executive" />,
  "IT Manager": <FaTools className="user-tiles-role-icon user-tiles-it-manager" />,
  Operator: <FaUsers className="user-tiles-role-icon user-tiles-operator" />,
};

const UserTile = ({ user }) => {
  return (
    <div className="user-tiles-card">
      <Avatar name={user.name} size="50" round={true} />
      <div className="user-tiles-info">
        <h3>{user.name}</h3>
        <p className="user-tiles-role">
          {roleIcons[user.role] || <FaUser className="user-tiles-role-icon" />} {user.role}
        </p>
      </div>
    </div>
  );
};

const UserGrid = ({ users }) => {
  return (
    <div className="user-tiles-grid">
      {users.map((user) => (
        <UserTile key={user.id} user={user} />
      ))}
    </div>
  );
};

export default UserGrid;
