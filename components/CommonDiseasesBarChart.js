import React from "react";
import { Loader2 } from "lucide-react";

const CommonDiseasesBarChart = ({ city, diseases, loading }) => {
  if (!city) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 h-full flex items-center justify-center min-h-[300px]">
        <p className="text-gray-500 text-center">
          Login to see common diseases in your area.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 h-full flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
          <p className="text-gray-500 text-center">Loading disease data...</p>
        </div>
      </div>
    );
  }

  if (diseases.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 h-full flex items-center justify-center min-h-[300px]">
        <p className="text-gray-500 text-center">
          No disease data available for your area.
        </p>
      </div>
    );
  }

  const maxCount = diseases.length > 0 ? diseases[0].count : 1;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 h-full">
      <h2 className="text-3xl font-bold text-gray-800 mb-1 flex justify-center items-center space-x-2">
        <span>Top Plant Diseases in {city}</span>
      </h2>

      <p className="text-sm text-gray-500 flex justify-center items-center mb-10">
        Based on recent diagnoses and regional data.
      </p>

      <div className="flex justify-around items-end h-64 border-b-2 border-l-2 border-gray-300 pb-1">
        {diseases
          .slice(0, 4)
          .sort((a, b) => b.percentage - a.percentage)
          .map((disease, index) => {
            const barHeightPercentage = Math.max(5, disease.percentage);

            return (
              <div
                key={disease.name}
                className="flex flex-col items-center justify-end w-1/4 h-full px-2 relative"
              >
                <div className="relative w-full h-full flex flex-col justify-end items-center">
                  <span className="text-sm font-semibold text-gray-700 mb-1">
                    {disease.percentage}%
                  </span>

                  <div
                    className="bg-red-500 w-1/3 rounded-t-lg transition-all duration-700 cursor-pointer hover:bg-red-600"
                    style={{ height: `${barHeightPercentage}%` }}
                  ></div>
                </div>

                <p
                  className="text-xs text-gray-700 font-medium text-center mt-2 w-full truncate"
                  title={disease.name}
                >
                  {disease.name.split(" ").slice(0, 2).join(" ")}
                </p>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default CommonDiseasesBarChart;