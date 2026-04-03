import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TemplateLibrary from "./pages/TemplateLibrary";
import User from "./pages/User";
import Audit from "./pages/Audit";
import Customization from "./pages/Customization";
import Report from "./pages/Report";
import Settings from "./pages/Settings";
import ViewConsents from "./pages/ViewConsents";
import MyConsent from "./pages/MyConsent";
import ModifyBanner from "./pages/ModifyBanner";
import CustomerSupport from "./pages/CustomerSupport";


function App() {
  return (
    <Routes>
      {/* Login page without Layout */}
      <Route path="/" element={<Login />} />

      {/* Protected pages wrapped in Layout */}
      <Route path="/" element={<Layout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<User />} />
        <Route path="template-library" element={<TemplateLibrary />} />
        <Route path="audit-logs" element={<Audit />} />
        <Route path="customization" element={<Customization />} />
        <Route path="reports" element={<Report />} />
        <Route path="settings" element={<Settings />} />
        <Route path="view-consents" element={<ViewConsents />} />
        <Route path="modify-banner" element={<ModifyBanner />} />
        <Route path="customer-support" element={<CustomerSupport />} />
      </Route>

      <Route path="my-consent" element={<MyConsent />} />

    </Routes>
  );
}

export default App;
