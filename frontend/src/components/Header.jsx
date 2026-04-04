import { Search, Bell, UserCircle2, Rocket, Settings } from "lucide-react";
import "../styles/Header.css";

const Header = () => {
  return (
    <header className="header-component">
      <div className="header-component-logo">
        <div className="header-component-brand-mark">
          <Rocket size={20} className="header-component-logo-icon" />
        </div>
        <div className="header-component-brand-copy">
          <span className="header-component-app-name">KONSENTO</span>
          <span className="header-component-app-tagline">Consent manager</span>
        </div>
      </div>

      <div className="header-component-search" role="search">
        <Search size={16} className="header-component-search-icon" />
        <input
          type="text"
          className="header-component-search-input"
          placeholder="Search users, templates, reports"
          aria-label="Search"
        />
      </div>

      <div className="header-component-icons">
        <button className="header-component-action-btn" aria-label="Notifications">
          <Bell size={18} className="header-component-icon" />
          <span className="header-component-notification-dot"></span>
        </button>

        <button className="header-component-action-btn" aria-label="Settings">
          <Settings size={18} className="header-component-icon" />
        </button>

        <button className="header-component-profile" aria-label="User profile">
          <UserCircle2 size={18} className="header-component-profile-icon" />
          <span className="header-component-profile-name">Admin</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
