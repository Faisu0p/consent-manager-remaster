import React from "react";
import "../styles/RecentActivity.css"; // Import styling

const RecentActivity = () => {
    // Static demo data (replace with API data later)
    const activityData = [
        { id: 1, user: "John Doe", action: "Granted Consent", time: "5 mins ago" },
        { id: 2, user: "Jane Smith", action: "Revoked Consent", time: "10 mins ago" },
        { id: 3, user: "Mark Wilson", action: "Updated Preferences", time: "1 hour ago" },
        { id: 4, user: "Emily Johnson", action: "Granted Consent", time: "3 hours ago" },
    ];

    return (
        <div className="recent-activity">
            <h3>Recent Activity</h3>
            <ul>
                {activityData.map((activity) => (
                    <li key={activity.id}>
                        <span className="user">{activity.user}</span> - 
                        <span className="action">{activity.action}</span>
                        <span className="time"> ({activity.time})</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default RecentActivity;
