// src/pages/Dashboard.js (Updated with Pest Forecast)

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Weather from "@/components/Weather";
import DiseaseTrendChart from "@/components/DiseaseTrendChart";
import DiseaseDistributionPie from "@/components/DiseaseDistributionPie";
import SeverityBarChart from "@/components/SeverityBarChart";
import RecentDiagnosesTable from "@/components/RecentDiagnosesTable";
import StatsCard from "@/components/StatsCard";
import DashboardControls from "@/components/DashboardControls";
import PestDiseaseForecast from "@/components/PestDiseaseForecast"; // NEW IMPORT
import { useSession } from "next-auth/react";
import ChatBot from "@/components/Chatbot";

export default function Dashboard() {
  const { data: session } = useSession();
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const COLOR_PALETTE = {
    primary: "green-800",
    primaryText: "text-green-800",
    primaryBg: "bg-green-800",
    primaryLightBg: "bg-green-50",
    secondary: "yellow-600",
    secondaryText: "text-yellow-600",
    secondaryDarkText: "text-yellow-700",
    danger: "red-700",
    dangerText: "text-red-700",
    success: "green-500",
    successText: "text-green-500",
    attention: "orange-500",
    background: "bg-gray-100",
    cardBorder: "border-gray-200",
    darkText: "text-gray-900",
    mediumText: "text-gray-600",
    lightText: "text-gray-400",
    darkGreen: "text-green-900",
    RECHARTS_COLORS: ["#1E4028", "#D9A40B", "#6A8E4E", "#A0522D", "#4682B4"],
  };

  // --- States ---
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [timeRange, setTimeRange] = useState("30d");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [categories, setCategories] = useState([]);
  const [diseaseTrendData, setDiseaseTrendData] = useState([]);
  const [diseaseDistribution, setDiseaseDistribution] = useState([]);
  const [severityData, setSeverityData] = useState([]);
  const [monthlyScans, setMonthlyScans] = useState([]);
  const [recentDiagnoses, setRecentDiagnoses] = useState([]);

  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  // --- Fetch Weather ---
  const fetchWeatherData = async () => {
    try {
      const res = await fetch("/api/weather/forcast/");
      if (!res.ok) throw new Error("Failed to fetch weather");
      const data = await res.json();
      setWeatherData(data);
    } catch (error) {
      console.error("Weather fetch error:", error);
    } finally {
      setWeatherLoading(false);
    }
  };

  // --- Fetch Dashboard Data ---
  const fetchDashboardData = async () => {
    setLoading(true);

    const query = new URLSearchParams({
      timeRange: timeRange,
      categoryId: selectedCategory,
    }).toString();

    try {
      const res = await fetch(`/api/dashboard/data?${query}`);
      if (!res.ok) throw new Error("Failed to fetch dashboard data");

      const data = await res.json();
      const totalDiagnosesCount = parseInt(
        data.stats.find((s) => s.title === "Total Diagnoses")?.value || 0
      );

      const allPlantsCategory = {
        id: "all",
        name: "All Plants",
        count: totalDiagnosesCount,
      };

      const apiCategories = Array.isArray(data.categories)
        ? data.categories
        : [];
      const finalCategories = [allPlantsCategory, ...apiCategories];

      setStats(data.stats || []);
      setCategories(finalCategories);
      setDiseaseTrendData(data.diseaseTrendData || []);
      setDiseaseDistribution(data.diseaseDistribution || []);
      setSeverityData(data.severityData || []);
      setMonthlyScans(data.monthlyScans || []);
      setRecentDiagnoses(data.recentDiagnoses || []);
    } catch (error) {
      console.error("❌ Error fetching dashboard data:", error);
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

  useEffect(() => {
    fetchDashboardData();
    fetchWeatherData();
  }, [timeRange, selectedCategory]);

  // --- Derived values ---
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

  // --- Loading State ---
  if (loading) {
    return (
      <div className={`min-h-screen ${COLOR_PALETTE.background}`}>
        <style>{`
        @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
    animation: fadeIn 0.6s ease-out;
}

.animate-fade-in-delayed {
    animation: fadeIn 0.6s ease-out 0.2s both;
}
      `}</style>
        <Navbar />
        <div
          className="flex flex-col items-center justify-center px-4 py-12 md:px-6"
          style={{ fontFamily: '"Open Sans", sans-serif' }}
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
      </div>
    );
  }

  // --- Main Render ---
  return (
    <div className={`min-h-screen ${COLOR_PALETTE.background}`}>
      <Navbar />

      <div
        className="max-w-7xl mx-auto px-6 py-6"
        style={{
          fontFamily: '"Open Sans", sans-serif',
          fontOpticalSizing: "auto",
          fontWeight: 900,
          fontStyle: "normal",
        }}
      >
        {/* Header and Weather Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 items-start mb-6 gap-6 w-full px-0 md:px-8 pt-2">
          {/* Left Section - Dashboard Heading */}
          <div className="pl-6">
            <h1
              className={`text-4xl font-bold ${COLOR_PALETTE.primaryText} mb-1`}
            >
              Dashboard
            </h1>
            <p className={`text-md ${COLOR_PALETTE.mediumText}`}>
              Overview of your plant health monitoring and disease tracking
            </p>

            {session?.user && (
              <div className="flex items-start gap-1 mt-4">
                {" "}
                {/* Changed items-center to items-start for initial alignment */}
                {/* Leafy Mascot with Animation - INCREASED SIZE CLASSES AND ADDED translate-y-4 */}
                <div className="relative w-16 h-16 md:w-32 md:h-32 flex-shrink-0 translate-y-8">
                  {" "}
                  {/* Added translate-y-4 here */}
                  <img
                    src="/leafy-removebg.png"
                    alt="Leafy Mascot"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="relative">
                  {/* Speech Bubble */}
                  <div
                    className={`${COLOR_PALETTE.primaryBg} text-white px-5 py-3 rounded-2xl rounded-bl-none shadow-lg relative`}
                  >
                    <h1 className="text-xl font-extrabold">
                      {greeting},{" "}
                      {session.user.first_name
                        ? session.user.first_name
                        : session.user.name?.split(" ")[0] || "User"}
                      ! 👋
                    </h1>
                    <p className="text-xs opacity-90 mt-1">
                      Let&apos;s check your plants today!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Section - Weather */}
          <div className="flex justify-end pr-6">
            <Weather />
          </div>
        </div>

        {/* Filters */}
        <DashboardControls
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          timeRange={timeRange}
          setTimeRange={setTimeRange}
          currentCategoryName={currentCategoryName}
          currentCategoryCount={currentCategoryCount}
          showCategoryDropdown={showCategoryDropdown}
          setShowCategoryDropdown={setShowCategoryDropdown}
          COLOR_PALETTE={COLOR_PALETTE}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {stats.map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              colorPalette={COLOR_PALETTE}
            />
          ))}
        </div>

        {/* Disease Trend Chart */}
        <DiseaseTrendChart
          diseaseTrendData={diseaseTrendData}
          trendRangeText={trendRangeText}
        />

        {/* Two Column Layout (Distribution + Severity) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <DiseaseDistributionPie
            diseaseDistribution={diseaseDistribution}
            totalDiagnoses={totalDiagnoses}
          />
          <SeverityBarChart severityData={severityData} />
        </div>

        {/* Recent Diagnoses Table */}
        <RecentDiagnosesTable recentDiagnoses={recentDiagnoses} />

        {/* NEW: AI Pest & Disease Forecast - FULL WIDTH */}
        <div className="">
          <PestDiseaseForecast
            selectedCategory={selectedCategory}
            timeRange={timeRange}
          />
        </div>
        <ChatBot />
      </div>
    </div>
  );
}
