import React from "react";
import { Plus } from "lucide-react";
import DiagnosisCard from "./DiagnosisCard";
import DiseaseDetailsCard from "@/components/DiseaseDetailsCard";

const DiagnosisResults = ({
  result,
  imagePreview,
  selectedDiseaseIndex,
  diseaseDetails,
  loadingDetails,
  onDiseaseSelect,
  onSaveClick,
  currentDiagnosisId,
}) => {
  if (!result || !result.disease?.suggestions?.length) {
    return null;
  }

  // Check if disease details have been loaded (AI response received)
  const hasReceivedAIResponse = diseaseDetails && !loadingDetails;

  return (
    <>
      {/* Possible Diagnosis */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Possible Diagnosis
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Click on a disease to view detailed information and treatment options
        </p>
        <div className="space-y-0 border border-gray-200 rounded-xl overflow-hidden">
          {result.disease.suggestions.slice(0, 3).map((disease, index) => (
            <DiagnosisCard
              key={disease.id || index}
              image={disease.similar_images?.[0]?.url_small || imagePreview}
              name={disease.name}
              probability={disease.probability}
              onSelect={() => onDiseaseSelect(index)}
              isSelected={selectedDiseaseIndex === index}
            />
          ))}
        </div>
      </div>

      {/* Disease Details Section */}
      {result.disease.suggestions[selectedDiseaseIndex] && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Disease Information & Treatment
          </h2>
          <DiseaseDetailsCard
            details={diseaseDetails}
            loading={loadingDetails}
            diseaseName={result.disease.suggestions[selectedDiseaseIndex].name}
          />
        </div>
      )}

      {/* Save Button - Only show after AI response is received */}
      {hasReceivedAIResponse && (
        <div className="flex justify-center mb-8">
          <button
            onClick={onSaveClick}
            disabled={!currentDiagnosisId}
            className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span>Save to Category</span>
          </button>
        </div>
      )}
    </>
  );
};

export default DiagnosisResults;