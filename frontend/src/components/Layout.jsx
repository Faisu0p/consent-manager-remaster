import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import "../styles/Layout.css";

const Layout = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div className="layout-component">
      <Header />
      <div className="layout-component-main">
        <Sidebar isCollapsed={isCollapsed} toggleSidebar={() => setIsCollapsed(!isCollapsed)} />
        <main className={`layout-component-content ${isCollapsed ? "collapsed" : ""}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
