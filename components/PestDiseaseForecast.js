// components/PestDiseaseForecast.js

import React, { useState, useEffect } from "react";
import { Leaf, AlertTriangle, Droplet, CloudRain, TrendingUp } from "lucide-react";

export default function PestDiseaseForecast({ selectedCategory, timeRange }) {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Toggle this to switch between test and production API
  const USE_TEST_API = false; // Set to true for testing without OpenAI

  useEffect(() => {
    fetchForecast();
  }, [selectedCategory]);

  const fetchForecast = async () => {
    setLoading(true);
    setError(null);

    try {
      // Use test API or production API
      const endpoint = USE_TEST_API
        ? `/api/dashboard/pest-forecast-test?categoryId=${selectedCategory}&days=3`
        : `/api/dashboard/pest-forecast?categoryId=${selectedCategory}&days=3`;
     
      console.log("Fetching forecast from:", endpoint);
     
      const response = await fetch(endpoint);
     
      const data = await response.json();
     
      // Log full response for debugging
      console.log("API Response:", data);
     
      if (!response.ok) {
        console.error("API Error Response:", data);
        throw new Error(data.message || data.error || "Failed to fetch forecast");
      }
     
      if (data.success && data.forecast) {
        setForecast(data.forecast);
      } else {
        setError(data.message || "No forecast data available");
      }
    } catch (err) {
      console.error("Forecast fetch error:", err);
      setError(err.message || "Unable to load forecast");
    } finally {
      setLoading(false);
    }
  };

  const getRiskConfig = (level) => {
    switch (level?.toLowerCase()) {
      case "low":
        return {
          color: "#22C55E",
          bgColor: "#F0FDF4",
          textColor: "#166534",
          label: "Low Risk"
        };
      case "medium":
        return {
          color: "#EAB308",
          bgColor: "#FEFCE8",
          textColor: "#854D0E",
          label: "Medium Risk"
        };
      case "high":
        return {
          color: "#EF4444",
          bgColor: "#FEF2F2",
          textColor: "#991B1B",
          label: "High Risk"
        };
      default:
        return {
          color: "#94A3B8",
          bgColor: "#F8FAFC",
          textColor: "#475569",
          label: "Unknown Risk"
        };
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-3 text-gray-600">
            <svg
              className="animate-spin h-5 w-5 text-green-700"
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
            <span className="text-sm">Analyzing plant health...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !forecast) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-3">
          <Leaf className="h-5 w-5 text-green-700" />
          <h3 className="text-lg font-semibold text-gray-900">
            Pest & Disease Forecast
          </h3>
        </div>
        <div className="text-center py-6 text-gray-500">
          <AlertTriangle className="h-10 w-10 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">{error || "No forecast available"}</p>
        </div>
      </div>
    );
  }

  const riskConfig = getRiskConfig(forecast.risk_level);
  const avgRisk = Math.round(
    forecast.risk_trend.reduce((sum, day) => sum + day.risk, 0) / forecast.risk_trend.length
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mt-4">
      <style>{`
        @keyframes rotateBorder {
          0% { background-position: 0% 50%; }
          100% { background-position: 400% 50%; }
        }
        
        .ai-border-wrapper {
          position: relative;
          border-radius: 0.75rem;
          padding: 1.5px;
          background: linear-gradient(90deg, #0eaa76 0%, #06b6d4 25%, #3b57f6 50%, #06b6d4 75%, #10b981 100%);
          background-size: 400% 100%;
          animation: rotateBorder 4s linear infinite;
          
        }
        
        .ai-border-content {
          background-color: #ffffff;
          border-radius: 0.65rem;
          padding: 0.875rem;
          position: relative;
          z-index: 1;
          min-height: 140px;
        }
      `}</style>

      {/* Compact Header */}
      <div className="flex items-center space-x-2 mb-4">
        <div className="p-1.5 rounded-lg bg-green-50">
          <Leaf className="h-4 w-4 text-green-700" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900">Pest & Disease Forecast</h3>
          <p className="text-xs text-gray-500">AI-powered 3-day insights</p>
        </div>
      </div>

      {/* Compact Top Section: Risk + Summary + Weather in One Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
        
        {/* Risk Level - More Compact */}
        <div className="rounded-lg p-3 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600">Risk Level</span>
            <span className="text-lg font-bold" style={{ color: riskConfig.textColor }}>
              {avgRisk}%
            </span>
          </div>
          <div className="relative w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="absolute inset-0 flex">
              <div className="flex-1 bg-green-500"></div>
              <div className="flex-1 bg-yellow-500"></div>
              <div className="flex-1 bg-orange-500"></div>
              <div className="flex-1 bg-red-500"></div>
            </div>
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow transition-all duration-500"
              style={{ left: `${avgRisk}%`, transform: 'translateX(-50%)' }}
            ></div>
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-400">
            <span>Low</span>
            <span className="text-xs font-medium" style={{ color: riskConfig.textColor }}>
              {riskConfig.label}
            </span>
            <span>High</span>
          </div>
        </div>

        {/* Summary - Compact with Animated Border */}
        <div className="ai-border-wrapper">
          <div className="ai-border-content">
            <h4 className="text-xs font-semibold text-gray-700 mb-1.5">AI Summary</h4>
            <p className="text-xs text-gray-600 leading-relaxed line-clamp-5">
              {forecast.summary}
            </p>
          </div>
        </div>

        {/* Weather - Compact */}
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
          <div className="flex items-start space-x-2">
            <CloudRain className="h-3.5 w-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-1">Weather Impact</h4>
              <p className="text-xs text-gray-600 leading-relaxed line-clamp-5">
                {forecast.weather_impact || "No significant impact expected"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Actions Grid - 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
        {/* Treatments - Subtle & Compact */}
        {forecast.recommended_chemicals && forecast.recommended_chemicals.length > 0 && (
          <div className="rounded-lg p-3 border border-blue-100/50">
            <div className="flex items-center space-x-1.5 mb-2">
              <Droplet className="h-3.5 w-3.5 text-blue-600" />
              <h4 className="text-xs font-semibold text-gray-800">Treatments</h4>
            </div>
            <div className="space-y-1.5">
              {forecast.recommended_chemicals.map((chemical, idx) => (
                <div key={idx} className="bg-white rounded px-2.5 py-1.5 text-xs text-gray-700  flex items-center">
                  <span className="w-1 h-1 bg-blue-500 rounded-full mr-2 flex-shrink-0"></span>
                  <span>{chemical}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preventive Actions - Subtle & Compact */}
        {forecast.preventive_actions && forecast.preventive_actions.length > 0 && (
          <div className="rounded-lg p-3 border border-green-100/50">
            <div className="flex items-center space-x-1.5 mb-2">
              <TrendingUp className="h-3.5 w-3.5 text-green-600" />
              <h4 className="text-xs font-semibold text-gray-800">Preventive Actions</h4>
            </div>
            <div className="space-y-1.5">
              {forecast.preventive_actions.map((action, idx) => (
                <div key={idx} className="bg-white rounded px-2.5 py-1.5 text-xs text-gray-700flex items-start">
                  <span className="text-green-600 mr-1.5 flex-shrink-0 text-xs">✓</span>
                  <span>{action}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Diseases to Watch - Compact */}
      {forecast.diseases_to_watch && forecast.diseases_to_watch.length > 0 && (
        <div className="bg-orange-100/30 rounded-lg p-3 border border-orange-100">
          <div className="flex items-center space-x-1.5 mb-2">
            <AlertTriangle className="h-3.5 w-3.5 text-orange-600" />
            <h4 className="text-xs font-semibold text-gray-800">Diseases to Watch</h4>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {forecast.diseases_to_watch.map((disease, idx) => (
              <div key={idx} className="rounded-lg p-2.5 border border-orange-100">
                <div className="font-medium text-xs text-gray-900 mb-0.5">
                  {disease.name}
                </div>
                <div className="text-xs text-gray-600 leading-snug">
                  {disease.reason}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}