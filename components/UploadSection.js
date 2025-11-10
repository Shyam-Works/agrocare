import React from "react";
import { Info, Loader2, Activity } from "lucide-react";
import UnifiedUploadComponent from "./UnifiedUploadComponent";

const UploadSection = ({
  user,
  imagePreview,
  uploading,
  diagnosing,
  selectedImage,
  onImageSelect,
  onClear,
  onDiagnose,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden h-full">
      <div className="p-6 border-b-2 border-red-500 flex justify-center items-center">
        <h2 className="text-xl font-bold text-gray-500 hover:text-red-500 transition-colors duration-300 cursor-pointer">
          Upload Plant Photo
        </h2>
      </div>

      <div className="p-8">
        {!user && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-3">
              <Info className="w-5 h-5 text-amber-600" />
              <p className="text-amber-700 text-sm">
                Please log in to diagnose plant diseases and access treatment
                recommendations.
              </p>
            </div>
          </div>
        )}

        <UnifiedUploadComponent
          onImageSelect={onImageSelect}
          onClear={onClear}
          imagePreview={imagePreview}
        />

        <div className="mt-6 flex items-center justify-center space-x-4">
          <button
            onClick={onDiagnose}
            disabled={uploading || diagnosing || !selectedImage || !user}
            className="px-8 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {uploading || diagnosing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{uploading ? "Uploading..." : "Analyzing..."}</span>
              </>
            ) : (
              <>
                <Activity className="w-5 h-5" />
                <span>Diagnose</span>
              </>
            )}
          </button>
          <button
            onClick={onClear}
            className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadSection;