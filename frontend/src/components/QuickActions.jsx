import React from "react";
import "../styles/QuickActions.css"; // Import styling

const QuickActions = () => {
    return (
        <div className="quick-actions">
            <h3>Quick Actions</h3>
            <div className="buttons">
                <button className="add">➕ Add Consent</button>
                <button className="revoke">❌ Revoke Consent</button>
                <button className="bulk">📑 Bulk Actions</button>
            </div>
        </div>
    );
};

export default QuickActions;
