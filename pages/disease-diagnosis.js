import React, { useState, useEffect } from "react";
import {
  Upload,
  Percent,
  AlertCircle,
  CheckCircle,
  Camera,
  Loader2,
  AlertTriangle,
  Info,
  X,
  Activity,
  Droplets,
  Sun,
  Zap,
  Leaf,
  Shield,
  Clock,
  Plus,
  Mail,
  TrendingUp,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import DiseaseDetailsCard from "@/components/DiseaseDetailsCard";
import { useSession } from "next-auth/react";
// --- UPDATED COMPONENT: Common Diseases Bar Chart (Vertical) ---
const CommonDiseasesBarChart = ({ city, diseases }) => {
  if (!city) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 h-full flex items-center justify-center min-h-[300px]">
        <p className="text-gray-500 text-center">
          Login to see common diseases in your area.
        </p>
      </div>
    );
  }

  // Find the max count for proper vertical scaling
  // Use a default of 1 if array is empty to prevent division by zero
  const maxCount = diseases.length > 0 ? diseases[0].count : 1;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 h-full">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
        <TrendingUp className="w-5 h-5 text-red-600" />
        <span>Top Plant Diseases in <b>{city}</b></span>
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Based on recent diagnoses and regional data.
      </p>

      {/* Main Chart Area: Fixed height for vertical bars */}
      <div className="flex justify-around items-end h-64 border-b-2 border-l-2 border-gray-300 pb-1">
        {diseases.slice(0, 4).map((disease, index) => {
          // Calculate bar height. Use Math.max(5, ...) to ensure a tiny bar is still visible.
          const barHeightPercentage = Math.max(
            5,
            (disease.count / maxCount) * 100
          );

          return (
            <div
              key={disease.name}
              className="flex flex-col items-center justify-end w-1/4 h-full px-2 relative"
            >
              <div className="relative w-full h-full flex justify-center items-end">
                {/* Tooltip/Count Label */}
                <span className="absolute top-0 transform -translate-y-full text-sm font-semibold text-gray-700 mb-1">
                  {disease.count}
                </span>

                {/* Bar itself */}
                <div
                  className="bg-yellow-400 w-1/4 rounded-t-lg transition-all duration-200 hover:bg-yellow-500 cursor-pointer"
                  style={{ height: `${barHeightPercentage}%` }}
                ></div>
              </div>

              {/* Label at the bottom (Disease Name) */}
              <p
                className="text-xs text-gray-700 font-medium text-center mt-2 w-full truncate"
                title={disease.name}
              >
                {/* Show only 2 words to prevent overflow, show full name on hover via title */}
                {disease.name.split(" ").slice(0, 2).join(" ")}
              </p>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 mt-6 text-center">
        *Data is for demonstration purposes.
      </p>
    </div>
  );
};
// --- END UPDATED COMPONENT ---

// Updated Unified Upload Component for Disease Diagnosis (Remains the same)
const UnifiedUploadComponent = ({ onImageSelect, onClear, imagePreview }) => {
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);

  // Start camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      setStream(mediaStream);
      setShowCamera(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert(
        "Unable to access camera. Please check permissions or upload a file instead."
      );
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  // Capture photo
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `disease-capture-${Date.now()}.jpg`, {
            type: "image/jpeg",
          });

          const previewUrl = URL.createObjectURL(blob);
          onImageSelect(file, previewUrl);
          stopCamera();
        }
      },
      "image/jpeg",
      0.9
    );
  };

  // Handle file input
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      onImageSelect(file, previewUrl);
    }
  };

  // Cleanup camera on unmount
  React.useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // Camera Modal
  if (showCamera) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
        <div className="relative w-full h-full max-w-4xl max-h-4xl">
          <button
            onClick={stopCamera}
            className="absolute top-4 right-4 z-10 w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white hover:bg-opacity-30 transition-all"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="w-full h-full flex flex-col items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover rounded-lg"
              style={{ maxHeight: "calc(100vh - 120px)" }}
            />

            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
              <button
                onClick={capturePhoto}
                className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
              >
                <Camera className="w-8 h-8 text-gray-700" />
              </button>
            </div>

            <div className="absolute top-4 left-4 bg-black bg-opacity-50 rounded-lg p-3">
              <p className="text-white text-sm">
                Focus on diseased areas and tap camera button
              </p>
            </div>
          </div>

          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    );
  }

  // Upload interface
  return (
    <div className="relative">
      {!imagePreview ? (
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="image-upload"
          />

          <div className="border border-gray-200 rounded-xl shadow-sm overflow-hidden bg-white">
            <div className="grid md:grid-cols-2">
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center px-4 py-6 md:px-6 md:py-8 hover:bg-red-50 cursor-pointer transition-colors border-b md:border-b-0 md:border-r border-gray-200"
              >
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <Upload className="w-6 h-6 text-red-600" />
                </div>
                <div className="text-center">
                  <p className="text-gray-700 font-medium mb-1">
                    Upload from Device
                  </p>
                  <p className="text-gray-400 text-sm">
                    Choose from gallery or files
                  </p>
                </div>
              </label>

              <button
                onClick={startCamera}
                className="flex flex-col items-center px-4 py-6 md:px-6 md:py-8 hover:bg-red-50 transition-colors"
              >
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <Camera className="w-6 h-6 text-red-600" />
                </div>
                <div className="text-center">
                  <p className="text-gray-700 font-medium mb-1">Take Photo</p>
                  <p className="text-gray-400 text-sm">
                    Capture diseased plant instantly
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-xl shadow-sm overflow-hidden bg-white">
          <div className="relative w-full aspect-[2/1] overflow-hidden">
            <img
              src={imagePreview}
              alt="Plant for diagnosis"
              className="absolute inset-0 w-full h-full object-contain"
            />
            <button
              onClick={onClear}
              className="absolute top-2 right-2 w-8 h-8 bg-white bg-opacity-90 rounded-full shadow-lg flex items-center justify-center hover:bg-opacity-100 transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// New component for the individual diagnosis card (Remains the same)
const DiagnosisCard = ({ image, name, probability, onSelect, isSelected }) => {
  // Get severity label based on probability
  const getSeverityLabel = (prob) => {
    if (prob >= 0.7) return "High";
    if (prob >= 0.4) return "Moderate";
    return "Mild";
  };

  // Get color class for the severity tag
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
      {/* Image container with fixed size */}
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

// --- NEW COMPONENT: Diagnosis Tips (Remains the same) ---
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
          <span>**Focus on diseased** or affected areas</span>
        </div>
        <div className="flex items-start space-x-2">
          <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-1" />
          <span>Include leaves, stems, or fruits showing symptoms</span>
        </div>
        <div className="flex items-start space-x-2">
          <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-1" />
          <span>Take **multiple angles** if possible</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-start space-x-2">
          <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-1" />
          <span>Ensure **good lighting** and sharp focus</span>
        </div>
        <div className="flex items-start space-x-2">
          <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-1" />
          <span>Avoid heavily **cluttered backgrounds**</span>
        </div>
        <div className="flex items-start space-x-2">
          <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-1" />
          <span>Use **high-resolution** images for better analysis</span>
        </div>
      </div>
    </div>
  </div>
);
// --- END NEW COMPONENT ---

const DiseaseDiagnosisPage = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [diagnosing, setDiagnosing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  // Initial user location is null, assuming a login API populates it.
  const [user, setUser] = useState({ location: "Toronto" }); // Mocked for design
  const [diseaseDetails, setDiseaseDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [selectedDiseaseIndex, setSelectedDiseaseIndex] = useState(0);
  const { data: session, update: updateSession } = useSession();

  // Placeholder data for the common diseases chart (Replace with real API call)
  // NOTE: This data should be pre-sorted by count descending to display the 'most common'
  const commonDiseases = [
    { name: "Tomato Early Blight", count: 120 },
    { name: "Potato Late Blight", count: 95 },
    { name: "Corn Rust", count: 70 },
    { name: "Grape Black Rot", count: 50 },
  ];
  const saveDiagnosisToSession = (data) => {
    try {
      sessionStorage.setItem(
        "disease_diagnosis_data",
        JSON.stringify({
          imageUrl: data.imageUrl,
          imagePreview: data.imagePreview,
          result: data.result,
          diseaseDetails: data.diseaseDetails,
          selectedDiseaseIndex: data.selectedDiseaseIndex,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.error("Error saving to sessionStorage:", error);
    }
  };

  const loadDiagnosisFromSession = () => {
    try {
      const savedData = sessionStorage.getItem("disease_diagnosis_data");
      if (savedData) {
        const parsed = JSON.parse(savedData);
        // Check if data is less than 1 hour old (optional expiry)
        const oneHour = 60 * 60 * 1000;
        if (Date.now() - parsed.timestamp < oneHour) {
          return parsed;
        } else {
          // Data expired, clear it
          sessionStorage.removeItem("disease_diagnosis_data");
        }
      }
    } catch (error) {
      console.error("Error loading from sessionStorage:", error);
    }
    return null;
  };

  const clearDiagnosisFromSession = () => {
    try {
      sessionStorage.removeItem("disease_diagnosis_data");
    } catch (error) {
      console.error("Error clearing sessionStorage:", error);
    }
  };

  // Get user info on component mount
  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        console.log("Session response:", data);

        if (data && data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email,
            first_name: data.user.first_name || data.user.name?.split(" ")[0],
            last_name:
              data.user.last_name ||
              data.user.name?.split(" ").slice(1).join(" "),
            profile_image_url: data.user.profile_image_url || data.user.image,
            location: data.user.location || "Unknown City",
          });
        } else {
          setUser(null);
        }
      })
      .catch((error) => {
        console.error("Auth error:", error);
        setUser(null);
      });
  }, []);
  useEffect(() => {
    const savedData = loadDiagnosisFromSession();
    if (savedData) {
      console.log("📂 Restoring previous diagnosis from session");
      setImageUrl(savedData.imageUrl);
      setImagePreview(savedData.imagePreview);
      setResult(savedData.result);
      setDiseaseDetails(savedData.diseaseDetails);
      setSelectedDiseaseIndex(savedData.selectedDiseaseIndex);
    }
  }, []);

  const handleImageSelect = (file, previewUrl) => {
    setSelectedImage(file);
    setImagePreview(previewUrl);
    setResult(null);
    setError(null);
    setDiseaseDetails(null);
    setSelectedDiseaseIndex(0);
  };

  // Upload image
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

  // Fetch disease details WITH image for severity analysis
const fetchDiseaseDetails = async (diseaseName, plantName = null, cloudinaryUrl = null) => {
    setLoadingDetails(true);
    try {
        console.log('Fetching disease details with imageUrl:', cloudinaryUrl ? 'Available' : 'Not available');
        console.log('Cloudinary URL:', cloudinaryUrl);
        
        const response = await fetch('/api/get-disease-details', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                diseaseName,
                plantName,
                imageUrl: cloudinaryUrl 
            }),
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch disease details');
        }
        
        const data = await response.json();
        console.log('Disease details received:', data.imageAnalyzed ? 'With image analysis' : 'Without image analysis');
        setDiseaseDetails(data.details);
        
        // ✅ Return the details so caller can use them
        return data.details;
    } catch (error) {
        console.error('Error fetching disease details:', error);
        setError('Failed to load disease information: ' + error.message);
        return null; // ✅ Return null on error
    } finally {
        setLoadingDetails(false);
    }
};

  // Handle disease diagnosis
