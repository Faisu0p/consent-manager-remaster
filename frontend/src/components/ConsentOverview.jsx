import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import "../styles/ConsentOverview.css"; // Import styling

const ConsentOverview = ({ summary, loading }) => {
    const data = [
                { name: "Granted", value: summary?.granted || 0 },
                { name: "Revoked", value: summary?.revoked || 0 },
    ];

        const COLORS = ["#0f766e", "#dc2626"];

    return (
        <div className="consent-overview">
            <h3>Consent Overview</h3>
                        {loading ? (
                            <p className="consent-overview-loading">Loading chart data...</p>
                        ) : (
                            <>
                                <div className="consent-overview-chart-wrap">
                                    <ResponsiveContainer width="100%" height={220}>
                                        <PieChart>
                                            <Pie
                                                data={data}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={58}
                                                outerRadius={88}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {data.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="consent-overview-stats">
                                    <div>
                                        <span>Granted</span>
                                        <strong>{summary?.granted || 0}</strong>
                                    </div>
                                    <div>
                                        <span>Revoked</span>
                                        <strong>{summary?.revoked || 0}</strong>
                                    </div>
                                    <div>
                                        <span>Consent Rate</span>
                                        <strong>{summary?.consentRate || 0}%</strong>
                                    </div>
                                </div>
                            </>
                        )}
        </div>
    );
};

export default ConsentOverview;
