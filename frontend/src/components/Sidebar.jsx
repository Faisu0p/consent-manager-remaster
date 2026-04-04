import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiUsers, FiSettings, FiLogOut, FiBarChart, FiClipboard, FiShield, FiHome, FiHeadphones, FiLayers } from "react-icons/fi";

import { logout } from "../services/authService";

import "../styles/Sidebar.css";

const SidebarComponent = ({ isCollapsed, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const primaryMenu = [
    { label: "Dashboard", path: "/dashboard", icon: <FiHome size={18} /> },
    { label: "Template Library", path: "/template-library", icon: <FiLayers size={18} /> },
    { label: "Users", path: "/users", icon: <FiUsers size={18} /> },
    { label: "Audit Logs", path: "/audit-logs", icon: <FiClipboard size={18} /> },
    { label: "Reports & Analytics", path: "/reports", icon: <FiBarChart size={18} /> },
    { label: "View Consents", path: "/view-consents", icon: <FiShield size={18} /> },
    { label: "Customer Support", path: "/customer-support", icon: <FiHeadphones size={18} /> },
  ];

  const isRouteActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className={`sidebar-component ${isCollapsed ? "collapsed" : ""}`}>
      <Sidebar collapsed={isCollapsed} className="sidebar-wrapper">
        <div className="sidebar-top-panel">
          <span className="sidebar-workspace">Workspace</span>
          <h3 className="sidebar-heading">Operations</h3>
        </div>

        <div className="sidebar-content">
          <Menu>
            {primaryMenu.map((item) => (
              <MenuItem
                key={item.path}
                icon={item.icon}
                component={<Link to={item.path} />}
                className={isRouteActive(item.path) ? "sidebar-menu-item-active" : ""}
                active={isRouteActive(item.path)}
              >
                {item.label}
              </MenuItem>
            ))}
          </Menu>
        </div>

        <div className="sidebar-bottom-section">
          <Menu>
            <MenuItem
              icon={<FiSettings size={18} />}
              component={<Link to="/settings" />}
              className={isRouteActive("/settings") ? "sidebar-menu-item-active" : ""}
              active={isRouteActive("/settings")}
            >
              Settings
            </MenuItem>
            <MenuItem icon={<FiLogOut size={18} />} onClick={handleLogout}>Logout</MenuItem>
          </Menu>
          <span className="sidebar-version">KONSENTO v1.0</span>
        </div>
      </Sidebar>

      <button
        className="sidebar-component-toggle-btn"
        onClick={toggleSidebar}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? "☰" : "✖"}
      </button>
    </div>
  );
};

export default SidebarComponent;