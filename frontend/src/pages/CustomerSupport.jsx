import React, { useState, useEffect } from "react";
import dsrService from "../services/dsrService";
import "../styles/CustomerSupport.css";

const CustomerSupport = () => {

  const [dsrRequests, setDsrRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [responseText, setResponseText] = useState("");
  const [fileToUpload, setFileToUpload] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  
  useEffect(() => {
    setIsLoading(true);
    dsrService.getAllDSRRequestsForSupport()
      .then(response => {
        console.log("API response:", response);
        setDsrRequests(response.data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Failed to fetch DSR requests:", error);
        setIsLoading(false);
      });
  }, []);

  const handleRequestSelection = (request) => {
    setSelectedRequest(request);
    setResponseText("");
    setSuccessMessage("");
    setFileToUpload(null);
  };

  // Handle file upload change
  const handleFileChange = (e) => {
    setFileToUpload(Array.from(e.target.files));
  };
  

  const handleStatusChange = (newStatus) => {
    if (!selectedRequest) return;
    
    const updatedRequests = dsrRequests.map(req => 
      req.id === selectedRequest.id ? { ...req, request_status: newStatus } : req
    );
    
    setDsrRequests(updatedRequests);
    setSelectedRequest({...selectedRequest, request_status: newStatus});
    setSuccessMessage(`Request status updated to ${newStatus}`);
    
    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };




  // Handle submission of response to the user
  const handleSubmitResponse = async () => {
    if (!selectedRequest || !responseText) return;
  
    const requestData = {
      id: selectedRequest.id,
      request_status: "Completed",
      admin_notes: responseText,
      updated_at: new Date().toISOString(),
      files: fileToUpload && fileToUpload.length > 0 ? `${fileToUpload.length} file(s)` : null,    };
  
    console.log("Submitting the following data to backend:");
    console.table(requestData);
  
    const formData = new FormData();
    formData.append("id", requestData.id);
    formData.append("request_status", requestData.request_status);
    formData.append("admin_notes", requestData.admin_notes);
    formData.append("updated_at", requestData.updated_at);

    if (fileToUpload && fileToUpload.length > 0) {
      fileToUpload.forEach((file, index) => {
        formData.append("files", file);
      });
    }
    
  
    try {
      const res = await dsrService.submitDSRResponse(formData); // Using the service method
  
      // Handle response success
      handleStatusChange("Completed");
      setResponseText("");
      setFileToUpload(null);
      setSuccessMessage("Response submitted successfully");
    } catch (err) {
      console.error("Submission error:", err);
      setSuccessMessage("There was an error submitting your response");
    }
  };
  
  

  const handleDeleteUser = () => {
    if (!selectedRequest) return;
    
    if (window.confirm(`Are you sure you want to delete all data for ${selectedRequest.username}? This action cannot be undone.`)) {
      // Here you would call your API to delete the user
      console.log("Deleting user:", selectedRequest.user_id);
      
      // Update the request status
      handleStatusChange("completed");
      setSuccessMessage(`User ${selectedRequest.username} has been removed from the system`);
    }
  };


  const filteredRequests = dsrRequests.filter(request => {
    if (activeTab !== "all" && request.request_status.toLowerCase() !== activeTab) {
      return false;
    }
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (request.id.toString().toLowerCase().includes(searchLower)) ||
      (request.username && request.username.toLowerCase().includes(searchLower)) ||
      (request.email && request.email.toLowerCase().includes(searchLower)) ||
      (request.request_type && request.request_type.toLowerCase().includes(searchLower))
    );
  });
  

  return (
    <div className="cs-container">
      <header className="cs-header">
        <div className="cs-header-content">
          <h1>Customer Support Portal</h1>
          <p>Manage Data Subject Requests (DSR)</p>
        </div>
      </header>
      
      <div className="cs-dashboard">
        <div className="cs-sidebar">
          <div className="cs-search">
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="cs-tabs">
            <button 
              className={activeTab === "all" ? "active" : ""} 
              onClick={() => setActiveTab("all")}
            >
              All Requests
            </button>
            <button 
              className={activeTab === "pending" ? "active" : ""} 
              onClick={() => setActiveTab("pending")}
            >
              Pending
            </button>
            <button 
              className={activeTab === "in progress" ? "active" : ""} 
              onClick={() => setActiveTab("in progress")}
            >
              In Progress
            </button>
            <button 
              className={activeTab === "completed" ? "active" : ""} 
              onClick={() => setActiveTab("completed")}
            >
              Completed
            </button>
            <button 
              className={activeTab === "rejected" ? "active" : ""} 
              onClick={() => setActiveTab("rejected")}
            >
              Rejected
            </button>
          </div>
          
          <div className="cs-request-list">
            {isLoading ? (
              <div className="cs-loading">
                <div className="cs-spinner"></div>
                <p>Loading requests...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <p className="cs-no-requests">No requests found</p>
            ) : (
              filteredRequests.map(request => (
                <div 
                  key={request.id}
                  className={`cs-request-item ${selectedRequest?.id === request.id ? 'selected' : ''}`}
                  onClick={() => handleRequestSelection(request)}
                >
                  <div className="cs-request-header">
                    <span className="cs-request-id">{request.id}</span>
                    <span className={`cs-status cs-status-${request.request_status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {request.request_status}
                    </span>
                  </div>
                  <h3 className="cs-request-name">{request.username}</h3>
                  <p className="cs-request-type">{request.request_type}</p>
                  <p className="cs-request-date">
                    {new Date(request.created_at).toLocaleDateString()} at {new Date(request.created_at).toLocaleTimeString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="cs-content">
          {!selectedRequest ? (
            <div className="cs-no-selection">
              <div className="cs-empty-state">
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z" fill="#ccc"/>
                  <path d="M12 12C13.65 12 15 10.65 15 9C15 7.35 13.65 6 12 6C10.35 6 9 7.35 9 9C9 10.65 10.35 12 12 12ZM12 8C12.55 8 13 8.45 13 9C13 9.55 12.55 10 12 10C11.45 10 11 9.55 11 9C11 8.45 11.45 8 12 8Z" fill="#ccc"/>
                  <path d="M18 16.58C18 14.08 14.03 13 12 13C9.97 13 6 14.08 6 16.58V18H18V16.58ZM8.48 16C9.22 15.49 10.71 15 12 15C13.3 15 14.78 15.49 15.52 16H8.48Z" fill="#ccc"/>
                </svg>
                <h2>No request selected</h2>
                <p>Select a request from the list to view details</p>
              </div>
            </div>
          ) : (
            <div className="cs-request-details">
              {successMessage && (
                <div className="cs-success-message">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM8 15L3 10L4.41 8.59L8 12.17L15.59 4.58L17 6L8 15Z" fill="#4CAF50"/>
                  </svg>
                  {successMessage}
                </div>
              )}
              
              <div className="cs-details-header">
                <div>
                  <h2>{selectedRequest.id}: {selectedRequest.request_type}</h2>
                  <span className={`cs-status cs-status-${selectedRequest.request_status.toLowerCase().replace(/\s+/g, '-')}`}>
                    {selectedRequest.request_status}
                  </span>
                </div>
                <div className="cs-actions">
                  <select 
                    value={selectedRequest.request_status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="cs-status-dropdown"
                  >
                    <option value="pending">Pending</option>
                    <option value="in progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="cs-details-grid">
                <div className="cs-user-info">
                  <h3>User Information</h3>
                  <div className="cs-info-item">
                    <label>User ID:</label>
                    <span>{selectedRequest.user_id}</span>
                  </div>
                  <div className="cs-info-item">
                    <label>Name:</label>
                    <span>{selectedRequest.username}</span>
                  </div>
                  <div className="cs-info-item">
                    <label>Email:</label>
                    <span>{selectedRequest.email}</span>
                  </div>
                  <div className="cs-info-item">
                    <label>Request Date:</label>
                    <span>{new Date(selectedRequest.created_at).toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="cs-request-info">
                  <h3>Request Details</h3>
                  <div className="cs-info-item">
                    <label>Request Type:</label>
                    <span>{selectedRequest.request_type}</span>
                  </div>
                  <div className="cs-info-item">
                    <label>Reason:</label>
                    <span>{selectedRequest.reason}</span>
                  </div>
                  <div className="cs-info-item">
                    <label>Status:</label>
                    <span className={`cs-status cs-status-${selectedRequest.request_status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {selectedRequest.request_status}
                    </span>
                  </div>
                </div>
              </div>
                            
              {selectedRequest.userDetails && (
                <div className="cs-personal-data">
                  <h3>User's Personal Information</h3>
                  <div className="cs-pii-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Data Type</th>
                          <th>Value</th>
                          {selectedRequest.request_type === "Modify PII" && <th>Action</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(selectedRequest.userDetails).map(([key, value]) => (
                          <tr key={key}>
                            <td>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</td>
                            <td>{value}</td>
                            {selectedRequest.request_type === "Modify PII" && (
                              <td>
                                <button className="cs-action-btn cs-edit-btn">Edit</button>
                                <button className="cs-action-btn cs-delete-btn">Delete</button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              <div className="cs-response-section">
                <h3>Response</h3>
                
                {selectedRequest.request_type === "View PII" && (
                  <div className="cs-file-upload">
                    <p>Upload user's personal information export:</p>
                    <input 
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="cs-file-input"
                    />
                    {fileToUpload && fileToUpload.length > 0 && (
                      <div className="cs-file-preview">
                        <p>Files selected: {fileToUpload.length} file(s)</p>
                        <ul>
                          {fileToUpload.map((file, index) => (
                            <li key={index}>{file.name}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {selectedRequest.request_type === "Forget Me" && (
                  <div className="cs-forget-me">
                    <div className="cs-warning">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 21H23L12 2L1 21ZM13 18H11V16H13V18ZM13 14H11V10H13V14Z" fill="#FFC107"/>
                      </svg>
                      <p>This action will permanently delete all data associated with this user and cannot be undone.</p>
                    </div>
                    <button 
                      className="cs-action-btn cs-delete-btn cs-delete-user"
                      onClick={handleDeleteUser}
                    >
                      Delete User Data
                    </button>
                  </div>
                )}
                
                <textarea
                  className="cs-response-textarea"
                  placeholder="Type your response to the user here..."
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={5}
                ></textarea>
                
                <button 
                  className="cs-submit-response"
                  onClick={handleSubmitResponse}
                  disabled={!responseText}
                >
                  Send Response
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerSupport;