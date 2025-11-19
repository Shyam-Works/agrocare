// components/PlantCard.js

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Bug } from 'lucide-react'; 
// Assuming ImageModal is imported from your components directory
import ImageModal from "@/components/ImageModal"; 

// --- ANIMATION VARIANTS (Must be available to PlantCard) ---
// Note: If you want to keep the variants centralized, move these out of PlantCard.js
const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 20, duration: 0.5 },
  },
};
// --- END VARIANTS ---


const PlantCard = ({ plant, isMainResult = false, index = 0, activeTab }) => {
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);

  let images = [];
  if (plant.similar_images && plant.similar_images.length > 0) {
    images = plant.similar_images;
  }

  const hasValidImage = images.length > 0 && !imageError;
  const currentImage = hasValidImage ? images[currentImageIndex] : null;

  const handleImageError = () => {
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    } else {
      setImageError(true);
    }
  };

  const handleImageClick = () => {
    if (hasValidImage && currentImage) {
      setSelectedImage(currentImage.url);
    }
  };

  const confidence = isMainResult ? plant.confidence : plant.probability;
  // const confidenceColorClass = isMainResult ? "bg-green-700" : "bg-amber-600"; // not directly used below, but good for context
  const textClass = isMainResult ? "text-green-900" : "text-amber-800";

  return (
    <>
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden transform hover:translate-y-[-2px] transition-all duration-300 group flex h-auto items-stretch"
      >
        <div
          className="w-32 h-full bg-sand-100 relative flex-shrink-0 cursor-pointer overflow-hidden"
          onClick={handleImageClick}
        >
          {hasValidImage && currentImage ? (
            <img
              src={currentImage.url}
              alt={plant.name || plant.identified_name}
              className="w-full h-full object-cover transition-transform duration-500"
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sand-100 to-sand-200 p-2">
              <div className="text-center">
                {activeTab === "Plants" ? (
                  <Leaf className="w-7 h-7 text-sand-500 mx-auto mb-1" />
                ) : (
                  <Bug className="w-7 h-7 text-sand-500 mx-auto mb-1" />
                )}
                <p className="text-[11px] text-sand-700 font-medium px-1 leading-tight">
                  {plant.name || plant.identified_name || "Unknown"}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="p-3 bg-sand-50 flex flex-grow justify-between items-center min-h-[120px]">
          <div className="flex flex-col justify-center flex-grow pr-4 w-0">
            <h3 className="text-lg font-bold text-gray-800 leading-tight mb-2 break-words">
              {plant.name || plant.identified_name || "Alternative Match"}
            </h3>

            <div className="mb-2 flex items-center w-full">
              <span className="text-xs font-semibold text-gray-500 mr-2 flex-shrink-0">
                Category:
              </span>
              <span
                className={`bg-sand-200 ${textClass} px-3 py-0.5 rounded-full text-xs font-medium break-words`}
              >
                {plant.category || activeTab}
              </span>
            </div>

            <div className="w-full">
              <span className="text-xs text-gray-600 font-medium block mb-1">
                Match Confidence
              </span>
              <div className="w-full bg-sand-300 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-700 ${
                    isMainResult ? "bg-green-600" : "bg-amber-500"
                  }`}
                  style={{ width: `${confidence * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 self-center pl-4 border-l border-gray-100">
            <div
              className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl shadow-inner ${
                isMainResult ? "bg-green-700" : "bg-amber-600" // confidenceColorClass
              } transition-all duration-300`}
            >
              <span className="text-2xl font-extrabold text-white leading-none">
                {(confidence * 100).toFixed(0)}
              </span>
              <span className="text-xs font-semibold text-green-200 mt-0.5">
                MATCH %
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <ImageModal
        isOpen={!!selectedImage}
        imageUrl={selectedImage}
        plantName={plant.name || plant.identified_name}
        onClose={() => setSelectedImage(null)}
      />
    </>
  );
};

export default PlantCard;