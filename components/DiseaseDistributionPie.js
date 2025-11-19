import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLOR_PALETTE = {
  primaryText: "text-green-800",
  RECHARTS_COLORS: ["#1E4028", "#D9A40B", "#6A8E4E", "#A0522D", "#4682B4"],
};
const COLORS = COLOR_PALETTE.RECHARTS_COLORS;

/**
 * Renders a Pie Chart showing the distribution of the top diseases.
 * @param {object[]} diseaseDistribution - Data for the pie chart.
 * @param {string | number} totalDiagnoses - Total number of scans for the subtitle.
 */
const DiseaseDistributionPie = ({ diseaseDistribution, totalDiagnoses }) => {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg shadow-md p-6`}
    >
      <h2 className={`text-xl font-bold ${COLOR_PALETTE.primaryText} mb-4`}>
        Top Disease Distribution ({totalDiagnoses} scans)
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart margin={{ top: 5, right: -20, left: 60, bottom: 5 }}>
          <Pie
            data={diseaseDistribution}
            cx="45%"
            cy="50%"
            labelLine={false}
            // Ensure the percentage is calculated and present in data structure before enabling label
            // label={({ name, percentage }) => `${name}: ${percentage}%`}
            outerRadius={90}
            fill="#8884d8"
            dataKey="value"
          >
            {diseaseDistribution.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name, props) => [
              `${value} Scans (${props.payload.percentage || "N/A"}%)`,
              props.payload.name,
            ]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DiseaseDistributionPie;