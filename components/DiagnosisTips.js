import React from "react";
import { Info, CheckCircle } from "lucide-react";

const DiagnosisTips = () => (
  <div className="max-w-7xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
    <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center space-x-2">
      <Info className="w-5 h-5" />
      <span>Tips for Better Disease Diagnosis</span>
    </h3>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm text-blue-700">
      <div className="space-y-3">
        <div className="flex items-start space-x-2">
          <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-1" />
          <span>
            <strong>Focus on diseased</strong> or affected areas
          </span>
        </div>
        <div className="flex items-start space-x-2">
          <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-1" />
          <span>Include leaves, stems, or fruits showing symptoms</span>
        </div>
        <div className="flex items-start space-x-2">
          <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-1" />
          <span>
            Take <strong>multiple angles</strong> if possible
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-start space-x-2">
          <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-1" />
          <span>
            Ensure <strong>good lighting</strong> and sharp focus
          </span>
        </div>
        <div className="flex items-start space-x-2">
          <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-1" />
          <span>
            Avoid heavily <strong>cluttered backgrounds</strong>
          </span>
        </div>
        <div className="flex items-start space-x-2">
          <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-1" />
          <span>
            Use <strong>high-resolution</strong> images for better analysis
          </span>
        </div>
      </div>
    </div>
  </div>
);

export default DiagnosisTips;