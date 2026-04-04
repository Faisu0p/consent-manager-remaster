import React, { useEffect, useMemo, useState } from "react";
import { Ban, Plus, Search, Trash2 } from "lucide-react";
import emailSuppressionService from "../services/emailSuppressionService";
import "../styles/EmailSuppression.css";

const EmailSuppression = () => {
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("success");

  const loadSuppressedEmails = async () => {
    setIsLoading(true);
    try {
      const data = await emailSuppressionService.getAllSuppressedEmails();
      setRecords(data || []);
    } catch (error) {
      setStatusType("error");
      setStatusMessage("Failed to load suppressed emails.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSuppressedEmails();
  }, []);

  const filteredRecords = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return records;

    return records.filter((item) => {
      const emailMatch = item.email?.toLowerCase().includes(term);
      const sourceMatch = item.source?.toLowerCase().includes(term);
      const notesMatch = item.notes?.toLowerCase().includes(term);
      return emailMatch || sourceMatch || notesMatch;
    });
  }, [records, searchTerm]);

  const handleAddEmail = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSaving(true);
    setStatusMessage("");

    try {
      const response = await emailSuppressionService.addSuppressedEmail({
        email: email.trim().toLowerCase(),
        source: "cookie-consent-rejection",
        notes: notes.trim() || null,
      });

      setStatusType("success");
      setStatusMessage(response.message || "Email added to suppression list.");
      setEmail("");
      setNotes("");
      await loadSuppressedEmails();
    } catch (error) {
      setStatusType("error");
      setStatusMessage(
        error.response?.data?.message || "Could not add email to suppression list."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Remove this email from suppression list?");
    if (!confirmed) return;

    try {
      await emailSuppressionService.deleteSuppressedEmail(id);
      setStatusType("success");
      setStatusMessage("Email removed from suppression list.");
      await loadSuppressedEmails();
    } catch (error) {
      setStatusType("error");
      setStatusMessage(error.response?.data?.message || "Failed to remove email.");
    }
  };

  return (
    <div className="email-suppression-container enterprise-page">
      <div className="enterprise-page-header">
        <h1 className="enterprise-page-title">Email Suppression List</h1>
        <p className="enterprise-page-subtitle">
          Store and manage emails that should never receive promotional communication.
        </p>
      </div>

      <div className="email-suppression-summary-grid">
        <div className="email-suppression-summary-card">
          <span>Total Suppressed</span>
          <strong>{records.length}</strong>
        </div>
        <div className="email-suppression-summary-card">
          <span>Visible Results</span>
          <strong>{filteredRecords.length}</strong>
        </div>
      </div>

      <div className="email-suppression-toolbar enterprise-panel">
        <form className="email-suppression-form" onSubmit={handleAddEmail}>
          <div className="email-suppression-input-group">
            <label htmlFor="suppression-email">Email</label>
            <input
              id="suppression-email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="email-suppression-input-group">
            <label htmlFor="suppression-notes">Notes (optional)</label>
            <input
              id="suppression-notes"
              type="text"
              placeholder="Reason or source details"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <button type="submit" className="email-suppression-add-btn" disabled={isSaving}>
            <Plus size={14} /> {isSaving ? "Adding..." : "Add Email"}
          </button>
        </form>

        <div className="email-suppression-search-wrap">
          <Search size={14} className="email-suppression-search-icon" />
          <input
            type="text"
            placeholder="Search by email, source, notes"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {statusMessage && (
          <p className={`email-suppression-status ${statusType === "error" ? "error" : "success"}`}>
            {statusMessage}
          </p>
        )}
      </div>

      <div className="email-suppression-table-wrap enterprise-panel">
        {isLoading ? (
          <p className="enterprise-empty-state">Loading suppression list...</p>
        ) : filteredRecords.length === 0 ? (
          <p className="enterprise-empty-state">No suppressed emails found.</p>
        ) : (
          <table className="email-suppression-table">
            <thead>
              <tr>
                <th><Ban size={14} /> Email</th>
                <th>Source</th>
                <th>Notes</th>
                <th>Added At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((item) => (
                <tr key={item.id}>
                  <td>{item.email}</td>
                  <td>{item.source || "manual"}</td>
                  <td>{item.notes || "-"}</td>
                  <td>{new Date(item.created_at).toLocaleString()}</td>
                  <td>
                    <button
                      type="button"
                      className="email-suppression-delete-btn"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default EmailSuppression;