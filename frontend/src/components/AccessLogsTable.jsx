import React, { useEffect, useState } from "react";
import accessLogService from "../services/accessLogService";
import "../styles/AccessLogsTable.css";

const AccessLogsTable = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10;

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await accessLogService.getAccessLogs();
        setLogs(data);
      } catch (err) {
        setError("Failed to load access logs.");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  // Calculate pagination
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = logs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(logs.length / logsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Generate page numbers for display
  const pageNumbers = [];
  const maxPagesToShow = 5;
  const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="access-logs-container">
      {loading && <p className="access-logs-loading">Loading...</p>}
      {error && <p className="access-logs-error">{error}</p>}
      {!loading && !error && logs.length === 0 && (
        <p className="access-logs-empty">No logs found.</p>
      )}
      {!loading && !error && logs.length > 0 && (
        <>
          <table className="access-logs-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Email</th>
                <th>Action</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {currentLogs.map((log) => (
                <tr key={log.id}>
                  <td>{log.id}</td>
                  <td>{log.user_name}</td>
                  <td>{log.user_email}</td>
                  <td className={`access-logs-action ${log.action.toLowerCase()}`}>
                    {log.action}
                  </td>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="access-logs-pagination">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-button"
            >
              Previous
            </button>
            {pageNumbers.map((number) => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`pagination-button ${currentPage === number ? 'active' : ''}`}
              >
                {number}
              </button>
            ))}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-button"
            >
              Next
            </button>
            <span className="pagination-info">
              Page {currentPage} of {totalPages}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default AccessLogsTable;