const handleDiagnoseDisease = async () => {
    if (!selectedImage) return;

    if (!user) {
        setError("Please log in to diagnose plant diseases");
        return;
    }

    setUploading(true);
    setError(null);
    setDiseaseDetails(null);
    setResult(null);

    try {
        const uploadedImageUrl = await uploadImage(selectedImage);
        setImageUrl(uploadedImageUrl);

        setUploading(false);
        setDiagnosing(true);

        const response = await fetch('/api/disease-diagnosis', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
                image_url: uploadedImageUrl
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Disease diagnosis failed');
        }

        const diagnosisResult = await response.json();
        setResult(diagnosisResult);
        console.log('Diagnosis Result:', diagnosisResult);

        if (diagnosisResult.updated_stats) {
            console.log('🔄 Updating session with new stats:', diagnosisResult.updated_stats);
            await updateSession();
            console.log('✅ Session updated! Stats refreshed.');
        }

        // Fetch disease details with the image URL for severity analysis
        if (diagnosisResult.disease?.suggestions?.length > 0) {
            const topDisease = diagnosisResult.disease.suggestions[0];
            
            // ✅ Await the disease details and get the returned value
            const fetchedDetails = await fetchDiseaseDetails(
                topDisease.name, 
                diagnosisResult.plant_name || null,
                uploadedImageUrl
            );
            
            // ✅ Save to sessionStorage AFTER details are loaded
            console.log('💾 Saving diagnosis to sessionStorage');
            saveDiagnosisToSession({
                imageUrl: uploadedImageUrl,
                imagePreview: imagePreview,
                result: diagnosisResult,
                diseaseDetails: fetchedDetails, // Use the returned details
                selectedDiseaseIndex: 0
            });
        }
        
    } catch (error) {
        setError(error.message);
    } finally {
        setUploading(false);
        setDiagnosing(false);
    }
};

  // Handle disease selection change
