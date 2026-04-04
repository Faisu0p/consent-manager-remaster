import React from "react";
import "../styles/ComplianceStatus.css"; // Import styling

const ComplianceStatus = ({ compliance, summary, loading }) => {
        const status = compliance?.status || "Awaiting Data";
        const score = compliance?.score ?? 0;
        const statusClass =
            status === "Compliant" ? "compliant" : status === "Needs Attention" ? "attention" : "non-compliant";

    return (
                <div className={`compliance-status ${statusClass}`}>
            <h3>Compliance Status</h3>
                        {loading ? (
                            <p className="compliance-status-loading">Loading compliance metrics...</p>
                        ) : (
                            <>
                                <div className="compliance-status-score">{score}%</div>
                                <p className="compliance-status-label">{status}</p>
                                <small>
                                    Based on {summary?.totalConsents || 0} total consent events and {summary?.consentRate || 0}% acceptance rate.
                                </small>
                            </>
                        )}
        </div>
    );
};

export default ComplianceStatus;
