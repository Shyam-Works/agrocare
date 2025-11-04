import React from "react";
import {
  Loader2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
  Droplets,
  Sun,
  Activity,
  Info,
  AlertCircle,
  Percent,
} from "lucide-react";
import { motion } from "framer-motion";

const DiseaseDetailsCard = ({ details, loading, diseaseName }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <div className="flex items-center justify-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin text-red-600" />
          <p className="text-gray-600 font-medium">
            Loading disease information...
          </p>
        </div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="bg-gray-50 rounded-2xl shadow-lg border border-gray-200 p-8">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No disease information available</p>
        </div>
      </div>
    );
  }

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 border-red-300";
      case "medium":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "low":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getUrgencyIcon = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case "high":
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case "medium":
        return <Activity className="w-5 h-5 text-orange-600" />;
      case "low":
        return <Shield className="w-5 h-5 text-green-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  // Get severity colors based on percentage
  const getSeverityColorsForPercentage = (percentage) => {
    if (percentage >= 70) {
      return {
        bg: "from-red-50 to-red-100",
        border: "border-red-300",
        text: "text-red-800",
        icon: "text-red-600",
        gradient: "from-red-500 to-red-600",
        badge: "bg-red-100 text-red-800",
      };
    } else if (percentage >= 40) {
      return {
        bg: "from-orange-50 to-orange-100",
        border: "border-orange-300",
        text: "text-orange-800",
        icon: "text-orange-600",
        gradient: "from-orange-500 to-red-500",
        badge: "bg-orange-100 text-orange-800",
      };
    } else {
      return {
        bg: "from-green-50 to-green-100",
        border: "border-green-300",
        text: "text-green-800",
        icon: "text-green-600",
        gradient: "from-green-500 to-green-600",
        badge: "bg-green-100 text-green-800",
      };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Description and Severity Box - Side by side on desktop, stacked on mobile */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Disease Name and Description Box */}
        <div className="flex-1 max-w-5xl bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 border border-red-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {diseaseName}
          </h2>
          <p className="text-gray-700 leading-relaxed">
            {details.description}
          </p>
          {details.reference_link && (
            <a
              href={details.reference_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-block mt-2 hover:underline"
            >
              Learn more →
            </a>
          )}
        </div>

        {/* Separate Severity Box */}
        {details.severity_assessment ? (
          (() => {
            const { affected_percentage, severity_level } = details.severity_assessment;
            const colors = getSeverityColorsForPercentage(affected_percentage);
            
            return (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className={`flex-shrink-0  md:w-48 h-46 rounded-xl border-2 ${colors.border} bg-white shadow-md flex flex-col items-center justify-center p-4`}
              >
                <p className="text-md text-gray-600 font-medium uppercase tracking-wide">
                  Severity
                </p>
                <p className={`text-md font-semibold ${colors.text} mb-3 capitalize`}>
                  {severity_level}
                </p>
                <div className={`text-5xl font-bold ${colors.text} leading-none`}>
                  {affected_percentage}
                </div>
                
              </motion.div>
            );
          })()
        ) : details.severity_level ? (
          <div
            className={`flex-shrink-0 w-full md:w-36 h-36 rounded-xl border-2 font-semibold text-sm flex items-center justify-center text-center px-2 ${getSeverityColor(
              details.severity_level
            )}`}
          >
            {details.severity_level.toUpperCase()} SEVERITY
          </div>
        ) : null}
      </div>

      {/* Two Column Layout */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column - Symptoms & Causes */}
        <div className="space-y-6">
          {/* Symptoms */}
          {details.symptoms && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <span>Symptoms</span>
              </h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">
                    Early Signs
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {details.symptoms.early_signs}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">
                    Advanced Stage
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {details.symptoms.advanced_stage}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">
                    Affected Parts
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {details.symptoms.affected_parts}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Causes */}
          {details.causes && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
                <Activity className="w-6 h-6 text-orange-600" />
                <span>What Causes It</span>
              </h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">
                    Primary Cause
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {details.causes.primary_cause}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">
                    Favorable Conditions
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {details.causes.favorable_conditions}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">
                    Transmission
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {details.causes.transmission}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Why It Happens */}
          {details.why_it_happens && details.why_it_happens.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
                <Info className="w-6 h-6 text-blue-600" />
                <span>Why It Happens</span>
              </h3>
              <ul className="space-y-2">
                {details.why_it_happens.map((reason, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column - Treatment & Prevention */}
        <div className="space-y-6">
          {/* Treatment Solutions */}
          {details.treatment_solutions &&
            details.treatment_solutions.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
                  <Shield className="w-6 h-6 text-green-600" />
                  <span>Treatment Solutions</span>
                </h3>
                <div className="space-y-4">
                  {details.treatment_solutions.map((solution, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start space-x-3">
                        {getUrgencyIcon(solution.urgency)}
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 mb-1">
                            {solution.title}
                          </h4>
                          <p className="text-gray-600 text-sm">
                            {solution.description}
                          </p>
                          {solution.urgency && (
                            <span
                              className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                                solution.urgency === "high"
                                  ? "bg-red-100 text-red-700"
                                  : solution.urgency === "medium"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {solution.urgency.toUpperCase()} PRIORITY
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Prevention Tips */}
          {details.prevention_tips && details.prevention_tips.length > 0 && (
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl shadow-lg border border-green-200 p-6">
              <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center space-x-2">
                <Shield className="w-6 h-6 text-green-600" />
                <span>Prevention Tips</span>
              </h3>
              <ul className="space-y-2">
                {details.prevention_tips.map((tip, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recovery Time */}
          {details.recovery_time && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <Clock className="w-6 h-6 text-blue-600 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-blue-900 mb-1">
                    Recovery Time
                  </h4>
                  <p className="text-blue-800 text-sm">
                    {details.recovery_time}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default DiseaseDetailsCard;