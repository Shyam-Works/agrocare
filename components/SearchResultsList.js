// src/components/SearchResultsList.js

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Loader2, Leaf, Bug, Info} from "lucide-react";
import PlantCard from "./PlantCard";
import { ANIMATION_VARIANTS, COLOR_PALETTE } from "../utils/constants";

/**
 * SearchResultsList component handles the display of identification results,
 * including loading, error, and empty states.
 */
const SearchResultsList = ({
  result,
  searchResults,
  loading,
  error,
  activeTab,
  showSearchResults,
}) => {
  const containerClass = "w-full space-y-4";
  const content = (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-md mt-6"
          >
            <Loader2 className={`w-8 h-8 ${COLOR_PALETTE.primaryText} animate-spin mb-4`} />
            <p className={`text-lg font-semibold ${COLOR_PALETTE.primaryText}`}>
              Processing {activeTab.slice(0, -1)} identification...
            </p>
            <p className="text-sm text-gray-500 mt-1">
              This may take a few moments.
            </p>
          </motion.div>
        )}

        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`flex flex-col items-center justify-center p-8 ${COLOR_PALETTE.dangerLightBg} border border-${COLOR_PALETTE.danger} rounded-xl mt-6`}
          >
            <AlertCircle className={`w-8 h-8 ${COLOR_PALETTE.dangerText} mb-3`} />
            <p className={`text-lg font-semibold ${COLOR_PALETTE.dangerText}`}>
              Identification Error
            </p>
            <p className="text-sm text-gray-600 mt-1 text-center">
              {error}
            </p>
          </motion.div>
        )}

        {showSearchResults && !loading && !error && (
          <motion.div
            key="results"
            variants={ANIMATION_VARIANTS.container}
            initial="hidden"
            animate="visible"
            className="w-full mt-6 space-y-6"
          >
            {/* Main Result */}
            {result && (
              <div className="space-y-4">
                <h2 className={`text-xl font-bold ${COLOR_PALETTE.darkText} flex items-center`}>
                    <Leaf className="w-5 h-5 mr-2 text-green-700" />
                    Primary Match
                </h2>
                <PlantCard
                  plant={result}
                  isMainResult={true}
                  activeTab={activeTab}
                />
              </div>
            )}

            {/* Similar Results */}
            {searchResults?.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <h3 className={`text-xl font-bold ${COLOR_PALETTE.darkText} flex items-center`}>
                    <Bug className="w-5 h-5 mr-2 text-amber-600" />
                    Other Potential Matches ({searchResults.length})
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {searchResults.map((plant, index) => (
                    <PlantCard
                      key={index}
                      plant={plant}
                      isMainResult={false}
                      activeTab={activeTab}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* No Results Message */}
            {!result && searchResults?.length === 0 && (
              <motion.div
                key="no-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`p-10 text-center bg-gray-50 rounded-xl border border-gray-200 mt-6`}
              >
                <Info className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-700">
                  No Matches Found
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Try another image or refine your search query.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return <div className={containerClass}>{content}</div>;
};

export default SearchResultsList;