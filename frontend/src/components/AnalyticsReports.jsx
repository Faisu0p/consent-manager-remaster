import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "../styles/AnalyticsReports.css"; // Import styling

const AnalyticsReports = () => {
    // Static demo data (replace with API data later)
    const data = [
        { date: "Mar 1", granted: 40, revoked: 10 },
        { date: "Mar 2", granted: 35, revoked: 15 },
        { date: "Mar 3", granted: 50, revoked: 5 },
        { date: "Mar 4", granted: 45, revoked: 12 },
        { date: "Mar 5", granted: 60, revoked: 8 },
        { date: "Mar 6", granted: 55, revoked: 10 },
        { date: "Mar 7", granted: 70, revoked: 6 },
    ];

    return (
        <div className="analytics-reports">
            <h3>Analytics & Reports</h3>
            <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="granted" stroke="#4CAF50" name="Granted" />
                    <Line type="monotone" dataKey="revoked" stroke="#F44336" name="Revoked" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AnalyticsReports;
