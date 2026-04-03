import React, { useState } from "react";
import "../styles/ComplianceStatus.css"; // Import styling

const ComplianceStatus = () => {
    // Static demo status (replace with API data later)
    const [isCompliant, setIsCompliant] = useState(true);

    return (
        <div className={`compliance-status ${isCompliant ? "compliant" : "non-compliant"}`}>
            <h3>Compliance Status</h3>
            <p>
                {isCompliant ? "✅ Your organization is compliant" : "❌ Compliance issues detected"}
            </p>
        </div>
    );
};

export default ComplianceStatus;
