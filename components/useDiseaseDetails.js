import { useState } from "react";

export const useDiseaseDetails = () => {
  const [diseaseDetails, setDiseaseDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchDiseaseDetails = async (diseaseName, plantName = null, imageUrlToUse = null) => {
    setLoadingDetails(true);
    try {
      console.log('=== Fetching Disease Details ===');
      console.log('Disease:', diseaseName);
      console.log('Plant:', plantName);
      console.log('Image URL:', imageUrlToUse ? 'Provided' : 'Not provided');

      const response = await fetch("/api/get-disease-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          diseaseName,
          plantName,
          imageUrl: imageUrlToUse,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch disease details");
      }

      const data = await response.json();
      console.log('=== Disease Details Response ===');
      console.log('Image analyzed:', data.imageAnalyzed);
      console.log('Has severity assessment:', !!data.details?.severity_assessment);
      
      setDiseaseDetails(data.details);
      return data.details;
    } catch (error) {
      console.error("Error fetching disease details:", error);
      throw error;
    } finally {
      setLoadingDetails(false);
    }
  };

  return {
    diseaseDetails,
    loadingDetails,
    fetchDiseaseDetails,
    setDiseaseDetails,
  };
};

export default useDiseaseDetails;