import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Camera, AlertCircle, Heart, Lightbulb, Sparkles, Sprout, Sun } from 'lucide-react';

const detailVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 50, damping: 10, duration: 0.8 },
  },
};

// Helper function to safely render text content
const safeRenderText = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'object') {
    return value.value || value.name || value.text || '';
  }
  return String(value);
};

const InsectDetailsCard = ({ details, loading, insectName }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-2xl p-12 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4 animate-pulse">
          <Loader2 className="w-8 h-8 animate-spin text-amber-700" />
          <p className="text-xl font-semibold text-gray-600">
            Gathering Intelligence on{" "}
            <span className="font-bold text-amber-700">
              {insectName || "this species"}
            </span>
            ...
          </p>
        </div>
      </div>
    );
  }

  if (!details) return null;

  return (
    <motion.div
      variants={detailVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto space-y-10"
    >
      {/* Header Section */}
      <div className="bg-gradient-to-br from-amber-800 to-amber-950 rounded-3xl shadow-2xl p-12 text-white">
        <div className="flex items-center space-x-4 mb-4">
          <h1 className="text-5xl font-extrabold">{insectName}</h1>
        </div>
        
        {details.common_names && Array.isArray(details.common_names) && details.common_names.length > 0 && (
          <div className="mb-4">
            <span className="text-amber-200 text-sm font-semibold">Common Names: </span>
            <span className="text-white text-lg">
              {details.common_names.map((name, idx) => (
                <React.Fragment key={idx}>
                  {safeRenderText(name)}
                  {idx < details.common_names.length - 1 ? ', ' : ''}
                </React.Fragment>
              ))}
            </span>
          </div>
        )}
        
        {details.description && (
          <p className="text-amber-200 text-lg leading-relaxed mt-4 border-l-4 border-amber-600 pl-4">
            {safeRenderText(details.description)}
          </p>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:items-stretch">
        {/* Left Column */}
        <div className="lg:w-2/5 space-y-8 flex flex-col">
          
          {/* Appearance */}
          {details.appearance && (
            <div className="bg-sand-50 rounded-3xl shadow-lg border border-sand-200 p-8 transform hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center space-x-3 mb-4 border-b pb-3 border-sand-200">
                <div className="w-10 h-10 bg-sand-200 rounded-lg flex items-center justify-center shadow-inner">
                  <Camera className="w-6 h-6 text-amber-800" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900">
                  Physical Characteristics
                </h2>
              </div>
              <div className="space-y-4">
                {details.appearance.body && (
                  <div className="bg-white p-3 rounded-xl border border-sand-200 transition-all duration-300 hover:border-amber-600">
                    <span className="font-bold text-amber-800 block mb-1 text-sm uppercase tracking-wider">
                      Body Structure:
                    </span>
                    <p className="text-gray-700 leading-snug">
                      {safeRenderText(details.appearance.body)}
                    </p>
                  </div>
                )}
                {details.appearance.colors && (
                  <div className="bg-white p-3 rounded-xl border border-sand-200 transition-all duration-300 hover:border-amber-600">
                    <span className="font-bold text-orange-700 block mb-1 text-sm uppercase tracking-wider">
                      Colors & Patterns:
                    </span>
                    <p className="text-gray-700 leading-snug">
                      {safeRenderText(details.appearance.colors)}
                    </p>
                  </div>
                )}
                {details.appearance.distinctive_features && (
                  <div className="bg-white p-3 rounded-xl border border-sand-200 transition-all duration-300 hover:border-amber-600">
                    <span className="font-bold text-yellow-700 block mb-1 text-sm uppercase tracking-wider">
                      Distinctive Features:
                    </span>
                    <p className="text-gray-700 leading-snug">
                      {safeRenderText(details.appearance.distinctive_features)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Habitat & Distribution */}
          {details.habitat_and_distribution && (
            <div className="bg-blue-50 rounded-3xl shadow-lg border border-blue-200 p-8 transform hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center space-x-3 mb-4 border-b pb-3 border-blue-200">
                <div className="w-10 h-10 bg-blue-200 rounded-lg flex items-center justify-center shadow-inner">
                  <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900">
                  Habitat & Distribution
                </h2>
              </div>
              <div className="space-y-3">
                {details.habitat_and_distribution.preferred_habitat && (
                  <div>
                    <span className="font-bold text-blue-800 block mb-1 text-sm">Preferred Habitat:</span>
                    <p className="text-gray-700 leading-snug">
                      {safeRenderText(details.habitat_and_distribution.preferred_habitat)}
                    </p>
                  </div>
                )}
                {details.habitat_and_distribution.geographic_distribution && (
                  <div>
                    <span className="font-bold text-blue-800 block mb-1 text-sm">Geographic Range:</span>
                    <p className="text-gray-700 leading-snug">
                      {safeRenderText(details.habitat_and_distribution.geographic_distribution)}
                    </p>
                  </div>
                )}
                {details.habitat_and_distribution.climate_preference && (
                  <div>
                    <span className="font-bold text-blue-800 block mb-1 text-sm">Climate:</span>
                    <p className="text-gray-700 leading-snug">
                      {safeRenderText(details.habitat_and_distribution.climate_preference)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Lifecycle */}
          {details.lifecycle && (
            <div className="bg-purple-50 rounded-3xl shadow-lg border border-purple-200 p-8 transform hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center space-x-3 mb-4 border-b pb-3 border-purple-200">
                <div className="w-10 h-10 bg-purple-200 rounded-lg flex items-center justify-center shadow-inner">
                  <Sprout className="w-6 h-6 text-purple-700" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900">
                  Life Cycle
                </h2>
              </div>
              <div className="space-y-3">
                {details.lifecycle.stages && (
                  <div>
                    <span className="font-bold text-purple-800 block mb-1 text-sm">Stages:</span>
                    <p className="text-gray-700 leading-snug">
                      {safeRenderText(details.lifecycle.stages)}
                    </p>
                  </div>
                )}
                {details.lifecycle.duration && (
                  <div>
                    <span className="font-bold text-purple-800 block mb-1 text-sm">Duration:</span>
                    <p className="text-gray-700 leading-snug">
                      {safeRenderText(details.lifecycle.duration)}
                    </p>
                  </div>
                )}
                {details.lifecycle.breeding_season && (
                  <div>
                    <span className="font-bold text-purple-800 block mb-1 text-sm">Breeding Season:</span>
                    <p className="text-gray-700 leading-snug">
                      {safeRenderText(details.lifecycle.breeding_season)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="lg:w-3/5 space-y-8 flex flex-col">
          
          {/* Agricultural Impact */}
          {details.impact_on_agriculture && (
            <div className="bg-red-50 rounded-3xl shadow-lg border border-red-200 p-8 transform hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center space-x-3 mb-4 border-b pb-3 border-red-200">
                <div className="w-10 h-10 bg-red-200 rounded-lg flex items-center justify-center shadow-inner">
                  <AlertCircle className="w-6 h-6 text-red-700" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900">
                  Impact on Agriculture
                </h2>
              </div>
              <div className="space-y-4">
                {details.impact_on_agriculture.pest_status && (
                  <div className="bg-white p-4 rounded-xl border border-red-100">
                    <span className="font-bold text-red-800 block mb-2">Pest Status:</span>
                    <p className="text-gray-700">
                      {safeRenderText(details.impact_on_agriculture.pest_status)}
                    </p>
                  </div>
                )}
                
                {details.impact_on_agriculture.affected_plants && Array.isArray(details.impact_on_agriculture.affected_plants) && details.impact_on_agriculture.affected_plants.length > 0 && (
                  <div className="bg-white p-4 rounded-xl border border-red-100">
                    <span className="font-bold text-red-800 block mb-2">Commonly Affected Plants:</span>
                    <div className="flex flex-wrap gap-2">
                      {details.impact_on_agriculture.affected_plants.map((plant, idx) => (
                        <span key={idx} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                          {safeRenderText(plant)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {details.impact_on_agriculture.type_of_damage && (
                  <div className="bg-white p-4 rounded-xl border border-red-100">
                    <span className="font-bold text-red-800 block mb-2">Type of Damage:</span>
                    <p className="text-gray-700">
                      {safeRenderText(details.impact_on_agriculture.type_of_damage)}
                    </p>
                  </div>
                )}
                
                {details.impact_on_agriculture.damage_signs && (
                  <div className="bg-white p-4 rounded-xl border border-red-100">
                    <span className="font-bold text-red-800 block mb-2">Damage Signs:</span>
                    <p className="text-gray-700">
                      {safeRenderText(details.impact_on_agriculture.damage_signs)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Management for Gardeners */}
          {details.management_for_gardeners && Array.isArray(details.management_for_gardeners) && details.management_for_gardeners.length > 0 && (
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 transform hover:shadow-2xl transition-shadow duration-300">
              <div className="flex items-center space-x-3 mb-4 border-b pb-3 border-gray-200">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shadow-inner">
                  <Lightbulb className="w-6 h-6 text-green-700" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900">
                  Management Guide
                </h2>
              </div>
              <div className="space-y-4">
                {details.management_for_gardeners.map((tip, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-4 p-4 bg-gray-50 rounded-2xl transition-all duration-300 border border-gray-100 hover:bg-green-50 transform hover:scale-[1.01]"
                  >
                    <div className="w-2 h-full bg-green-500 rounded-full flex-shrink-0 mt-1"></div>
                    <div className="flex-1">
                      <h3 className="font-extrabold text-gray-900 mb-1 text-lg">
                        {safeRenderText(tip.title)}
                      </h3>
                      <p className="text-gray-700 text-base leading-snug">
                        {safeRenderText(tip.description)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Beneficial Aspects */}
          {details.beneficial_aspects && Array.isArray(details.beneficial_aspects) && details.beneficial_aspects.length > 0 && (
            <div className="bg-green-50 rounded-3xl shadow-lg border border-green-200 p-8 transform hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center space-x-3 mb-4 border-b pb-3 border-green-200">
                <div className="w-10 h-10 bg-green-200 rounded-lg flex items-center justify-center shadow-inner">
                  <Heart className="w-6 h-6 text-green-700" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900">
                  Beneficial Roles
                </h2>
              </div>
              <ul className="space-y-3">
                {details.beneficial_aspects.map((benefit, index) => (
                  <li
                    key={index}
                    className="flex items-start space-x-3 bg-white p-4 rounded-xl border border-green-100 transition-all duration-300 hover:bg-green-100 transform hover:scale-[1.01]"
                  >
                    <span className="text-green-500 text-2xl leading-none font-bold mt-1">
                      ✓
                    </span>
                    <span className="text-gray-700 text-base flex-1">
                      {safeRenderText(benefit)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Interesting Facts */}
          {details.interesting_facts && Array.isArray(details.interesting_facts) && details.interesting_facts.length > 0 && (
            <div className="bg-yellow-50 rounded-3xl shadow-lg border-2 border-yellow-300 p-8 transform hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center space-x-3 mb-4 border-b pb-3 border-yellow-300">
                <div className="w-10 h-10 bg-yellow-200 rounded-lg flex items-center justify-center shadow-md">
                  <Sparkles className="w-6 h-6 text-yellow-800" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900">
                  Fascinating Facts
                </h2>
              </div>
              <ul className="space-y-3">
                {details.interesting_facts.map((fact, index) => (
                  <li
                    key={index}
                    className="flex items-start space-x-3 bg-white p-4 rounded-xl border border-yellow-200 transition-all duration-300"
                  >
                    <span className="text-yellow-600 text-xl leading-none font-bold mt-1">
                      {index + 1}.
                    </span>
                    <span className="text-gray-800 text-base flex-1 italic">
                      {safeRenderText(fact)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Seasonal Activity */}
          {details.seasonal_activity && (
            <div className="bg-orange-50 rounded-3xl shadow-lg border border-orange-200 p-8 transform hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center space-x-3 mb-4 border-b pb-3 border-orange-200">
                <div className="w-10 h-10 bg-orange-200 rounded-lg flex items-center justify-center shadow-inner">
                  <Sun className="w-6 h-6 text-orange-700" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900">
                  Seasonal Activity
                </h2>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">
                {safeRenderText(details.seasonal_activity)}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default InsectDetailsCard;