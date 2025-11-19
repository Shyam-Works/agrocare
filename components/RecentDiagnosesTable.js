import React from "react";
import { AlertTriangle } from "lucide-react";

const COLOR_PALETTE = {
  cardBorder: "border-gray-200",
  darkText: "text-gray-900",
  mediumText: "text-gray-600",
  lightText: "text-gray-400",
};

/**
 * Renders a table of the most recent diagnoses.
 * @param {object[]} recentDiagnoses - Array of recent diagnosis objects.
 */
const RecentDiagnosesTable = ({ recentDiagnoses }) => {
  const getSeverityColor = (severity) => {
    if (severity <= 20) {
      return "#6A8E4E"; // Low - Greenish
    } else if (severity <= 50) {
      return "#D9A40B"; // Medium - Yellowish
    } else {
      return "#A0522D"; // High - Reddish-Brown
    }
  };

  return (
    <div
      className={`bg-white border ${COLOR_PALETTE.cardBorder} rounded-lg shadow-md p-6 mb-6`}
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
                    <td
                      className={`py-3 px-4 text-sm ${COLOR_PALETTE.darkText}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium min-w-[35px]">
                          {item.severity}%
                        </span>
                        <div className="w-20 bg-gray-200 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full transition-all duration-300"
                            style={{
                              width: `${item.severity}%`,
                              backgroundColor: barColor,
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
  );
};

export default RecentDiagnosesTable;