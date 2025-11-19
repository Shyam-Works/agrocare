// src/components/DashboardControls.js

import React from "react";
import { Filter, ChevronDown, Download } from "lucide-react";

// Assuming COLOR_PALETTE is passed or imported
const DashboardControls = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  timeRange,
  setTimeRange,
  currentCategoryName,
  currentCategoryCount,
  showCategoryDropdown,
  setShowCategoryDropdown,
  COLOR_PALETTE,
}) => {
  const {
    primaryBg,
    darkText,
    mediumText,
    cardBorder,
    primaryLightBg,
  } = COLOR_PALETTE;

  const timeRanges = [
    { key: "7d", label: "Last 7 Days" },
    { key: "30d", label: "Last 30 Days" },
    { key: "90d", label: "Last 90 Days" },
    { key: "1y", label: "Last Year" },
  ];

  return (
    <div className="flex items-center gap-3 mb-6">
      {/* Category Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
          className={`flex items-center space-x-2 px-4 py-2 bg-white border ${cardBorder} rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-sm`}
        >
          <Filter className={`w-4 h-4 ${mediumText}`} />
          <span className={`font-medium ${darkText}`}>
            {currentCategoryName}
          </span>
          <span
            className={`text-xs ${mediumText} bg-gray-100 px-2 py-0.5 rounded`}
          >
            {currentCategoryCount}
          </span>
          <ChevronDown
            className={`w-4 h-4 ${mediumText} transition-transform ${
              showCategoryDropdown ? "rotate-180" : ""
            }`}
          />
        </button>

        {showCategoryDropdown && (
          <div
            className={`absolute top-full mt-2 w-72 bg-white border ${cardBorder} rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto`}
          >
            {categories.length === 0 ? (
              <div
                className={`px-4 py-3 text-sm ${mediumText} text-center`}
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
                      selectedCategory === category.id ? primaryLightBg : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                          category.id === "all"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {category.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div
                          className={`font-medium ${
                            selectedCategory === category.id
                              ? "text-green-800"
                              : darkText
                          }`}
                        >
                          {category.name}
                        </div>
                        <div className={`text-xs ${mediumText}`}>
                          {category.count} {category.count === 1 ? "scan" : "scans"}
                        </div>
                      </div>
                    </div>
                    {selectedCategory === category.id && (
                      <div
                        className={`w-2 h-2 ${primaryBg} rounded-full`}
                      ></div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Time Range Buttons */}
      {timeRanges.map((range) => (
        <button
          key={range.key}
          onClick={() => setTimeRange(range.key)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm ${
            timeRange === range.key
              ? `${primaryBg} text-white hover:bg-green-700`
              : `bg-white ${darkText} border ${cardBorder} hover:bg-gray-50`
          }`}
        >
          {range.label}
        </button>
      ))}

      {/* Export Button */}
      <button
        className={`ml-auto flex items-center space-x-2 px-4 py-2 bg-white border ${cardBorder} rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-sm`}
      >
        <Download className={`w-4 h-4 ${mediumText}`} />
        <span className={`font-medium ${darkText}`}>Export</span>
      </button>
    </div>
  );
};

export default DashboardControls;