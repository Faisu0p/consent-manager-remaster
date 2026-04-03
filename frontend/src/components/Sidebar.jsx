import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Link, useNavigate } from "react-router-dom";
import { FiUsers, FiSettings, FiLogOut, FiBarChart, FiClipboard, FiSliders, FiEdit3, FiShield, FiHome, FiUserCheck, FiHeadphones, FiLayers } from "react-icons/fi";

import { logout } from "../services/authService";

import "../styles/Sidebar.css";

const SidebarComponent = ({ isCollapsed, toggleSidebar }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className={`sidebar-component ${isCollapsed ? "collapsed" : ""}`}>
      <Sidebar collapsed={isCollapsed} className="sidebar-wrapper">
        <div className="sidebar-content">
          <Menu>
            <MenuItem icon={<FiHome size={18} />} component={<Link to="/dashboard" />}>Dashboard</MenuItem>
            <MenuItem icon={<FiLayers size={18} />} component={<Link to="/template-library" />}>Template Library</MenuItem>
            <MenuItem icon={<FiUsers size={18} />} component={<Link to="/users" />}>Users</MenuItem>
            <MenuItem icon={<FiClipboard size={18} />} component={<Link to="/audit-logs" />}>Audit Logs</MenuItem>
            {/* <MenuItem icon={<FiSliders size={18} />} component={<Link to="/customization" />}>Customization</MenuItem> */}
            {/* <MenuItem icon={<FiEdit3 size={18} />} component={<Link to="/modify-banner" />}>Modify Banner</MenuItem> */}
            <MenuItem icon={<FiBarChart size={18} />} component={<Link to="/reports" />}>Reports & Analytics</MenuItem>
            <MenuItem icon={<FiShield size={18} />} component={<Link to="/view-consents" />}>View Consents</MenuItem>
            <MenuItem icon={<FiHeadphones size={18} />} component={<Link to="/customer-support" />}>Customer Support</MenuItem>
          </Menu>
        </div>

        <div className="sidebar-bottom-section">
          <Menu>
            <MenuItem icon={<FiSettings size={18} />} component={<Link to="/settings" />}>Settings</MenuItem>
            <MenuItem icon={<FiLogOut size={18} />} onClick={handleLogout}>Logout</MenuItem>
          </Menu>
          <span className="sidebar-version">KONSENTO v1.0</span>
        </div>
      </Sidebar>

      <button className="sidebar-component-toggle-btn" onClick={toggleSidebar}>
        {isCollapsed ? "☰" : "✖"}
      </button>
    </div>
  );
};

export default SidebarComponent;