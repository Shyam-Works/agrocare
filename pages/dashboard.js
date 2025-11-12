import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Leaf,
  AlertTriangle,
  Calendar,
  Filter,
  ChevronDown,
  Download,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Navbar from "@/components/Navbar";

// --- START: ENHANCED COLOR PALETTE DEFINITIONS (Deep Forest & Gold) ---

// Define the new color palette using Deep Forest Green, Gold, and Slate Gray
const COLOR_PALETTE = {
  // Main Accent for Branding/Success (Deep Forest Green)
  primary: "green-800",
  primaryText: "text-green-800",
  primaryBg: "bg-green-800",
  primaryLightBg: "bg-green-50",

  // Secondary Accent for Totals/Highlight (Rich Mustard/Gold)
  secondary: "yellow-600",
  secondaryText: "text-yellow-600",
  secondaryDarkText: "text-yellow-700",

  // Danger/Diseased (A more muted, earthy Red)
  danger: "red-700",
  dangerText: "text-red-700",

  // Success/Healthy (Vibrant Growth Green)
  success: "green-500",
  successText: "text-green-500",

  // Severity/Attention (Soft Orange)
  attention: "orange-500",

  // Background/UI (Dark Slate for text, Light Gray for background)
  background: "bg-gray-100", // Brighter background for contrast
  cardBorder: "border-gray-200",
  darkText: "text-gray-900", // Very dark text for high readability
  mediumText: "text-gray-600",
  lightText: "text-gray-400",

  // Recharts Chart Colors (Deep, contrasting colors)
  RECHARTS_COLORS: ["#1E4028", "#D9A40B", "#6A8E4E", "#A0522D", "#4682B4"],
};

const COLORS = COLOR_PALETTE.RECHARTS_COLORS; // Use the new colors for PieChart

// --- END: ENHANCED COLOR PALETTE DEFINITIONS ---

// Mapping strings to icons for rendering in the stats cards
const iconMap = {
  Activity: Activity,
  AlertTriangle: AlertTriangle,
  Leaf: Leaf,
  TrendingUp: TrendingUp,
};

