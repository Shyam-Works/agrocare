import React, { useState, useEffect } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import SaveToCategoryModal from "@/components/SaveToCategoryModal";
import CommonDiseasesBarChart from "@/components/CommonDiseasesBarChart";
import UploadSection from "@/components/UploadSection";
import DiagnosisTips from "@/components/DiagnosisTips";
import DiagnosisResults from "@/components/DiagnosisResults";
import { useDiseaseDetails } from "@/components/useDiseaseDetails";
import { useCommonDiseases } from "@/components/useCommonDiseases";

// --- SESSION STORAGE KEYS ---
const STORAGE_KEYS = {
  IMAGE_PREVIEW: 'disease_imagePreview',
  IMAGE_URL: 'disease_imageUrl',
  RESULT: 'disease_result',
  ERROR: 'disease_error',
  DISEASE_DETAILS: 'disease_diseaseDetails',
  SELECTED_DISEASE_INDEX: 'disease_selectedDiseaseIndex',
  CURRENT_DIAGNOSIS_ID: 'disease_currentDiagnosisId',
  COMMON_DISEASES: 'disease_commonDiseases'
};

// --- SESSION STORAGE HELPERS ---
const SessionStorage = {
  set: (key, value) => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(`Error saving to sessionStorage (${key}):`, error);
    }
  },
  
  get: (key, defaultValue = null) => {
    try {
      if (typeof window !== 'undefined') {
        const item = sessionStorage.getItem(key);
        if (!item) return defaultValue;
        
        // Try to parse as JSON, if it fails, return the raw string
        try {
          return JSON.parse(item);
        } catch {
          return item; // Return raw string if not valid JSON
        }
      }
    } catch (error) {
      console.error(`Error reading from sessionStorage (${key}):`, error);
    }
    return defaultValue;
  },
  
  remove: (key) => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing from sessionStorage (${key}):`, error);
    }
  },
  
  clear: () => {
    try {
      if (typeof window !== 'undefined') {
        // Clear all disease-related keys
        Object.values(STORAGE_KEYS).forEach(key => {
          sessionStorage.removeItem(key);
        });
      }
    } catch (error) {
      console.error('Error clearing sessionStorage:', error);
    }
  }
};

const DiseaseDiagnosisPage = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [diagnosing, setDiagnosing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedDiseaseIndex, setSelectedDiseaseIndex] = useState(0);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [currentDiagnosisId, setCurrentDiagnosisId] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [isRestoringSession, setIsRestoringSession] = useState(true);

  const { diseaseDetails, loadingDetails, fetchDiseaseDetails, setDiseaseDetails } = useDiseaseDetails();
  const { commonDiseases, loadingCommonDiseases, fetchCommonDiseases } = useCommonDiseases();

  // Initialize client-side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Restore complete session state on mount
  useEffect(() => {
    if (!isClient) return;

    console.log('🔄 Restoring disease diagnosis session state...');
    
    try {
      // Restore all state from sessionStorage
      const savedImagePreview = SessionStorage.get(STORAGE_KEYS.IMAGE_PREVIEW);
      const savedImageUrl = SessionStorage.get(STORAGE_KEYS.IMAGE_URL);
      const savedResult = SessionStorage.get(STORAGE_KEYS.RESULT);
      const savedError = SessionStorage.get(STORAGE_KEYS.ERROR);
      const savedDiseaseDetails = SessionStorage.get(STORAGE_KEYS.DISEASE_DETAILS);
      const savedSelectedDiseaseIndex = SessionStorage.get(STORAGE_KEYS.SELECTED_DISEASE_INDEX);
      const savedCurrentDiagnosisId = SessionStorage.get(STORAGE_KEYS.CURRENT_DIAGNOSIS_ID);

      // Restore states
      if (savedImagePreview) {
        setImagePreview(savedImagePreview);
        console.log('✅ Restored image preview');
      }
      if (savedImageUrl) {
        setImageUrl(savedImageUrl);
        console.log('✅ Restored image URL');
      }
      if (savedResult) {
        setResult(savedResult);
        console.log('✅ Restored diagnosis result');
      }
      if (savedError) {
        setError(savedError);
        console.log('✅ Restored error message');
      }
      if (savedDiseaseDetails) {
        setDiseaseDetails(savedDiseaseDetails);
        console.log('✅ Restored disease details');
      }
      if (savedSelectedDiseaseIndex !== null) {
        setSelectedDiseaseIndex(savedSelectedDiseaseIndex);
        console.log('✅ Restored selected disease index:', savedSelectedDiseaseIndex);
      }
      if (savedCurrentDiagnosisId) {
        setCurrentDiagnosisId(savedCurrentDiagnosisId);
        console.log('✅ Restored current diagnosis ID');
      }

      console.log('✅ Disease diagnosis session restoration complete');
    } catch (error) {
      console.error('❌ Error restoring disease diagnosis session:', error);
    } finally {
      setIsRestoringSession(false);
    }
  }, [isClient, setDiseaseDetails]);

  // Fetch user session
  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setUser({
            id: data.user.id,
            email: data.user.email,
            first_name: data.user.first_name || data.user.name?.split(" ")[0],
            last_name: data.user.last_name || data.user.name?.split(" ").slice(1).join(" "),
            profile_image_url: data.user.profile_image_url || data.user.image,
            location: data.user.location || "Unknown City",
          });

          const userLocation = data.user.location || "Unknown City";
          if (userLocation !== "Unknown City") {
            fetchCommonDiseases(userLocation);
          }
        } else {
          setUser(null);
        }
      })
      .catch((error) => {
        console.error("Auth error:", error);
        setUser(null);
      });
  }, []);

  // Auto-save states to sessionStorage whenever they change
  useEffect(() => {
    if (!isClient || isRestoringSession) return;
    
    if (imagePreview) {
      SessionStorage.set(STORAGE_KEYS.IMAGE_PREVIEW, imagePreview);
    } else {
      SessionStorage.remove(STORAGE_KEYS.IMAGE_PREVIEW);
    }
  }, [imagePreview, isClient, isRestoringSession]);

  useEffect(() => {
    if (!isClient || isRestoringSession) return;
    
    if (imageUrl) {
      SessionStorage.set(STORAGE_KEYS.IMAGE_URL, imageUrl);
    } else {
      SessionStorage.remove(STORAGE_KEYS.IMAGE_URL);
    }
  }, [imageUrl, isClient, isRestoringSession]);

  useEffect(() => {
    if (!isClient || isRestoringSession) return;
    
    if (result) {
      SessionStorage.set(STORAGE_KEYS.RESULT, result);
    } else {
      SessionStorage.remove(STORAGE_KEYS.RESULT);
    }
  }, [result, isClient, isRestoringSession]);

  useEffect(() => {
    if (!isClient || isRestoringSession) return;
    
    if (error) {
      SessionStorage.set(STORAGE_KEYS.ERROR, error);
    } else {
      SessionStorage.remove(STORAGE_KEYS.ERROR);
    }
  }, [error, isClient, isRestoringSession]);

  useEffect(() => {
    if (!isClient || isRestoringSession) return;
    
    if (diseaseDetails) {
      SessionStorage.set(STORAGE_KEYS.DISEASE_DETAILS, diseaseDetails);
    } else {
      SessionStorage.remove(STORAGE_KEYS.DISEASE_DETAILS);
    }
  }, [diseaseDetails, isClient, isRestoringSession]);

  useEffect(() => {
    if (!isClient || isRestoringSession) return;
    
    SessionStorage.set(STORAGE_KEYS.SELECTED_DISEASE_INDEX, selectedDiseaseIndex);
  }, [selectedDiseaseIndex, isClient, isRestoringSession]);

  useEffect(() => {
    if (!isClient || isRestoringSession) return;
    
    if (currentDiagnosisId) {
      SessionStorage.set(STORAGE_KEYS.CURRENT_DIAGNOSIS_ID, currentDiagnosisId);
    } else {
      SessionStorage.remove(STORAGE_KEYS.CURRENT_DIAGNOSIS_ID);
    }
  }, [currentDiagnosisId, isClient, isRestoringSession]);

  const handleImageSelect = (file, previewUrl) => {
    setSelectedImage(file);
    setImagePreview(previewUrl);
    setResult(null);
    setError(null);
    setDiseaseDetails(null);
    setSelectedDiseaseIndex(0);
    
    // Clear related storage
    SessionStorage.remove(STORAGE_KEYS.RESULT);
    SessionStorage.remove(STORAGE_KEYS.ERROR);
    SessionStorage.remove(STORAGE_KEYS.DISEASE_DETAILS);
    SessionStorage.set(STORAGE_KEYS.SELECTED_DISEASE_INDEX, 0);
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "plant");

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
  };

  const handleDiagnoseDisease = async () => {
    if (!selectedImage || !user) {
      const errorMessage = "Please log in to diagnose plant diseases";
      setError(errorMessage);
      SessionStorage.set(STORAGE_KEYS.ERROR, errorMessage);
      return;
    }

    setUploading(true);
    setError(null);
    setDiseaseDetails(null);
    setResult(null);
    
    // Clear error from storage
    SessionStorage.remove(STORAGE_KEYS.ERROR);

    try {
      const uploadedImageUrl = await uploadImage(selectedImage);
      setImageUrl(uploadedImageUrl);
      SessionStorage.set(STORAGE_KEYS.IMAGE_URL, uploadedImageUrl);
      
      setUploading(false);
      setDiagnosing(true);

      const response = await fetch("/api/disease-diagnosis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ image_url: uploadedImageUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Disease diagnosis failed");
      }

      const diagnosisResult = await response.json();
      setResult(diagnosisResult);
      SessionStorage.set(STORAGE_KEYS.RESULT, diagnosisResult);

      if (diagnosisResult.diagnosis_id) {
        setCurrentDiagnosisId(diagnosisResult.diagnosis_id);
        SessionStorage.set(STORAGE_KEYS.CURRENT_DIAGNOSIS_ID, diagnosisResult.diagnosis_id);
      }

      if (diagnosisResult.disease?.suggestions?.length > 0) {
        const topDisease = diagnosisResult.disease.suggestions[0];
        await fetchDiseaseDetails(
          topDisease.name,
          diagnosisResult.plant_name || null,
          uploadedImageUrl
        );
      }
    } catch (error) {
      console.error("Diagnosis error:", error);
      const errorMessage = error.message;
      setError(errorMessage);
      SessionStorage.set(STORAGE_KEYS.ERROR, errorMessage);
    } finally {
      setUploading(false);
      setDiagnosing(false);
    }
  };

  const handleDiseaseSelect = (index) => {
    setSelectedDiseaseIndex(index);
    SessionStorage.set(STORAGE_KEYS.SELECTED_DISEASE_INDEX, index);
    
    const selectedDisease = result.disease.suggestions[index];
    if (selectedDisease) {
      fetchDiseaseDetails(selectedDisease.name, result.plant_name || null, imageUrl);
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
    
    // Clear all session storage
    SessionStorage.clear();
  };

  const handleSaveSuccess = (category) => {
    console.log("Saved to category:", category);
  };

  const showTips = !selectedImage && !result;

  // Show loading state during session restoration
  if (isRestoringSession) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-semibold">Restoring session...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            <span className="text-red-600">Disease</span> Diagnosis
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get instant, accurate plant disease identification and treatment recommendations powered by AI technology
          </p>
        </div>

        {/* Upload and Chart Section */}
        <div className="grid md:grid-cols-2 gap-8">
          <UploadSection
            user={user}
            imagePreview={imagePreview}
            uploading={uploading}
            diagnosing={diagnosing}
            selectedImage={selectedImage}
            onImageSelect={handleImageSelect}
            onClear={clearImage}
            onDiagnose={handleDiagnoseDisease}
          />

          <CommonDiseasesBarChart
            city={user?.location || null}
            diseases={commonDiseases}
            loading={loadingCommonDiseases}
          />
        </div>

        {/* Results Section */}
        <div className="max-w-7xl mx-auto mt-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {showTips && <DiagnosisTips />}

          <DiagnosisResults
            result={result}
            imagePreview={imagePreview}
            selectedDiseaseIndex={selectedDiseaseIndex}
            diseaseDetails={diseaseDetails}
            loadingDetails={loadingDetails}
            onDiseaseSelect={handleDiseaseSelect}
            onSaveClick={() => setShowSaveModal(true)}
            currentDiagnosisId={currentDiagnosisId}
          />
        </div>
      </div>

      {/* Save Modal */}
      <SaveToCategoryModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        diagnosisData={{
          diagnosis_id: result?.diagnosis_id,
          disease_name: result?.disease?.suggestions?.[selectedDiseaseIndex]?.name || "Unknown Disease",
          confidence_percentage: Math.round((result?.disease?.suggestions?.[selectedDiseaseIndex]?.probability || 0) * 100),
          severity_percentage: diseaseDetails?.severity_assessment?.affected_percentage || 0,
          severity_level: diseaseDetails?.severity_assessment?.severity_level || null,
          image_url: imageUrl,
          plant_name: result?.plant_name || "Unknown Plant",
          diagnosed_date: new Date().toISOString(),
        }}
        onSaveSuccess={handleSaveSuccess}
      />
    </div>
  );
};

export default DiseaseDiagnosisPage;