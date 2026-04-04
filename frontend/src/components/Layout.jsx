import { useEffect, useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import "../styles/Layout.css";

const Layout = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const closeSidebarOnMobile = () => {
    if (isMobile) {
      setIsCollapsed(true);
    }
  };

  const showMobileOverlay = isMobile && !isCollapsed;

  return (
    <div className="layout-component">
      <Header />
      <div className="layout-component-main">
        <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
        {showMobileOverlay && (
          <button
            className="layout-component-overlay"
            onClick={closeSidebarOnMobile}
            aria-label="Close sidebar"
          ></button>
        )}
        <main className={`layout-component-content ${isCollapsed ? "collapsed" : ""}`}>
          <div className="layout-component-content-inner">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
