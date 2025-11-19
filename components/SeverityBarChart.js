import React from "react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLOR_PALETTE = {
  primaryText: "text-green-800",
};
const COLORS = ["#6A8E4E", "#D9A40B", "#A0522D"]; // Low, Medium, High (Green, Yellow, Brown/Reddish)

/**
 * Renders a Bar Chart showing the count of diagnoses by severity level.
 * @param {object[]} severityData - Data for the bar chart.
 */
const SeverityBarChart = ({ severityData }) => {
  const processedSeverityData = severityData.map((entry) => {
    let color;
    switch (entry.level) {
  case "Mild":
    color = "#6A8E4E";
    break;
  case "Moderate":
    color = "#D9A40B";
    break;
  case "Severe":
    color = "#A0522D";
    break;
}

    return { ...entry, color };
  });

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg shadow-md p-6`}
    >
      <h2 className={`text-xl font-bold ${COLOR_PALETTE.primaryText} mb-4`}>
        Disease Severity Levels
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={processedSeverityData}
          margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="level"
            stroke="#6b7280"
            style={{ fontSize: "12px" }}
          />
          <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: `1px solid #e5e7eb`,
              borderRadius: "8px",
            }}
            formatter={(value) => [`${value} Scans`, "Count"]}
          />
          <Bar
            dataKey="count"
            radius={[4, 4, 0, 0]}
            barSize={40}
            isAnimationActive={true}
            animationDuration={1200}
          >
            {processedSeverityData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SeverityBarChart;