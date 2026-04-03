import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import consentService from "../services/consentService";
import dsrService from "../services/dsrService";
import "../styles/MyConsent.css";

const MyConsent = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);
  
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const userIdFromUrl = queryParams.get("userId");

  const [consentGiven, setConsentGiven] = useState("Yes");

  const [consentHistory, setConsentHistory] = useState([]);


  // State for DSR form and requests
  const [showDsrForm, setShowDsrForm] = useState(false);
  const [dsrType, setDsrType] = useState("");
  const [piiData, setPiiData] = useState([]);
  const [dsrRequests, setDsrRequests] = useState([]);
  const [requestStatus, setRequestStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dsrReason, setDsrReason] = useState("");



  useEffect(() => {
    if (userIdFromUrl) {
      setUserId(userIdFromUrl);
    }
  }, [userIdFromUrl]);

  useEffect(() => {
    const fetchConsentDetails = async () => {
      if (userId) {
        try {

          // Add a delay of 3 seconds (3000 milliseconds)
          await new Promise(resolve => setTimeout(resolve, 3000));

          const consentDetails = await consentService.getAllConsentDetails(userId);
          console.log("Consent Details:", consentDetails);

          // Format userData from API response with default empty arrays for categories and subcategories
          const formattedData = {
            email: consentDetails.email[0]?.email || "Unknown Email",
            username: consentDetails.username[0]?.username || "Unknown Username",
            phoneNumber: consentDetails.phoneNumber[0]?.phone_number || "Not Specified",
            consentGiven: consentDetails.consentGiven[0]?.consent_given || "Not Specified", 
            templateName: consentDetails.templateName[0]?.template_name || "Default Template", 
            categories: consentDetails.categories || [], 
            subcategories: consentDetails.subcategories || [], 
            selectedCategories: consentDetails.selectedCategories || [], 
          };

          setUserData(formattedData); 
          setIsLoading(false); 
        } catch (error) {
          console.error("Error fetching consent details:", error);
          setIsLoading(false); 
        }
      }
    };

    fetchConsentDetails();
  }, [userId]);


  // Fetch DSR requests for the user
  useEffect(() => {
    const fetchDsrRequests = async () => {
      if (userId) {
        try {
          const dsrData = await dsrService.getAllDSRRequests();

          console.log("DSR Data:", dsrData);

          const userRequests = dsrData.filter(request => request.user_id.toString() === userId);
          
          const formattedRequests = userRequests.map(request => ({
            id: request.id,
            type: request.request_type,
            details: request.reason,
            admin_notes: request.admin_notes || "-",
            status: request.request_status || "Pending",
            createdAt: new Date(request.created_at).toLocaleString(),
            file_paths: request.file_paths || "-",
          }));
          
          setDsrRequests(formattedRequests);
        } catch (error) {
          console.error("Error fetching DSR requests:", error);
        }
      }
    };

    fetchDsrRequests();
  }, [userId]);


