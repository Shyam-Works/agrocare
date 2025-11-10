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

  const { diseaseDetails, loadingDetails, fetchDiseaseDetails, setDiseaseDetails } = useDiseaseDetails();
  const { commonDiseases, loadingCommonDiseases, fetchCommonDiseases } = useCommonDiseases();

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

  const handleImageSelect = (file, previewUrl) => {
    setSelectedImage(file);
    setImagePreview(previewUrl);
    setResult(null);
    setError(null);
    setDiseaseDetails(null);
    setSelectedDiseaseIndex(0);
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

      if (diagnosisResult.diagnosis_id) {
        setCurrentDiagnosisId(diagnosisResult.diagnosis_id);
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
      setError(error.message);
    } finally {
      setUploading(false);
      setDiagnosing(false);
    }
  };

  const handleDiseaseSelect = (index) => {
    setSelectedDiseaseIndex(index);
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
  };

  const handleSaveSuccess = (category) => {
    console.log("Saved to category:", category);
  };

  const showTips = !selectedImage && !result;

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