import React, {useState, useEffect} from "react";
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
  const totalPages = Math.ceil(consents.length / itemsPerPage);

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
    <div className="view-consent-container">
      <h1 className="view-consent-title">Hello, World! This is View Consent Page</h1>

      {/*Search and filter bar*/}
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

        <input
          type="text"
          placeholder="Search by Email"
          value={emailSearch}
          onChange={(e) => setEmailSearch(e.target.value)}
          className="view-consent-search"
        />

        <input
          type="text"
          placeholder="Search by User ID or Category Name"
          value={searchTerm}
          onChange={handleSearchChange}
          className="view-consent-search"
        />
        
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


      {/* Export Options */}
      <div className="view-consent-export">
        <button className="view-consent-export-btn" onClick={exportToCSV}>Export CSV</button>
        <button className="view-consent-export-btn" onClick={exportToJSON}>Export JSON</button>
      </div>


      {/*Table for displaying consents*/}
      <table className="view-consent-table">
        <thead>
          <tr>
            <th>Consent ID</th>
            <th>User ID</th>
            <th>Template Name</th>
            <th>Categories</th>
            <th>Consent Given</th>
            <th>Consent Date</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredConsents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((row, index) => (
            <tr key={row.id || `consent-${index}`}>
              <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
              <td>{row.user_id}</td>
              <td>{row.template_name || "N/A"}</td>
              <td>{row.category_names}</td>
              <td>{row.consent_status ? "✅" : "❌"}</td>
              <td>{new Date(row.consent_date).toLocaleDateString("en-GB")}</td>
              <td>
                <button className="view-consent-btn">Modify</button>
                <button className="view-consent-btn view-consent-view-btn" onClick={() => openModal(row)}>View</button>
              </td>
            </tr>
          ))}
        </tbody>

      </table>


      {/*Modal for viewing consent details*/}
      {isModalOpen && selectedConsent && (
        <div className="view-consent-modal">
          <div className="view-consent-modal-content">
            <span className="view-consent-close" onClick={closeModal}>&times;</span>
            <h2>Consent Details</h2>
            <p><strong>Consent ID:</strong> {selectedConsent.consent_id}</p>
            <p><strong>User ID:</strong> {selectedConsent.user_id}</p>
            <p><strong>User Email:</strong> {selectedConsent.user_email}</p>
            <p><strong>Template:</strong> {selectedConsent.template_name}</p>
            <p><strong>Categories & Subcategories:</strong></p>
            <ul>
              {(selectedConsent.categories || []).map((category) => (
                <li key={category.category_id}>
                  <strong>{category.category_name}</strong>
                  {category.subcategories && category.subcategories.length > 0 ? (
                    <ul>
                      {category.subcategories.map((sub) => (
                        <li key={sub.subcategory_id}>{sub.subcategory_name}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>- No subcategories -</p>
                  )}
                </li>
              ))}
            </ul>
            <p><strong>Partners:</strong> {selectedConsent.partner_names || "-"}</p>
            <p><strong>Status:</strong> {selectedConsent.consent_status ? "✅ Accepted" : "❌ Rejected"}</p>
            <p><strong>Consent Date:</strong> {new Date(selectedConsent.consent_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <button className="view-consent-close-btn" onClick={closeModal}>Close</button>
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