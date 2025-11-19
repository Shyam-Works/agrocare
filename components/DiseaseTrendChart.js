import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Calendar } from "lucide-react";

const COLOR_PALETTE = {
  primaryText: "text-green-800",
  mediumText: "text-gray-600",
};

/**
 * Renders a Line Chart showing the trend of diseases and average severity over a time range.
 * @param {object[]} diseaseTrendData - Data for the line chart.
 * @param {string} trendRangeText - Text describing the selected time range (e.g., "Last 30 days").
 */
const DiseaseTrendChart = ({ diseaseTrendData, trendRangeText }) => {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg shadow-md p-6 mb-6`}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-xl font-bold ${COLOR_PALETTE.primaryText}`}>
          Disease Trend
        </h2>
        <div
          className={`flex items-center space-x-2 text-sm ${COLOR_PALETTE.mediumText}`}
        >
          <Calendar className="w-4 h-4" />
          <span>{trendRangeText}</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={diseaseTrendData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
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
            formatter={(value, name) => [
              name === "diseased" || name === "healthy"
                ? value.toString()
                : `${value}%`,
              name === "diseased"
                ? "Diseased"
                : name === "healthy"
                ? "Healthy"
                : "Avg. Severity",
            ]}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="severity"
            stroke="#CA8A04"
            strokeWidth={2}
            strokeDasharray="8 4"
            name="Avg. Severity (%)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DiseaseTrendChart;