import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import "../styles/ConsentTrends.css"; // Updated CSS file

const ConsentTrends = () => {
  // Demo data (Replace later with API data)
  const data = [
    { month: "Jan", optIn: 80, optOut: 20 },
    { month: "Feb", optIn: 70, optOut: 30 },
    { month: "Mar", optIn: 90, optOut: 25 },
    { month: "Apr", optIn: 100, optOut: 40 },
    { month: "May", optIn: 120, optOut: 50 },
    { month: "Jun", optIn: 130, optOut: 60 },
  ];

  return (
    <div className="consent-trends">
      <h2>Consent Trends (Monthly)</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="optIn" fill="#28a745" name="Opt-ins" />
          <Bar dataKey="optOut" fill="#dc3545" name="Opt-outs" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ConsentTrends;
