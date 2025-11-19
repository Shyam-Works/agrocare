// src/components/StatsCard.js

import React from "react";

const StatsCard = ({ title, value, colorPalette }) => {
  const isTotalDiagnoses = title === "Total Diagnoses";
  const { secondaryDarkText, darkText, cardBorder } = colorPalette;

  return (
    <div
      className={`bg-white border ${cardBorder} rounded-lg shadow-md p-6 ${
        isTotalDiagnoses ? "bg-gradient-to-br from-white to-yellow-50" : ""
      }`}
    >
      <div className="text-center">
        <p
          className={`text-lg font-bold mb-3 ${
            isTotalDiagnoses ? secondaryDarkText : darkText
          }`}
        >
          {title}
        </p>
        <p
          className={`text-5xl font-extrabold ${
            isTotalDiagnoses ? secondaryDarkText : darkText
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
};

export default StatsCard;