const Dashboard = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [timeRange, setTimeRange] = useState("30d");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // States for Live Data
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [categories, setCategories] = useState([]);
  const [diseaseTrendData, setDiseaseTrendData] = useState([]);
  const [diseaseDistribution, setDiseaseDistribution] = useState([]);
  const [severityData, setSeverityData] = useState([]);
  const [monthlyScans, setMonthlyScans] = useState([]);
  const [recentDiagnoses, setRecentDiagnoses] = useState([]);

  // The original getStatColor helper is not used in the final render logic but is kept for integrity
  const getStatColor = (color) => {
    const colors = {
      blue: "bg-blue-100 text-blue-600",
      red: "bg-red-100 text-red-600",
      green: "bg-green-100 text-green-600",
      orange: "bg-orange-100 text-orange-600",
    };
    return colors[color] || colors.blue;
  };

  const fetchDashboardData = async () => {
    setLoading(true);

    const query = new URLSearchParams({
      timeRange: timeRange,
      categoryId: selectedCategory,
    }).toString();

    try {
      const res = await fetch(`/api/dashboard/data?${query}`);
      if (!res.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      const data = await res.json();

      console.log("📊 API Response:", data);
      console.log("📁 Raw Categories from API:", data.categories);

      // Get total diagnoses count for "All Plants"
      const totalDiagnosesCount = parseInt(
        data.stats.find((s) => s.title === "Total Diagnoses")?.value || 0
      );

      // Create "All Plants" category
      const allPlantsCategory = {
        id: "all",
        name: "All Plants",
        count: totalDiagnosesCount,
      };

      // Combine with API categories (which now won't include "all")
      const apiCategories = Array.isArray(data.categories)
        ? data.categories
        : [];
      const finalCategories = [allPlantsCategory, ...apiCategories];

      console.log("✅ Final Categories to Display:", finalCategories);

      // Set all fetched states
      setStats(data.stats || []);
      setCategories(finalCategories);
      setDiseaseTrendData(data.diseaseTrendData || []);
      setDiseaseDistribution(data.diseaseDistribution || []);
      setSeverityData(data.severityData || []);
      setMonthlyScans(data.monthlyScans || []);
      setRecentDiagnoses(data.recentDiagnoses || []);
    } catch (error) {
      console.error("❌ Error fetching dashboard data:", error);
      // Fallback for API failure
      setStats([]);
      setCategories([{ id: "all", name: "All Plants", count: 0 }]);
      setDiseaseTrendData([]);
      setDiseaseDistribution([]);
      setSeverityData([]);
      setMonthlyScans([]);
      setRecentDiagnoses([]);
    } finally {
      setLoading(false);
    }
  };

  // Effect to run the fetch function when filters change
  useEffect(() => {
    fetchDashboardData();
  }, [timeRange, selectedCategory]);

  // Helper to get the current category name for display
  const currentCategoryName =
    categories.find((c) => c.id === selectedCategory)?.name || "All Plants";
  const currentCategoryCount =
    categories.find((c) => c.id === selectedCategory)?.count || 0;
  const totalDiagnoses =
    stats.find((s) => s.title === "Total Diagnoses")?.value || "0";
  const trendRangeText =
    timeRange === "7d"
      ? "Last 7 days"
      : timeRange === "90d"
      ? "Last 90 days"
      : timeRange === "1y"
      ? "Last Year"
      : "Last 30 days";

  if (loading) {
    // Simple Loading state
    return (
      <div
        className={`min-h-screen ${COLOR_PALETTE.background} flex items-center justify-center`}
      >
        <div
          className={`text-xl font-medium ${COLOR_PALETTE.mediumText} flex items-center space-x-2`}
        >
          <svg
            className={`animate-spin h-5 w-5 ${COLOR_PALETTE.primaryText}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>Loading Plant Insights...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${COLOR_PALETTE.background}`}>
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1
            className={`text-4xl font-bold ${COLOR_PALETTE.primaryText} mb-1`}
          >
            Dashboard
          </h1>
          <p className={`text-sm ${COLOR_PALETTE.mediumText}`}>
            Overview of your plant health monitoring and disease tracking
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          {/* Category Filter */}
          <div className="relative">
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className={`flex items-center space-x-2 px-4 py-2 bg-white border ${COLOR_PALETTE.cardBorder} rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-sm`}
            >
              <Filter className={`w-4 h-4 ${COLOR_PALETTE.mediumText}`} />
              <span className={`font-medium ${COLOR_PALETTE.darkText}`}>
                {currentCategoryName}
              </span>
              <span
                className={`text-xs ${COLOR_PALETTE.mediumText} bg-gray-100 px-2 py-0.5 rounded`}
              >
                {currentCategoryCount}
              </span>
              <ChevronDown
                className={`w-4 h-4 ${
                  COLOR_PALETTE.mediumText
                } transition-transform ${
                  showCategoryDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            {showCategoryDropdown && (
              <div
                className={`absolute top-full mt-2 w-72 bg-white border ${COLOR_PALETTE.cardBorder} rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto`}
              >
                {categories.length === 0 ? (
                  <div
                    className={`px-4 py-3 text-sm ${COLOR_PALETTE.mediumText} text-center`}
                  >
                    No categories found
                  </div>
                ) : (
                  <div className="py-1">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setShowCategoryDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center justify-between ${
                          selectedCategory === category.id
                            ? COLOR_PALETTE.primaryLightBg
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                              category.id === "all"
                                ? "bg-yellow-100 text-yellow-700" // New color for 'All'
                                : "bg-green-100 text-green-700" // New color for plant categories
                            }`}
                          >
                            {category.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div
                              className={`font-medium ${
                                selectedCategory === category.id
                                  ? "text-green-800" // New active text color
                                  : COLOR_PALETTE.darkText
                              }`}
                            >
                              {category.name}
                            </div>
                            <div
                              className={`text-xs ${COLOR_PALETTE.mediumText}`}
                            >
                              {category.count}{" "}
                              {category.count === 1 ? "scan" : "scans"}
                            </div>
                          </div>
                        </div>
                        {selectedCategory === category.id && (
                          <div
                            className={`w-2 h-2 ${COLOR_PALETTE.primaryBg} rounded-full`}
                          ></div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Time Range Filter */}
          {["7d", "30d", "90d", "1y"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm ${
                timeRange === range
                  ? `${COLOR_PALETTE.primaryBg} text-white hover:bg-green-700`
                  : `bg-white ${COLOR_PALETTE.darkText} border ${COLOR_PALETTE.cardBorder} hover:bg-gray-50`
              }`}
            >
              {range === "7d" && "Last 7 Days"}
              {range === "30d" && "Last 30 Days"}
              {range === "90d" && "Last 90 Days"}
              {range === "1y" && "Last Year"}
            </button>
          ))}

          {/* Export Button */}
          <button
            className={`ml-auto flex items-center space-x-2 px-4 py-2 bg-white border ${COLOR_PALETTE.cardBorder} rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-sm`}
          >
            <Download className={`w-4 h-4 ${COLOR_PALETTE.mediumText}`} />
            <span className={`font-medium ${COLOR_PALETTE.darkText}`}>
              Export
            </span>
          </button>
        </div>

        {/* Stats Cards - 3 cards in a row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`bg-white border ${
                COLOR_PALETTE.cardBorder
              } rounded-lg shadow-md p-6 ${
                stat.title === "Total Diagnoses"
                  ? "bg-gradient-to-br from-white to-yellow-50" // Subtle gradient highlight
                  : ""
              }`}
            >
              <div className="text-center">
                <p
                  className={`text-lg font-bold mb-3 ${
                    stat.title === "Total Diagnoses"
                      ? COLOR_PALETTE.secondaryDarkText // Total Diagnoses in Gold
                      : COLOR_PALETTE.darkText
                  }`}
                >
                  {stat.title}
                </p>
                <p
                  className={`text-5xl font-extrabold ${
                    stat.title === "Total Diagnoses"
                      ? COLOR_PALETTE.secondaryDarkText // Total value in Gold
                      : COLOR_PALETTE.darkText
                  }`}
                >
                  {stat.value}
                </p>
                {stat.change !== 0 && (
                  <p
                    className={`text-sm mt-2 font-medium ${
                      stat.trend === "up"
                        ? COLOR_PALETTE.successText
                        : COLOR_PALETTE.dangerText
                    }`}
                  ></p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Disease Trend - Full Width */}
        <div
          className={`bg-white border ${COLOR_PALETTE.cardBorder} rounded-lg shadow-md p-6 mb-6`}
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
                stroke="#CA8A04" // Gold (Attention)
                strokeWidth={2}
                strokeDasharray="8 4"
                name="Avg. Severity (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Two Column Layout for Pie and Bar Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Disease Distribution Pie Chart */}
          <div
            className={`bg-white border ${COLOR_PALETTE.cardBorder} rounded-lg shadow-md p-6`}
          >
            <h2
              className={`text-xl font-bold ${COLOR_PALETTE.primaryText} mb-4`}
            >
              Top Disease Distribution ({totalDiagnoses} scans)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart margin={{ top: 5, right: -20, left: 60, bottom: 5 }}>
                {/* Margin adjusted for left label visibility */}
                <Pie
                  data={diseaseDistribution}
                  cx="45%" // Shifted center slightly left
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={90} // Reduced radius slightly
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
                    `${value} Scans (${props.payload.percentage}%)`,
                    props.payload.name,
                  ]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Severity Levels Bar Chart */}
          <div
            className={`bg-white border ${COLOR_PALETTE.cardBorder} rounded-lg shadow-md p-6`}
          >
            <h2
              className={`text-xl font-bold ${COLOR_PALETTE.primaryText} mb-4`}
            >
              Disease Severity Levels
            </h2>
            <ResponsiveContainer width="100%" height={300}>
  <BarChart data={severityData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
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
      {severityData.map((entry, index) => (
        <Cell
          key={`cell-${index}`}
          fill={entry.color || COLORS[index % COLORS.length]}
        />
      ))}
    </Bar>
  </BarChart>
</ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Scans Activity - Full Width */}
        <div
          className={`bg-white border ${COLOR_PALETTE.cardBorder} rounded-lg shadow-md p-6 mb-6`}
        >
          <h2 className={`text-xl font-bold ${COLOR_PALETTE.primaryText} mb-4`}>
            Scan Activity (Last 12 Months)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyScans} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="month"
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
                dataKey="scans"
                fill="#1E4028"
                radius={[6, 6, 0, 0]}
                barSize={25}
                isAnimationActive={true} // 💡 ADDED ANIMATION
                animationDuration={1200} // 💡 ADDED DURATION
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Diagnoses Table */}
        <div
  className={`bg-white border ${COLOR_PALETTE.cardBorder} rounded-lg shadow-md p-6`}
>
  <h2 className={`text-xl font-bold ${COLOR_PALETTE.darkText} mb-4`}>
    Recent Diagnoses
  </h2>
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr
          className={`border-b ${COLOR_PALETTE.cardBorder} bg-gray-50`}
        >
          <th
            className={`text-left py-3 px-4 text-sm font-semibold ${COLOR_PALETTE.darkText} uppercase`}
          >
            Date
          </th>
          <th
            className={`text-left py-3 px-4 text-sm font-semibold ${COLOR_PALETTE.darkText} uppercase`}
          >
            Plant
          </th>
          <th
            className={`text-left py-3 px-4 text-sm font-semibold ${COLOR_PALETTE.darkText} uppercase`}
          >
            Disease
          </th>
          <th
            className={`text-left py-3 px-4 text-sm font-semibold ${COLOR_PALETTE.darkText} uppercase`}
          >
            Severity
          </th>
        </tr>
      </thead>
      <tbody>
        {recentDiagnoses.length > 0 ? (
          recentDiagnoses.map((item, index) => {
            // Determine severity color
            const getSeverityColor = (severity) => {
  if (severity <= 20) {
    return '#6A8E4E'; // Mild
  } else if (severity <= 50) {
    return '#D9A40B'; // Moderate
  } else {
    return '#A0522D'; // Severe
  }
};

const barColor = getSeverityColor(item.severity);

return (
  <tr
    key={index}
    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors`}
  >
    <td
      className={`py-3 px-4 text-sm ${COLOR_PALETTE.mediumText}`}
    >
      {item.date}
    </td>
    <td
      className={`py-3 px-4 text-sm ${COLOR_PALETTE.darkText}`}
    >
      {item.category}
    </td>
    <td
      className={`py-3 px-4 text-sm ${COLOR_PALETTE.darkText} font-medium`}
    >
      {item.disease}
    </td>
    <td className={`py-3 px-4 text-sm ${COLOR_PALETTE.darkText}`}>
      <div className="flex items-center gap-2">
        <span className="font-medium min-w-[35px]">
          {item.severity}%
        </span>
        <div className="w-20 bg-gray-200 rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full transition-all duration-300"
            style={{ 
              width: `${item.severity}%`,
              backgroundColor: barColor 
            }}
          ></div>
        </div>
      </div>
    </td>
  </tr>
);
          })
        ) : (
          <tr>
            <td
              colSpan="4"
              className={`py-12 text-center ${COLOR_PALETTE.mediumText}`}
            >
              <div className="flex flex-col items-center gap-2">
                <AlertTriangle
                  className={`w-8 h-8 ${COLOR_PALETTE.lightText}`}
                />
                <p>No recent diagnoses found</p>
              </div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>
      </div>
    </div>
  );
};

export default Dashboard;