const handleDiseaseSelect = async (index) => {
    setSelectedDiseaseIndex(index);
    const selectedDisease = result.disease.suggestions[index];
    if (selectedDisease) {
        // ✅ Await the disease details
        const fetchedDetails = await fetchDiseaseDetails(
            selectedDisease.name,
            result.plant_name || null,
            imageUrl
        );
        
        // ✅ Save to sessionStorage AFTER details are loaded
        console.log('💾 Updating sessionStorage with new disease selection');
        saveDiagnosisToSession({
            imageUrl,
            imagePreview,
            result,
            diseaseDetails: fetchedDetails, // Use the returned details
            selectedDiseaseIndex: index
        });
    }
};

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setImageUrl(null);
    setResult(null);
    setError(null);
    setDiseaseDetails(null);
    setSelectedDiseaseIndex(0);

    clearDiagnosisFromSession();
    console.log('🗑️ Diagnosis data cleared from session');
  };

  // Conditional rendering for the main content block
  // Tips are shown only when no image is selected AND no diagnosis result is present.
  const showTips = !selectedImage && !result;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            <span className="text-red-600">Disease</span> Diagnosis
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get instant, accurate plant disease identification and treatment
            recommendations powered by AI technology
          </p>
        </div>

        {/* DIV 1: Upload and Bar Chart Section - Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Upload & Action */}
          <div>
            {/* Main Upload Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden h-full">
              <div className="bg-orange-100 p-6 border-b border-gray-200 hidden sm:block">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Upload Plant Photo
                </h2>
              </div>

              <div className="p-8">
                {/* Login Required Message */}
                {!user && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                    <div className="flex items-center space-x-3">
                      <Info className="w-5 h-5 text-amber-600" />
                      <p className="text-amber-700 text-sm">
                        Please log in to diagnose plant diseases and access
                        treatment recommendations.
                      </p>
                    </div>
                  </div>
                )}

                {/* Upload Component */}
                <UnifiedUploadComponent
                  onImageSelect={handleImageSelect}
                  onClear={clearImage}
                  imagePreview={imagePreview}
                />

                {/* Action Buttons */}
                <div className="mt-6 flex items-center justify-center space-x-4">
                  <button
                    onClick={handleDiagnoseDisease}
                    disabled={
                      uploading || diagnosing || !selectedImage || !user
                    }
                    className="px-8 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    {uploading || diagnosing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>
                          {uploading ? "Uploading..." : "Analyzing..."}
                        </span>
                      </>
                    ) : (
                      <>
                        <Activity className="w-5 h-5" />
                        <span>Diagnose</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={clearImage}
                    className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Bar Chart */}
          <div className="h-full">
            <CommonDiseasesBarChart
              city={user?.location || "Your City"}
              diseases={commonDiseases}
            />
          </div>
        </div>

        {/* Conditional Section: Tips vs. Results */}
        <div className="max-w-7xl mx-auto mt-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Display Tips card initially, hides after diagnosis starts/completes */}
          {showTips && <DiagnosisTips />}

          {/* Display Diagnosis Results after button press */}
          {result && result.disease?.suggestions?.length > 0 && (
            <>
              {/* Possible Diagnosis */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Possible Diagnosis
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Click on a disease to view detailed information and treatment
                  options
                </p>
                <div className="space-y-0 border border-gray-200 rounded-xl overflow-hidden">
                  {result.disease.suggestions
                    .slice(0, 3)
                    .map((disease, index) => (
                      <DiagnosisCard
                        key={disease.id || index}
                        image={
                          disease.similar_images?.[0]?.url_small || imagePreview
                        }
                        name={disease.name}
                        probability={disease.probability}
                        onSelect={() => handleDiseaseSelect(index)}
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
                    diseaseName={
                      result.disease.suggestions[selectedDiseaseIndex].name
                    }
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiseaseDiagnosisPage;
