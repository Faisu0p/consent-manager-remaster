import React from "react";
import "../styles/RecentActivity.css"; // Import styling

const RecentActivity = ({ activities = [], loading }) => {

    return (
        <div className="recent-activity">
            <h3>Recent Activity</h3>
            {loading ? (
              <p className="recent-activity-loading">Loading latest events...</p>
            ) : activities.length === 0 ? (
              <p className="recent-activity-empty">No recent consent activity available.</p>
            ) : (
              <ul>
                  {activities.map((activity) => (
                      <li key={activity.id}>
                          <span className="user">{activity.user}</span>
                          <span className="action">{activity.action}</span>
                          <span className="time">{activity.time}</span>
                      </li>
                  ))}
              </ul>
            )}
        </div>
    );
};

export default RecentActivity;
