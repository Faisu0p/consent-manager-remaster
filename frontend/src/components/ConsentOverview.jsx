import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import "../styles/ConsentOverview.css"; // Import styling

const ConsentOverview = () => {
    // Static demo data (will be replaced with API data later)
    const data = [
        { name: "Granted", value: 70 },
        { name: "Revoked", value: 30 },
    ];

    const COLORS = ["#4CAF50", "#F44336"]; // Green for granted, red for revoked

    return (
        <div className="consent-overview">
            <h3>Consent Overview</h3>
            <PieChart width={250} height={250}>
                <Pie 
                    data={data} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={50} 
                    outerRadius={80} 
                    fill="#8884d8"
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
        </div>
    );
};

export default ConsentOverview;
