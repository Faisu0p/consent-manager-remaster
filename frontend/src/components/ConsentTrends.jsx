import React from "react";
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import "../styles/ConsentTrends.css"; // Updated CSS file

const ConsentTrends = ({ data = [], templateBreakdown = [], totals, loading }) => {
  const COLORS = ["#0f766e", "#0891b2", "#f97316", "#2563eb", "#9333ea", "#dc2626"];

  return (
    <div className="consent-trends">
      <div className="consent-trends-header">
        <h2>Consent Trends</h2>
        {!loading && totals && (
          <div className="consent-trends-kpis">
            <span>Total: {totals.total}</span>
            <span>Accepted: {totals.accepted}</span>
            <span>Rejected: {totals.rejected}</span>
          </div>
        )}
      </div>

      {loading ? (
        <p className="consent-trends-loading">Loading report analytics...</p>
      ) : (
        <div className="consent-trends-layout">
          <div className="consent-trends-chart">
            <h3>Monthly Consent Movement</h3>
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5eaf2" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="accepted" fill="#0f766e" name="Accepted" radius={[6, 6, 0, 0]} />
                <Bar dataKey="rejected" fill="#dc2626" name="Rejected" radius={[6, 6, 0, 0]} />
                <Line type="monotone" dataKey="total" stroke="#0f172a" strokeWidth={2} dot={{ r: 2 }} name="Total" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="consent-trends-chart">
            <h3>Template Distribution</h3>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={templateBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                >
                  {templateBreakdown.map((entry, index) => (
                    <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsentTrends;
