// pages/identification.js - IMPROVED VERSION

import React, { useState, useEffect } from 'react';
import { Upload, Camera, Loader2, Leaf, Info, CheckCircle, AlertCircle, Search, X } from 'lucide-react';
import Navbar from '@/components/Navbar';

const IdentificationPage = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [identifying, setIdentifying] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('Plants');
  const [searchQuery, setSearchQuery] = useState('');

  // Get user info on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("/api/auth/verify", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user && data.success !== false) {
            setUser(data.user);
          }
        })
        .catch((error) => {
          console.error("Auth error:", error);
        });
    }
  }, []);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  // Upload image using your existing upload API
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

  // Handle the complete identification process
  const handleIdentifyPlant = async () => {
    if (!selectedImage) return;

    // Check if user is logged in
    if (!user) {
      setError("Please log in to identify plants");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Upload image using your existing system
      const imageUrl = await uploadImage(selectedImage);
      
      setUploading(false);
      setIdentifying(true);

      // Create identification record and get results
      const response = await fetch('/api/identify-plant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          image_url: imageUrl
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Plant identification failed');
      }

      const identificationResult = await response.json();
      setResult(identificationResult);
      
      // Debug: Log the result to see the data structure
      console.log('Identification Result:', identificationResult);
    } catch (error) {
      setError(error.message);
    } finally {
      setUploading(false);
      setIdentifying(false);
    }
  };

  // Clear current image and results
  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setResult(null);
    setError(null);
  };

  // Component to handle individual plant cards
  const PlantCard = ({ plant, isMainResult = false, index = 0 }) => {
    const [imageError, setImageError] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    
    // Get images array - try multiple sources
    let images = [];
    if (plant.similar_images && plant.similar_images.length > 0) {
      images = plant.similar_images;
    }
    
    const hasValidImage = images.length > 0 && !imageError;
    const currentImage = hasValidImage ? images[currentImageIndex] : null;
    
    const handleImageError = () => {
      console.log('Image failed to load:', currentImage?.url);
      // Try next image if available
      if (currentImageIndex < images.length - 1) {
        setCurrentImageIndex(currentImageIndex + 1);
      } else {
        setImageError(true);
      }
    };

    const confidence = isMainResult ? plant.confidence : plant.probability;
    const confidenceColor = isMainResult ? 'green' : 'blue';

    return (
      
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
        <div className="aspect-square bg-gray-100 relative">
          {hasValidImage && currentImage ? (
            <img
              src={currentImage.url}
              alt={plant.name || plant.identified_name}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
              <div className="text-center">
                <Leaf className="w-12 h-12 text-green-400 mx-auto mb-2" />
                <p className="text-xs text-green-600 font-medium px-2">
                  {plant.name || plant.identified_name}
                </p>
              </div>
            </div>
          )}
          <div className={`absolute top-2 left-2 bg-${confidenceColor}-500 text-white px-2 py-1 rounded text-xs font-bold`}>
            {(confidence * 100).toFixed(0)}%
          </div>
          
          {/* Image navigation dots if multiple images */}
          {images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {images.map((_, imgIndex) => (
                <button
                  key={imgIndex}
                  onClick={() => setCurrentImageIndex(imgIndex)}
                  className={`w-2 h-2 rounded-full ${
                    imgIndex === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="mb-2">
            <span className="text-sm text-gray-500">Name:</span>
            <span className="text-orange-500 font-semibold ml-1">
              {plant.name || plant.identified_name}
            </span>
          </div>
          <div className="mb-2">
            <span className="text-sm text-gray-500">Category:</span>
            <span className={`bg-${confidenceColor}-100 text-${confidenceColor}-800 px-2 py-0.5 rounded text-xs font-medium ml-2`}>
              {plant.category || activeTab}
            </span>
          </div>
          <div>
            <span className="text-sm text-gray-500">Match Confidence:</span>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div 
                className={`bg-${confidenceColor}-400 h-2 rounded-full transition-all duration-500`}
                style={{ width: `${(confidence * 100)}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-500">{(confidence * 100).toFixed(0)}%</span>
          </div>
          
          {/* Show number of similar images available */}
          {images.length > 0 && (
            <div className="mt-2 text-xs text-gray-500">
              {images.length} similar image{images.length !== 1 ? 's' : ''} available
            </div>
          )}
        </div>
      </div>
    );
  };

  const tabs = ['Plants', 'Crops', 'Insects'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">Species Identification</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            From garden beds to farm fields, quickly identify any plant, crop, or insect 
            with AI-powered accuracy and practical care tips.
          </p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                    activeTab === tab
                      ? 'text-gray-800 border-b-2 border-gray-800 bg-white'
                      : 'text-gray-500 hover:text-gray-700 bg-gray-50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Upload Photo Section */}
          <div className="p-8">
            <h2 className="text-xl font-semibold text-gray-800 text-center mb-6">Upload Photo</h2>
            
            {/* Login Required Message */}
            {!user && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <Info className="w-5 h-5 text-amber-600" />
                  <p className="text-amber-700 text-sm">Please log in to identify plants and access your history.</p>
                </div>
              </div>
            )}

            {/* Upload Area */}
            <div className="relative">
              {!imagePreview ? (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer block">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-green-400 hover:bg-green-50 transition-all duration-200">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-600 font-medium mb-2">Click to upload an image</p>
                      <p className="text-gray-400 text-sm">Supports JPG, PNG, WebP formats</p>
                    </div>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Uploaded plant"
                    className="w-full max-w-md mx-auto rounded-xl shadow-md border-2 border-gray-200"
                  />
                  <button
                    onClick={clearImage}
                    className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              )}
            </div>

            {/* Search Bar */}
            {imagePreview && (
              <div className="mt-6">
                <div className="flex items-center space-x-3 max-w-md mx-auto">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    />
                  </div>
                  <button
                    onClick={handleIdentifyPlant}
                    disabled={uploading || identifying || !user}
                    className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    {uploading || identifying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{uploading ? 'Uploading...' : 'Analyzing...'}</span>
                      </>
                    ) : (
                      <span>Identify</span>
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
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Best Matches</h2>
            
            {result.identified && result.identified_name ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Best Match */}
                <PlantCard plant={result} isMainResult={true} />

                {/* Alternative Suggestions */}
                {result.alternative_suggestions && result.alternative_suggestions.map((suggestion, index) => (
                  <PlantCard key={index} plant={suggestion} isMainResult={false} index={index} />
                ))}
              </div>
            ) : (
              /* No Results */
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Unable to Identify Species
                </h3>
                <p className="text-gray-500">
                  The image might not contain a clear {activeTab.toLowerCase().slice(0, -1)}, or the species isn't in our database.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Plant Detection Status */}
        {result && (
          <div className="mt-6">
            <div className={`rounded-xl p-4 ${
              result.is_plant_detected 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  result.is_plant_detected ? 'bg-green-100' : 'bg-yellow-100'
                }`}>
                  <Leaf className={`w-5 h-5 ${
                    result.is_plant_detected ? 'text-green-600' : 'text-yellow-600'
                  }`} />
                </div>
                <div>
                  <p className={`font-medium ${
                    result.is_plant_detected ? 'text-green-800' : 'text-yellow-800'
                  }`}>
                    {result.is_plant_detected ? 'Plant Successfully Detected' : 'Plant Detection Uncertain'}
                  </p>
                  <p className={`text-sm ${
                    result.is_plant_detected ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    Detection Confidence: {(result.is_plant_probability * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tips Section */}
        {!result && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Tips for Better Results</h3>
            <div className="grid md:grid-cols-2 gap-3 text-sm text-blue-700">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <span>Take photos in good natural lighting</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <span>Include distinctive features clearly</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <span>Avoid blurry or distant shots</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <span>Fill the frame with the subject</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IdentificationPage;