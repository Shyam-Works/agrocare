import React from "react";
import { CheckCircle } from "lucide-react";

const DiagnosisCard = ({ image, name, probability, onSelect, isSelected }) => {
  const getSeverityLabel = (prob) => {
    if (prob >= 0.7) return "High";
    if (prob >= 0.4) return "Moderate";
    return "Mild";
  };

  const getSeverityColor = (prob) => {
    if (prob >= 0.7) return "bg-red-500";
    if (prob >= 0.4) return "bg-orange-500";
    return "bg-green-500";
  };

  const severityLabel = getSeverityLabel(probability);
  const severityColor = getSeverityColor(probability);
  const percentage = Math.round(probability * 100);

  return (
    <div
      onClick={onSelect}
      className={`flex items-center space-x-4 p-4 border-b border-gray-200 last:border-b-0 cursor-pointer transition-all ${
        isSelected
          ? "bg-blue-50 border-l-4 border-l-blue-500"
          : "hover:bg-gray-50"
      }`}
    >
      <div className="w-24 h-24 flex-shrink-0 border border-gray-300 rounded-xl overflow-hidden">
        <img src={image} alt={name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-500 mb-1">Disease Name:</p>
        <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
        <div className="mt-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Match Confidence</span>
            <span
              className={`px-2 py-1 text-xs font-medium text-white rounded-full ${severityColor}`}
            >
              {severityLabel}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${severityColor}`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <p className="text-right text-xs text-gray-500 mt-1">{percentage}%</p>
        </div>
      </div>
      {isSelected && (
        <div className="flex-shrink-0">
          <CheckCircle className="w-6 h-6 text-blue-600" />
        </div>
      )}
    </div>
  );
};

export default DiagnosisCard;