// 3. Add a new useEffect to fetch consent history
useEffect(() => {
  const fetchConsentHistory = async () => {
    if (userId) {
      try {
        const historyData = await consentService.getConsentHistoryGrouped(userId);
        console.log("Consent History:", historyData);
        setConsentHistory(historyData);
      } catch (error) {
        console.error("Error fetching consent history:", error);
      }
    }
  };

  fetchConsentHistory();
}, [userId]);



  if (isLoading) {
    return (
      <div className="myconsent-portal-loading-screen">
        <div className="myconsent-portal-spinner"></div>
        <p className="myconsent-portal-loading-text">Redirecting...</p>
      </div>
    );
  }

  if (!userData) {
    return <div>Error fetching data</div>;
  }

  const emailUsername = typeof userData.email === "string" ? userData.email.split("@")[0] : "Unknown";

  const isCategorySelected = (categoryId) => {
    return userData.selectedCategories.some(
      (selectedCategory) => selectedCategory.category_id === categoryId
    );
  };

  const toggleConsent = () => {
    const newConsent = consentGiven === "Yes" ? "No" : "Yes";
    setConsentGiven(newConsent);
  
    if (newConsent === "No") {
      setUserData({ ...userData, selectedCategories: [] });
    }
  
    console.log("Updated Consent Given:", newConsent);
  };



  // Function to handle DSR button click
  const handleDsrButtonClick = () => {
    setShowDsrForm(true);
    setDsrType("");
    setRequestStatus("");
  };

  // Function to handle DSR type selection
  const handleDsrTypeSelect = (type) => {
    setDsrType(type);
    setRequestStatus("");
    setDsrReason("");
    
    if (type === "Modify PII") {
      setPiiData([
        { id: 1, name: "Passport Number", selected: false },
        { id: 2, name: "Home Address", selected: false },
        { id: 3, name: "Phone Number", selected: false },
        { id: 4, name: "Date of Birth", selected: false },
        { id: 5, name: "National ID", selected: false }
      ]);
    }
  };

  // Function to toggle PII selection
  const togglePiiSelection = (id) => {
    setPiiData(piiData.map(item => 
      item.id === id ? { ...item, selected: !item.selected } : item
    ));
  };

  // Function to submit DSR request
  const submitDsrRequest = async () => {
    try {
      setIsSubmitting(true);
      
      let reason = dsrReason;
      
      if (dsrType === "Modify PII" && piiData.some(item => item.selected)) {
        const selectedPii = piiData.filter(item => item.selected).map(item => item.name);
        reason = `${reason ? reason + ". " : ""}Requested modification of: ${selectedPii.join(", ")}`;
      }
      
      const payload = {
        user_id: parseInt(userId),
        request_type: dsrType,
        reason: reason || `Request to ${dsrType}`
      };
      
      const response = await dsrService.createDSRRequest(payload);
      console.log("DSR Request created:", response);
      
      const newRequest = {
        id: response.data.id,
        type: dsrType,
        details: reason,
        status: "Pending",
        createdAt: new Date().toLocaleString()
      };
      
      setDsrRequests([...dsrRequests, newRequest]);
      setRequestStatus("Your request has been submitted and is pending review by our team.");
      
      // Reset form
      setShowDsrForm(false);
      setDsrType("");
      setDsrReason("");
    } catch (error) {
      console.error("Error submitting DSR request:", error);
      setRequestStatus("Failed to submit request. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };
  

  return (
    <div className="myconsent-portal-container">

      {/* Header */}
      <header className="myconsent-portal-header">
        <div className="myconsent-portal-header-content">
          <img src="https://www.consentmanager.net/en/wp-content/uploads/2020/12/RGB_Consentmanager-Bildmarke.jpg" alt="Logo" className="myconsent-portal-logo" />
          <div className="myconsent-portal-text">
            <h1 className="myconsent-portal-title">Consent Lifecycle Status</h1>
            <p className="myconsent-portal-subtitle">
              Track and manage your consent history, updates, and preferences. 
              Stay informed about how your data is being used and make changes as needed.
            </p>
          </div>
        </div>
      </header>


      {/* User Info */}
      <section className="myconsent-portal-user-info">
        <h2 className="myconsent-portal-section-title">🔍 Your Details</h2>
        <p className="myconsent-portal-info-item"><strong>User ID:</strong> {userId}</p>
        <p className="myconsent-portal-info-item"><strong>Username:</strong> {userData.username}</p>
        <p className="myconsent-portal-info-item"><strong>Email:</strong> {userData.email}</p>
        <p className="myconsent-portal-info-item"><strong>PhoneNumber:</strong> {userData.phoneNumber}</p>
      </section>


      {/* Consent History Table */}
      <section className="myconsent-portal-history">
        <h2 className="myconsent-portal-section-title">📜 Consent History</h2>
        <div className="myconsent-portal-table-container">
          <table className="myconsent-portal-history-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Date</th>
                {/* <th>Overall Consent</th> */}
                {userData.categories.map(category => (
                  <th key={category.category_id}>{category.category_name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Just displaying the current consent state since that's what we have */}
              <tr>
                <td>1</td>
                <td>{new Date().toLocaleDateString()}</td>
                {/* <td className={`myconsent-portal-consent-status-${userData.consentGiven.toLowerCase()}`}>
                  {userData.consentGiven === "Yes" ? "✅" : "❌"}
                </td> */}
                {userData.categories.map(category => (
                  <td key={category.category_id}>
                    {isCategorySelected(category.category_id) ? "✅" : "❌"}
                  </td>
                ))}
              </tr>
              
{/* Historical consent changes */}
{consentHistory.map((history, index) => {
  const categoryIds = history["Category IDs"].split(", ").map(id => Number(id));
  const actions = history["Actions"].split(", ");
  
  // Create a map of category actions for this history entry
  const categoryActionMap = {};
  categoryIds.forEach((catId, i) => {
    // For each category, store the latest action (in case of multiple actions on same category)
    categoryActionMap[catId] = actions[i];
  });
  
  return (
    <tr key={`history-${index}`}>
      <td>{Number(history["S.No"]) + 1}</td>
      <td>{new Date(history["Date"]).toLocaleDateString()}</td>
      {userData.categories.map(category => {
        // Check if this category was affected in this history entry
        const actionForCategory = categoryActionMap[category.category_id];
        
        return (
          <td key={category.category_id}>
            {actionForCategory === "update" ? "✅" : 
             actionForCategory === "delete" ? "❌" : 
             "❌"}
          </td>
        );
      })}
    </tr>
  );
})}

            </tbody>
          </table>
        </div>
      </section>



      {/* Greeting */}
      <section className="myconsent-portal-greeting">
        <h2 className="myconsent-portal-greeting-text">Hello, {emailUsername}! 👋</h2>
      </section>

      {/* Overall Consent Status */}
      <section className={`myconsent-portal-status myconsent-portal-status-${userData.consentGiven.toLowerCase()}`}>
        <h2 className="myconsent-portal-status-title">📊 Overall Consent Status</h2>
        <p className="myconsent-portal-status-value">{userData.consentGiven == "Yes" ? "Accepted ✅" : "Rejected ❌"}</p>

        <label className="myconsent-portal-switch">
          <input 
            type="checkbox" 
            checked={consentGiven === "Yes"} 
            onChange={toggleConsent} 
          />
          <span className="myconsent-portal-slider round"></span>
        </label>

      </section>

      {/* Consent Categories */}
      <section className="myconsent-portal-categories">
        <h2 className="myconsent-portal-categories-title">Your Consent Preferences</h2>
        <div className="myconsent-portal-category-grid">
          {userData.categories.length > 0 ? (
            userData.categories.map((category) => (
              <div key={category.category_id} className="myconsent-portal-category-card">
                <h3 className="myconsent-portal-category-name">{category.category_name}</h3>
                <p className="myconsent-portal-category-status">
                  <strong>Required:</strong> {category.is_required ? "✅ Yes" : "❌ No"}
                </p>
                <p className="myconsent-portal-category-acceptance">
                  <strong>Acceptance Status:</strong> {isCategorySelected(category.category_id) ? "Accepted ✅" : "Rejected ❌"}
                </p>
                <p className="myconsent-portal-category-description">
                  <strong>Description:</strong> {category.category_description}
                </p>

                <ul className="myconsent-portal-subcategory-list">
                  {userData.subcategories
                    .filter((sub) => sub.category_id === category.category_id)
                    .map((sub) => (
                      <li key={sub.subcategory_id} className="myconsent-portal-subcategory-item">
                        <strong>{sub.subcategory_name}</strong> - {sub.subcategory_description}
                      </li>
                    ))}
                </ul>

                <label className="myconsent-portal-switch">
                  <input 
                    type="checkbox" 
                    checked={isCategorySelected(category.category_id)} 
                    onChange={() => {
                      const updatedCategories = isCategorySelected(category.category_id)
                        ? userData.selectedCategories.filter((c) => c.category_id !== category.category_id)
                        : [...userData.selectedCategories, { category_id: category.category_id }];
                      setUserData({ ...userData, selectedCategories: updatedCategories });
                      console.log("Updated Selected Categories:", updatedCategories);
                    }} 
                  />
                  <span className="myconsent-portal-slider round"></span>
                </label>
                
              </div>
            ))
          ) : (
            <p>No categories available</p>
          )}
        </div>
      </section>


      <button 
        className="myconsent-portal-save-btn" 
        onClick={async () => {
          try {
            const updatedData = {
              userId: userId,
              consentGiven: consentGiven === "Yes" ? 1 : 0,
              selectedCategories: consentGiven === "Yes" 
                ? userData.selectedCategories.map(cat => ({ category_id: cat.category_id })) 
                : [] // If consent is "No", remove all categories
            };

            console.log("Updated Consent Data:", JSON.stringify(updatedData, null, 2));

            const response = await consentService.updateUserConsent(updatedData);
            console.log("Consent Updated Successfully:", response);
            alert("Consent updated successfully!"); // Show success message
          } catch (error) {
            console.error("Error updating consent:", error);
            alert("Failed to update consent."); // Show error message
          }
        }}
      >
        Save
      </button>




      {/* DSR Section */}
      <section className="myconsent-portal-dsr">
        <h2 className="myconsent-portal-section-title">📋 Data Subject Requests (DSR)</h2>
        <p className="myconsent-portal-dsr-description">
          Submit requests to view, modify, or delete your personal information under data protection regulations.
        </p>
        
        <button 
          className="myconsent-portal-dsr-btn" 
          onClick={handleDsrButtonClick}
        >
          Create New DSR Request
        </button>
        
        {showDsrForm && (
          <div className="myconsent-portal-dsr-form">
            <h3>Select Request Type</h3>
            <div className="myconsent-portal-dsr-options">
              <button 
                className={`myconsent-portal-dsr-option ${dsrType === "View PII" ? "active" : ""}`} 
                onClick={() => handleDsrTypeSelect("View PII")}
              >
                View My Personal Information
              </button>
              <button 
                className={`myconsent-portal-dsr-option ${dsrType === "Modify PII" ? "active" : ""}`} 
                onClick={() => handleDsrTypeSelect("Modify PII")}
              >
                Modify My Personal Information
              </button>
              <button 
                className={`myconsent-portal-dsr-option ${dsrType === "Forget Me" ? "active" : ""}`} 
                onClick={() => handleDsrTypeSelect("Forget Me")}
              >
                Request to be Forgotten
              </button>
            </div>

            {dsrType && (
              <div className="myconsent-portal-dsr-reason">
                <h4>Provide reason for your request (optional):</h4>
                <textarea
                  value={dsrReason}
                  onChange={(e) => setDsrReason(e.target.value)}
                  placeholder="Please describe the reason for your request..."
                  rows={3}
                  className="myconsent-portal-dsr-textarea"
                />
              </div>
            )}
            
            {dsrType === "View PII" && (
              <div className="myconsent-portal-dsr-details">
                <p>This will generate a request to view all personal information we have about you.</p>
                <button 
                  className="myconsent-portal-dsr-submit" 
                  onClick={submitDsrRequest}
                  disabled={isSubmitting}
                >
                {isSubmitting ? "Submitting..." : "Submit Request"}          
                </button>
              </div>
            )}
            
            {dsrType === "Modify PII" && (
              <div className="myconsent-portal-dsr-details">
                <p>Select the personal information you would like to modify:</p>
                <div className="myconsent-portal-pii-options">
                  {piiData.map(item => (
                    <div key={item.id} className="myconsent-portal-pii-option">
                      <input 
                        type="checkbox" 
                        id={`pii-${item.id}`} 
                        checked={item.selected}
                        onChange={() => togglePiiSelection(item.id)}
                      />
                      <label htmlFor={`pii-${item.id}`}>{item.name}</label>
                    </div>
                  ))}
                </div>
                <button 
                  className="myconsent-portal-dsr-submit" 
                  onClick={submitDsrRequest}
                  disabled={isSubmitting || !piiData.some(item => item.selected)}
                >
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            )}
            
            {dsrType === "Forget Me" && (
              <div className="myconsent-portal-dsr-details">
                <p className="myconsent-portal-dsr-warning">
                  Warning: This will initiate the process to delete all your personal information from our systems.
                  This action cannot be undone.
                </p>
                <button 
                  className="myconsent-portal-dsr-submit myconsent-portal-dsr-danger" 
                  onClick={submitDsrRequest}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Deletion Request"}
                </button>
              </div>
            )}
          </div>
        )}
        
        {requestStatus && (
          <div className="myconsent-portal-request-status">
            <p>{requestStatus}</p>
          </div>
        )}
        
        {/* List of DSR Requests */}
        {dsrRequests.length > 0 && (
          <div className="myconsent-portal-dsr-history">
            <h3>Your DSR Request History</h3>
            <div className="myconsent-portal-table-container">
              <table className="myconsent-portal-dsr-table">
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Type</th>
                    <th>Details</th>
                    <th>Admin Notes</th>
                    <th>Status</th>
                    <th>Date Created</th>
                  </tr>
                </thead>
                <tbody>
                  {dsrRequests.map(request => (
                    <tr key={request.id}>
                      <td>{request.id}</td>
                      <td>{request.type}</td>
                      <td>{request.details || "-"}</td>
                      <td>{request.admin_notes}</td>
                      <td>
                        <span className={`myconsent-portal-status-badge ${request.status.toLowerCase()}`}>
                          {request.status}
                        </span>
                      </td>
                      <td>{request.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>


      {/* File Display Section */}
{dsrRequests.filter(request => request.type === "View PII" && request.status.toLowerCase() === "completed").length > 0 && (
  <section className="myconsent-portal-file-display">
    <h2 className="myconsent-portal-section-title">📂 Your Personal Information Files</h2>
    <p className="myconsent-portal-file-description">
      Below are the files containing your personal information that you requested. Click on "View" to access each file.
    </p>
    
    <div className="myconsent-portal-table-container">
      <table className="myconsent-portal-file-table">
        <thead>
          <tr>
            <th>Request ID</th>
            <th>Date Completed</th>
            <th>Files</th>
          </tr>
        </thead>
        <tbody>
          {dsrRequests
            .filter(request => request.type === "View PII" && request.status.toLowerCase() === "completed")
            .map(request => {
              // Get file paths if they exist
              const filePaths = request.file_paths ? request.file_paths.split(',') : [];
              
              return (
                <tr key={`file-${request.id}`}>
                  <td>{request.id}</td>
                  <td>{request.createdAt}</td>
                  <td>
                    {filePaths.length > 0 ? (
                      <div className="myconsent-portal-file-list">
                        {filePaths.map((path, index) => (
                          <div key={index} className="myconsent-portal-file-item">
                            <span>File {index + 1}</span>
                            <a 
                              href={`/uploads/dsr/${path.split('/').pop()}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="myconsent-portal-view-btn"
                            >
                              View
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="myconsent-portal-no-files">No files available</span>
                    )}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  </section>
)}

    </div>
  );
};

export default MyConsent;
