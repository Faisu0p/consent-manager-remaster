import React, {useState, useEffect} from "react";
import { CalendarDays, Download, Filter, RotateCcw, Search, UserRound, X } from "lucide-react";
import consentService from "../services/consentService";
import "../styles/ViewConsents.css";

const ViewConsent = () => {

  // State for storing consents
  const [consents, setConsents] = useState([]);

  // State for search bar and filter dropdown
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [emailSearch, setEmailSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [templateFilter, setTemplateFilter] = useState("");
  const [templateNames, setTemplateNames] = useState([]);



  // State for selected consent and modal
  const [selectedConsent, setSelectedConsent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch consents from the server
  useEffect(() => {
    const fetchConsents = async () => {
      try {
        const data = await consentService.getConsents();
        console.log("Fetched Consents:", data); // Log the API response
        setConsents(data);
        setTemplateNames([...new Set(data.map(item => item.template_name).filter(Boolean))]);
      } catch (error) {
        console.error("Failed to fetch consents:", error);
      }
    };
  
    fetchConsents();
  }, []);  
  

  // Event handlers for search bar and filter dropdown
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const filteredConsents = consents.filter(row => {
    const consentDate = new Date(row.consent_date); // Assuming 'consent_date' is the date field
  
    return (
      (searchTerm === "" || 
        (row.user_id && row.user_id.toString().includes(searchTerm)) || 
        (row.category_names && row.category_names.toLowerCase().includes(searchTerm.toLowerCase()))
      ) &&
      (emailSearch === "" || (row.user_email && row.user_email.toLowerCase().includes(emailSearch.toLowerCase()))) &&
      (statusFilter === "" || row.consent_status === (statusFilter === "accepted")) &&
      (startDate === "" || consentDate >= new Date(startDate)) &&
      (endDate === "" || consentDate <= new Date(endDate)) &&
      (templateFilter === "" || row.template_name === templateFilter)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredConsents.length / itemsPerPage));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, emailSearch, startDate, endDate, templateFilter]);

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setEmailSearch("");
    setStartDate("");
    setEndDate("");
    setTemplateFilter("");
  };
  


  // Filtering logic for view consents
  const openModal = async (consent) => {
    console.log("Fetching fresh consent data for user:", consent.user_id);
  
    try {
      const updatedConsents = await consentService.getUserConsents(consent.user_id);
      console.log("Fetched user consents:", updatedConsents);
  
      const updatedConsent = updatedConsents.find(c => c.consent_id === consent.consent_id) || consent;
      console.log("Updated consent to be set:", updatedConsent);
  
      setSelectedConsent({
        ...updatedConsent,
        category_names: (updatedConsent.categories || []).map(cat => cat.category_name).join(", "),
        subcategory_names: (updatedConsent.categories || [])
          .flatMap(cat => (cat.subcategories || []).map(sub => sub.subcategory_name))
          .join(", "),
        partner_names: (updatedConsent.partners || []).map(partner => partner.partner_name).join(", "),
      });
  
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching user consents:", error);
      alert("Failed to fetch the latest consent data.");
    }
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedConsent(null);
  };
  

  // Filtering and pagination logic
  const exportToCSV = () => {
    const csvContent = [
      ["Consent ID", "User ID", "Template", "Category", "Status", "Consent Date"],
      ...consents.map((c, index) => [
        index + 1, // Sequential ID instead of consent_id
        c.user_id, 
        c.template_name || "-",
        `"${c.category_names}"`, // Wrap in quotes to avoid issues with commas
        c.consent_status ? "Accepted" : "Rejected",
        new Date(c.consent_date).toLocaleDateString("en-GB") // Format date
      ])
    ].map(e => e.join(",")).join("\n");
  
    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "consents.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const exportToJSON = () => {
    const formattedData = consents.map((c, index) => ({
      "Consent ID": index + 1, // Sequential ID
      "User ID": c.user_id,
      "Template": c.template_name || "-",
      "Category": c.category_names,
      "Status": c.consent_status ? "Accepted" : "Rejected", // Fix status key
      "Consent Date": new Date(c.consent_date).toLocaleDateString("en-GB") // Match displayed format
    }));
  
    const jsonStr = JSON.stringify(formattedData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "consents.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
   
  

  return (
    <div className="view-consent-container enterprise-page">
      <div className="enterprise-page-header">
        <h1 className="view-consent-title enterprise-page-title">View Consents</h1>
        <p className="enterprise-page-subtitle">Search, filter, inspect, and export user consent records with complete visibility.</p>
      </div>

      <div className="view-consent-summary-cards">
        <div className="view-consent-summary-card">
          <span>Total Records</span>
          <strong>{consents.length}</strong>
        </div>
        <div className="view-consent-summary-card">
          <span>Filtered Records</span>
          <strong>{filteredConsents.length}</strong>
        </div>
        <div className="view-consent-summary-card">
          <span>Accepted</span>
          <strong>{filteredConsents.filter((item) => item.consent_status).length}</strong>
        </div>
        <div className="view-consent-summary-card">
          <span>Rejected</span>
          <strong>{filteredConsents.filter((item) => !item.consent_status).length}</strong>
        </div>
      </div>

      {/*Search and filter bar*/}
      <div className="view-consent-toolbar enterprise-panel">
        <div className="view-consent-toolbar-header">
          <h2><Filter size={16} /> Filters</h2>
          <button className="view-consent-reset-btn" onClick={resetFilters}><RotateCcw size={14} /> Reset</button>
        </div>

        <div className="view-consent-filter">

          <select
            value={templateFilter}
            onChange={(e) => setTemplateFilter(e.target.value)}
            className="view-consent-dropdown"
          >
            <option value="">All Templates</option>
            {templateNames.map((name, idx) => (
              <option key={idx} value={name}>
                {name}
              </option>
            ))}
          </select>

          <div className="view-consent-search-group">
            <Search size={14} />
            <input
              type="text"
              placeholder="Search by Email"
              value={emailSearch}
              onChange={(e) => setEmailSearch(e.target.value)}
              className="view-consent-search"
            />
          </div>

          <div className="view-consent-search-group">
            <Search size={14} />
            <input
              type="text"
              placeholder="Search by User ID or Category Name"
              value={searchTerm}
              onChange={handleSearchChange}
              className="view-consent-search"
            />
          </div>
        
          <select value={statusFilter} onChange={handleStatusChange} className="view-consent-dropdown">
            <option value="">All Statuses</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="view-consent-date-filter"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="view-consent-date-filter"
          />

        </div>
      </div>


      {/* Export Options */}
      <div className="view-consent-export">
        <button className="view-consent-export-btn" onClick={exportToCSV}><Download size={14} /> Export CSV</button>
        <button className="view-consent-export-btn" onClick={exportToJSON}><Download size={14} /> Export JSON</button>
      </div>


      {/*Table for displaying consents*/}
      <div className="view-consent-table-wrapper enterprise-panel">
        <table className="view-consent-table">
          <thead>
            <tr>
              <th>Consent ID</th>
              <th>User ID</th>
              <th>Template Name</th>
              <th>Categories</th>
              <th>Consent Status</th>
              <th>Consent Date</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredConsents.length > 0 ? (
              filteredConsents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((row, index) => (
                <tr key={row.id || `consent-${index}`}>
                  <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td>{row.user_id}</td>
                  <td>{row.template_name || "N/A"}</td>
                  <td>{row.category_names}</td>
                  <td>
                    <span className={`view-consent-status-badge ${row.consent_status ? "accepted" : "rejected"}`}>
                      {row.consent_status ? "Accepted" : "Rejected"}
                    </span>
                  </td>
                  <td>{new Date(row.consent_date).toLocaleDateString("en-GB")}</td>
                  <td>
                    <div className="view-consent-actions-cell">
                      <button className="view-consent-btn view-consent-view-btn" onClick={() => openModal(row)}>View</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="view-consent-empty">No consents found for the selected filters.</td>
              </tr>
            )}
          </tbody>

        </table>
      </div>


      {/*Modal for viewing consent details*/}
      {isModalOpen && selectedConsent && (
        <div className="view-consent-modal" onClick={closeModal}>
          <div className="view-consent-modal-content" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Consent details dialog">
            <button className="view-consent-close-icon" onClick={closeModal} aria-label="Close dialog">
              <X size={16} />
            </button>

            <div className="view-consent-modal-header">
              <h2>Consent Details</h2>
              <span className={`view-consent-status-badge ${selectedConsent.consent_status ? "accepted" : "rejected"}`}>
                {selectedConsent.consent_status ? "Accepted" : "Rejected"}
              </span>
            </div>

            <div className="view-consent-modal-meta">
              <div className="view-consent-meta-item">
                <UserRound size={14} />
                <span>Consent #{selectedConsent.consent_id}</span>
              </div>
              <div className="view-consent-meta-item">
                <CalendarDays size={14} />
                <span>
                  {new Date(selectedConsent.consent_date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            <div className="view-consent-modal-grid">
              <div className="view-consent-detail-card">
                <h3>Identity</h3>
                <p><strong>User ID:</strong> {selectedConsent.user_id}</p>
                <p><strong>Email:</strong> {selectedConsent.user_email || "-"}</p>
                <p><strong>Template:</strong> {selectedConsent.template_name || "-"}</p>
              </div>

              <div className="view-consent-detail-card">
                <h3>Partners</h3>
                <p>{selectedConsent.partner_names || "No partners selected"}</p>
              </div>
            </div>

            <div className="view-consent-categories-card">
              <h3>Categories and Subcategories</h3>
              {(selectedConsent.categories || []).length === 0 ? (
                <p className="view-consent-no-items">No categories available for this consent.</p>
              ) : (
                <div className="view-consent-category-list">
                  {(selectedConsent.categories || []).map((category) => (
                    <div key={category.category_id} className="view-consent-category-item">
                      <strong>{category.category_name}</strong>
                      {category.subcategories && category.subcategories.length > 0 ? (
                        <div className="view-consent-subcategory-list">
                          {category.subcategories.map((sub) => (
                            <span key={sub.subcategory_id} className="view-consent-subcategory-chip">
                              {sub.subcategory_name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="view-consent-no-items">No subcategories.</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="view-consent-modal-actions">
              <button className="view-consent-close-btn" onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}


      {/* Pagination Controls */}
      <div className="view-consent-pagination">
        <button 
          className="view-consent-page-btn" 
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button 
          className="view-consent-page-btn" 
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>


    </div>
  );
};

export default ViewConsent;