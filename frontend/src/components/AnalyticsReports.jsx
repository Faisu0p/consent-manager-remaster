import React from "react";
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "../styles/AnalyticsReports.css"; // Import styling

const AnalyticsReports = ({ trendData = [], loading }) => {

    return (
        <div className="analytics-reports">
            <h3>Analytics & Reports</h3>
                        {loading ? (
                            <p className="analytics-reports-loading">Loading trend data...</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={260}>
                                <AreaChart data={trendData}>
                                    <defs>
                                        <linearGradient id="grantedGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0f766e" stopOpacity={0.35} />
                                            <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="revokedGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#dc2626" stopOpacity={0.28} />
                                            <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5eaf2" />
                                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
                                    <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                                    <Tooltip />
                                    <Legend />
                                    <Area type="monotone" dataKey="granted" stroke="#0f766e" fill="url(#grantedGradient)" name="Granted" />
                                    <Area type="monotone" dataKey="revoked" stroke="#dc2626" fill="url(#revokedGradient)" name="Revoked" />
                                    <Line type="monotone" dataKey="total" stroke="#0f172a" strokeWidth={2} dot={false} name="Total" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
        </div>
    );
};

export default AnalyticsReports;
