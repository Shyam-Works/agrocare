import { useState } from "react";

export const useCommonDiseases = () => {
  const [commonDiseases, setCommonDiseases] = useState([]);
  const [loadingCommonDiseases, setLoadingCommonDiseases] = useState(false);

  const fetchCommonDiseases = async (location) => {
    if (!location || location === "Unknown City") {
      setCommonDiseases([]);
      return;
    }

    setLoadingCommonDiseases(true);
    try {
      const response = await fetch("/api/common-diseases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ location }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch common diseases");
      }

      const data = await response.json();
      setCommonDiseases(data.diseases || []);
    } catch (error) {
      console.error("Error fetching common diseases:", error);
      setCommonDiseases([]);
    } finally {
      setLoadingCommonDiseases(false);
    }
  };

  return {
    commonDiseases,
    loadingCommonDiseases,
    fetchCommonDiseases,
  };
};

export default useCommonDiseases;