// pages/identification.js - WITH INSECT SUPPORT

import React, { useState, useEffect } from "react";
import {
  Upload,
  Camera,
  Loader2,
  Leaf,
  Info,
  CheckCircle,
  AlertCircle,
  Search,
  X,
} from "lucide-react";
import {
  Droplet,
  Sun,
  Heart,
  Lightbulb,
  Sparkles,
  Sprout,
  Bug,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import ChatBot from "@/components/Chatbot";
import { motion, AnimatePresence } from "framer-motion";
import UnifiedUploadComponent from "@/components/UnifiedUploadComponent";
import InsectDetailsCard from "@/components/InsectDetailsCard";
import PlantDetailsCard from "@/components/PlantDetailsCard";
import ImageModal from "@/components/ImageModal";
import MobileChatPage from "@/components/MobileChatPage";
// --- ANIMATION VARIANTS ---
const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 20, duration: 0.5 },
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.1,
    },
  },
};

const detailVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 50, damping: 10, duration: 0.8 },
  },
};

// --- PlantCard Component ---
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
  const confidenceColorClass = isMainResult ? "bg-green-700" : "bg-amber-600";
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
              className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl shadow-inner ${confidenceColorClass} transition-all duration-300`}
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

const IdentificationPage = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [identifying, setIdentifying] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("Plants");
  const [searchQuery, setSearchQuery] = useState("");
  const [plantDetails, setPlantDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const savedResult = sessionStorage.getItem("identificationResult");
    const savedImagePreview = sessionStorage.getItem("imagePreview");
    const savedPlantDetails = sessionStorage.getItem("plantDetails");
    const savedActiveTab = sessionStorage.getItem("activeTab");

    if (savedResult) {
      setResult(JSON.parse(savedResult));
    }
    if (savedImagePreview) {
      setImagePreview(savedImagePreview);
    }
    if (savedPlantDetails) {
      setPlantDetails(JSON.parse(savedPlantDetails));
    }
    if (savedActiveTab) {
      setActiveTab(savedActiveTab);
    }
  }, []);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email,
            first_name: data.user.first_name || data.user.name?.split(" ")[0],
            last_name:
              data.user.last_name ||
              data.user.name?.split(" ").slice(1).join(" "),
            profile_image_url: data.user.profile_image_url || data.user.image,
            location: data.user.location,
          });
        }
      })
      .catch((error) => {
        console.error("Auth error:", error);
      });
  }, []);

  // Clear identification results when switching between Plants and Insects tabs
  useEffect(() => {
    setResult(null);
    setImagePreview(null);
    setSelectedImage(null);
    setPlantDetails(null);
    setError(null);
    setSearchQuery("");
    setSearchResults(null);
    setShowSearchResults(false);

    // Clear sessionStorage data for previous category
    sessionStorage.removeItem("identificationResult");
    sessionStorage.removeItem("imagePreview");
    sessionStorage.removeItem("plantDetails");
  }, [activeTab]);

  const handleImageSelect = (file, previewUrl) => {
    setSelectedImage(file);
    setImagePreview(previewUrl);
    setResult(null);
    setError(null);
    setPlantDetails(null);
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "plant");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        return data.secure_url;
      } else {
        throw new Error("Image upload failed");
      }
    } catch (error) {
      throw new Error("Image upload failed: " + error.message);
    }
  };

  const fetchPlantDetails = async (plantName) => {
    setLoadingDetails(true);
    try {
      const response = await fetch("/api/get-plant-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plantName }),
      });
      const data = await response.json();
      setPlantDetails(data.details);
      sessionStorage.setItem("plantDetails", JSON.stringify(data.details));
    } catch (error) {
      console.error("Error fetching plant details:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const fetchInsectDetails = async (insectName) => {
    setLoadingDetails(true);
    try {
      const response = await fetch("/api/get-insect-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ insectName }),
      });
      const data = await response.json();
      setPlantDetails(data.details); // Using same state variable for consistency
      sessionStorage.setItem("plantDetails", JSON.stringify(data.details));
    } catch (error) {
      console.error("Error fetching insect details:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSearchPlant = async (e) => {
    e?.preventDefault();

    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError(null);
    setShowSearchResults(true);

    try {
      // Determine which search API to use based on active tab
      const searchEndpoint =
        activeTab === "Plants"
          ? `/api/search-plant?q=${encodeURIComponent(
              searchQuery.trim()
            )}&limit=10&language=en`
          : `/api/search-insect?q=${encodeURIComponent(
              searchQuery.trim()
            )}&limit=10&language=en`;

      console.log(`Searching ${activeTab} with endpoint:`, searchEndpoint);

      const response = await fetch(searchEndpoint);

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Unknown error" }));
        console.error("Search API error:", errorData);
        throw new Error(errorData.message || `${activeTab} search failed`);
      }

      const searchData = await response.json();
      console.log("Search Results:", searchData);

      setSearchResults(searchData);
      setShowSearchResults(true);
    } catch (error) {
      console.error("Search error:", error);
      setError(`${activeTab} search failed: ${error.message}`);
      setSearchResults(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = async (result) => {
    activeTab === "Plants"
    ? `/api/search-plant?q=${encodeURIComponent(searchQuery.trim())}&limit=10&language=en`
    : `/api/search-insect?q=${encodeURIComponent(searchQuery.trim())}&limit=10&language=en`;
    console.log("Selected search result:", result);
    setShowSearchResults(false);
    setSearchQuery("");

    // Immediately show the result card WITHOUT details
    const searchResult = {
      identified: true,
      identified_name: result.name,
      species: result.name,
      category: activeTab,
      confidence: 1.0,
      similar_images: result.thumbnail
        ? [
            {
              url: `data:image/jpeg;base64,${result.thumbnail}`,
              citation: "Search Result",
            },
          ]
        : [],
      alternative_suggestions: [],
      plant_details: {},
    };

    console.log("Setting result state:", searchResult);
    setResult(searchResult);
    sessionStorage.setItem(
      "identificationResult",
      JSON.stringify(searchResult)
    );

    // NOW fetch details in the background
    setLoadingDetails(true);

    try {
      console.log(
        `Fetching ${activeTab.toLowerCase().slice(0, -1)} details for:`,
        result.name
      );

      // Determine which details API to use based on active tab
      const detailsEndpoint =
        activeTab === "Plants"
          ? "/api/get-plant-details"
          : "/api/get-insect-details";

      const response = await fetch(detailsEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [activeTab === "Plants" ? "plantName" : "insectName"]: result.name,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch ${activeTab.toLowerCase().slice(0, -1)} details`
        );
      }

      const data = await response.json();
      console.log(`${activeTab} details received:`, data);

      console.log(
        `Setting ${activeTab.toLowerCase().slice(0, -1)} details:`,
        data.details
      );
      setPlantDetails(data.details);
      sessionStorage.setItem("plantDetails", JSON.stringify(data.details));
    } catch (error) {
      console.error(
        `Error loading ${activeTab.toLowerCase().slice(0, -1)} details:`,
        error
      );
      setError(
        `Failed to load ${activeTab.toLowerCase().slice(0, -1)} details: ` +
          error.message
      );
    } finally {
      setLoadingDetails(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults(null);
    setShowSearchResults(false);
  };

  const handleIdentifySpecies = async () => {
    if (!selectedImage) return;

    if (!user) {
      setError(`Please log in to identify ${activeTab.toLowerCase()}`);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const imageUrl = await uploadImage(selectedImage);

      setUploading(false);
      setIdentifying(true);

      // Determine which API endpoint to use based on active tab
      const apiEndpoint =
        activeTab === "Plants" ? "/api/identify-plant" : "/api/identify-insect";

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          image_url: imageUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `${activeTab} identification failed`
        );
      }

      const identificationResult = await response.json();
      setResult(identificationResult);
      sessionStorage.setItem(
        "identificationResult",
        JSON.stringify(identificationResult)
      );
      sessionStorage.setItem("imagePreview", imagePreview);
      sessionStorage.setItem("activeTab", activeTab);

      // Fetch details based on type
      if (
        identificationResult.identified &&
        identificationResult.identified_name
      ) {
        if (activeTab === "Plants") {
          await fetchPlantDetails(identificationResult.identified_name);
        } else if (activeTab === "Insects") {
          // Use OpenAI instead of Insect.id details
          await fetchInsectDetails(identificationResult.identified_name);
        }
      }
      
      console.log("Identification Result:", identificationResult);
    } catch (error) {
      setError(error.message);
    } finally {
      setUploading(false);
      setIdentifying(false);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setResult(null);
    setError(null);
    setPlantDetails(null);
    sessionStorage.removeItem("identificationResult");
    sessionStorage.removeItem("imagePreview");
    sessionStorage.removeItem("plantDetails");
    sessionStorage.removeItem("activeTab");
  };

  const tabs = ["Plants", "Insects"];

  const getTabIcon = (tab) => {
    switch (tab) {
      case "Plants":
        return <Leaf className="w-5 h-5 mr-2" />;
      case "Insects":
        return <Bug className="w-5 h-5 mr-2" />;
      default:
        return null;
    }
  };

  const matchContainerStyle = { maxHeight: "540px" };

  return (
    <div className="min-h-screen bg-sand-50">
      <Navbar />

      <div
        className="px-4 py-12 md:px-6"
        style={{ fontFamily: '"Open Sans", sans-serif' }}
      >
        <div className={`mx-auto ${result ? "lg:max-w-7xl" : "max-w-4xl"}`}>
          <header className="text-center mb-12">
            <h1
              className="text-5xl font-extrabold text-gray-700 mb-4 animate-fade-in-down"
              style={{
                fontFamily: '"Open Sans", sans-serif',
                fontOpticalSizing: "auto",
                fontWeight: 900,
                fontStyle: "normal",
                fontVariationSettings: '"wdth" 200',
              }}
            >
              AI Species Identifier
            </h1>
            <p
              style={{
                fontFamily: '"Open Sans", sans-serif',
                fontOpticalSizing: "auto",
                fontWeight: 100,
                fontStyle: "normal",
                opacity: 0.7,
              }}
            >
              Search for any plant or insect species by name, or upload an image
              to identify it.
            </p>
          </header>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="mb-8 bg-red-100 border-2 border-red-400 rounded-2xl p-5"
              >
                <div className="flex items-center space-x-4">
                  <AlertCircle className="w-6 h-6 text-red-700" />
                  <p className="text-red-800 font-semibold">{error}</p>
                </div>
              </motion.div>
            )}

            {loadingDetails && !result && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="mb-8 bg-blue-100 border-2 border-blue-400 rounded-2xl p-5"
              >
                <div className="flex items-center space-x-4">
                  <Loader2 className="w-6 h-6 text-blue-700 animate-spin" />
                  <p className="text-blue-800 font-semibold">
                    Loading plant details...
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col lg:flex-row gap-8 mb-8">
            <motion.div
              initial={result ? { opacity: 0, y: 30 } : { opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 50,
                damping: 15,
                duration: 0.7,
              }}
              className={`w-full ${
                result ? "lg:w-1/2" : "lg:max-w-3xl lg:mx-auto"
              }`}
            >
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden h-auto">
                <div className="border-b border-gray-200 bg-sand-100">
                  <div className="flex">
                    {tabs.map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-3 px-4 text-center font-semibold text-base transition-all duration-300 flex items-center justify-center ${
                          activeTab === tab
                            ? "text-green-800 border-b-4 border-green-700 bg-white shadow-inner"
                            : "text-gray-600 hover:text-green-700"
                        }`}
                      >
                        {getTabIcon(tab)}
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 lg:p-5">
                  <h2 className="text-xl font-bold text-gray-800 text-center mb-5">
                    {imagePreview
                      ? "Review & Identify"
                      : "Upload or Capture Photo"}
                  </h2>

                  {!user && (
                    <div className="bg-yellow-100 border border-yellow-300 rounded-2xl p-3 mb-4 animate-fade-in">
                      <div className="flex items-center space-x-2">
                        <Info className="w-5 h-5 text-yellow-700" />
                        <p className="text-yellow-800 text-sm font-medium">
                          Please <strong>log in</strong> to identify{" "}
                          {activeTab.toLowerCase()} and save results to your
                          history.
                        </p>
                      </div>
                    </div>
                  )}

                  <UnifiedUploadComponent
                    onImageSelect={handleImageSelect}
                    onClear={clearImage}
                    imagePreview={imagePreview}
                  />

                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <form onSubmit={handleSearchPlant} className="space-y-3">
                      <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-3 max-w-md mx-auto">
                        <div className="relative flex-1 w-full">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder={`Search ${activeTab.toLowerCase()} database by name...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() =>
                              searchResults && setShowSearchResults(true)
                            }
                            className="w-full pl-9 pr-9 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-700 focus:border-green-700 outline-none transition-colors duration-300 text-sm"
                          />
                          {searchQuery && (
                            <button
                              type="button"
                              onClick={clearSearch}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <div className="flex space-x-2 w-full md:w-auto">
                          <button
                            type="submit"
                            disabled={
                              isSearching || !user || !searchQuery.trim()
                            }
                            className="flex-1 md:flex-none px-4 py-2.5 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg text-sm"
                          >
                            {isSearching ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Searching...</span>
                              </>
                            ) : (
                              <>
                                <Search className="w-4 h-4" />
                                <span>Search</span>
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={handleIdentifySpecies}
                            disabled={
                              uploading ||
                              identifying ||
                              !user ||
                              !selectedImage
                            }
                            className="flex-1 md:flex-none px-4 py-2.5 bg-green-700 text-white rounded-lg font-semibold hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg text-sm"
                          >
                            {uploading || identifying ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm">
                                  {uploading ? "Uploading..." : "Analyzing..."}
                                </span>
                              </>
                            ) : (
                              <>
                                <Lightbulb className="w-4 h-4" />
                                <span>Identify</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <AnimatePresence>
                        {showSearchResults &&
                          searchResults &&
                          searchResults.results.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: -10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -10, scale: 0.95 }}
                              transition={{ duration: 0.2 }}
                              className="max-w-md mx-auto"
                            >
                              <div className="w-full bg-white rounded-xl shadow-2xl border-2 border-green-200 max-h-96 overflow-y-auto">
                                <div className="sticky top-0 p-3 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50 z-10">
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm font-bold text-gray-800 flex items-center">
                                      <Search className="w-4 h-4 mr-2 text-green-600" />
                                      Found {searchResults.total_results} result
                                      {searchResults.total_results !== 1
                                        ? "s"
                                        : ""}
                                    </p>
                                    <button
                                      onClick={() =>
                                        setShowSearchResults(false)
                                      }
                                      className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                                <div className="divide-y divide-gray-100">
                                  {searchResults.results.map(
                                    (result, index) => (
                                      <button
                                        key={index}
                                        onClick={() =>
                                          handleSelectSearchResult(result)
                                        }
                                        disabled={loadingDetails}
                                        className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 transition-all duration-200 flex items-center space-x-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        {result.thumbnail ? (
                                          <img
                                            src={`data:image/jpeg;base64,${result.thumbnail}`}
                                            alt={result.name}
                                            className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border-2 border-gray-200 group-hover:border-green-400 transition-colors shadow-sm"
                                          />
                                        ) : (
                                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center flex-shrink-0 border-2 border-gray-200 group-hover:border-green-400 transition-colors">
                                            {activeTab === "Plants" ? (
                                              <Leaf className="w-7 h-7 text-green-600" />
                                            ) : (
                                              <Bug className="w-7 h-7 text-amber-600" />
                                            )}
                                          </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <p className="font-bold text-gray-900 truncate text-base group-hover:text-green-700 transition-colors">
                                            {result.name}
                                          </p>
                                          <p className="text-xs text-gray-500 truncate mt-0.5">
                                            <span className="font-medium">
                                              Match:
                                            </span>{" "}
                                            {result.matched_in}
                                            {result.matched_type !==
                                              "entity_name" && (
                                              <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-semibold uppercase">
                                                {result.matched_type ===
                                                "synonym"
                                                  ? "Synonym"
                                                  : result.matched_type}
                                              </span>
                                            )}
                                          </p>
                                        </div>
                                        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <div className="bg-green-600 rounded-full p-1.5">
                                            <CheckCircle className="w-4 h-4 text-white" />
                                          </div>
                                        </div>
                                      </button>
                                    )
                                  )}
                                </div>
                                {searchResults.results_trimmed && (
                                  <div className="p-3 bg-gray-50 border-t border-gray-200 text-center">
                                    <p className="text-xs text-gray-600">
                                      Showing top {searchResults.limit} results.
                                      Refine your search for more specific
                                      results.
                                    </p>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}

                        {showSearchResults &&
                          searchResults &&
                          searchResults.results.length === 0 && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.2 }}
                              className="max-w-md mx-auto"
                            >
                              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-5 text-center shadow-lg">
                                <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
                                <h3 className="font-bold text-gray-800 mb-1">
                                  No Results Found
                                </h3>
                                <p className="text-sm text-gray-700">
                                  No {activeTab.toLowerCase()} found matching
                                  {searchQuery}
                                </p>
                                <p className="text-xs text-gray-600 mt-2">
                                  Try searching by scientific name, common name,
                                  or synonyms.
                                </p>
                              </div>
                            </motion.div>
                          )}
                      </AnimatePresence>
                    </form>
                  </div>
                </div>
              </div>

              {!result && (
                <div className="mt-6 bg-sand-100 border-2 border-sand-300 rounded-2xl p-5 animate-fade-in-up">
                  <h3 className="text-xl font-bold text-green-800 mb-3">
                    Tips for Optimal Identification
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-700">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-700 flex-shrink-0 mt-0.5" />
                      <span>
                        Ensure your subject{" "}
                        <strong>fills most of the frame</strong>.
                      </span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-700 flex-shrink-0 mt-0.5" />
                      <span>
                        Use <strong>soft, natural lighting</strong> avoid harsh
                        shadows.
                      </span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-700 flex-shrink-0 mt-0.5" />
                      <span>
                        Capture <strong>distinctive features</strong> like
                        patterns or flowers.
                      </span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-700 flex-shrink-0 mt-0.5" />
                      <span>
                        Avoid blurry, distant, or heavily edited images.
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {result && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 50,
                  damping: 15,
                  duration: 0.7,
                }}
                className="w-full lg:w-1/2"
              >
                <div
                  className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col p-6 transition-all duration-300"
                  style={matchContainerStyle}
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-green-700 pb-2 flex-shrink-0">
                    Best Species Matches
                  </h2>

                  {result.identified && result.identified_name ? (
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="flex flex-col space-y-3 flex-grow"
                    >
                      <div>
                        <PlantCard
                          plant={result}
                          isMainResult={true}
                          activeTab={activeTab}
                        />
                      </div>

                      {result?.alternative_suggestions
                        ?.slice(0, 2)
                        .map((suggestion, index) => (
                          <div key={index}>
                            <PlantCard
                              plant={suggestion}
                              isMainResult={false}
                              index={index}
                              activeTab={activeTab}
                            />
                          </div>
                        ))}
                    </motion.div>
                  ) : (
                    <div className="bg-sand-50 rounded-2xl shadow-inner border border-gray-200 p-6 text-center animate-fade-in flex-grow flex flex-col justify-center items-center">
                      <div className="w-16 h-16 bg-sand-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-sand-700" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 mb-1">
                        Species Not Identified
                      </h3>
                      <p className="text-gray-600 text-sm max-w-xs mx-auto">
                        The AI could not confidently match this image. Try a
                        clearer, closer photo of the{" "}
                        {activeTab.toLowerCase().slice(0, -1)} or use the search
                        bar.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 50,
                damping: 15,
                duration: 0.7,
                delay: 0.1,
              }}
              className="w-full mt-10"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b-2 border-green-700 pb-2">
                Full Species Details
              </h2>
              {activeTab === "Plants" ? (
                <PlantDetailsCard
                  details={plantDetails}
                  loading={loadingDetails}
                  plantName={result.identified_name}
                />
              ) : (
                <InsectDetailsCard
                  details={plantDetails}
                  loading={loadingDetails}
                  insectName={result.identified_name}
                />
              )}
            </motion.div>
          )}

          <>{isMobile ? <MobileChatPage /> : <ChatBot />}</>
        </div>
      </div>
    </div>
  );
};

export default IdentificationPage;
