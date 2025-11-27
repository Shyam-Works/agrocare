// pages/essentials.js - Updated with Components

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import ProductCard from "../components/marketplace/ProductCard";
import CreateListingForm from "../components/marketplace/CreateListingForm";
import MarketplaceFilters from "../components/marketplace/MarketplaceFilters";

export default function Marketplace() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("buy");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [user, setUser] = useState(null);

  const router = useRouter();

  // Utility function to capitalize each word
  const capitalizeWords = (text) => {
    if (!text) return "";
    return text
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Check authentication on mount
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
            location: data.user.location,
          });
        }
      })
      .catch((error) => {
        console.error("Auth error:", error);
      });
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (selectedCategory !== "all")
        params.append("category", selectedCategory);
      if (activeTab === "sell" || activeTab === "rent")
        params.append("type", activeTab);
      if (searchTerm) params.append("search", searchTerm);
      if (locationFilter) params.append("location", locationFilter);

      const response = await fetch(`/api/marketplace?${params}`);
      const data = await response.json();

      if (data.success) {
        setListings(data.data);
      }
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "buy") {
      fetchListings();
    }
  }, [selectedCategory, activeTab, searchTerm, locationFilter]);

  const handleCreateListing = () => {
    if (!user) {
      alert("Please log in to create a listing");
      router.push("/login");
      return;
    }
    setShowCreateForm(true);
    setActiveTab("sell");
  };

  const handleTabChange = (tab) => {
    if (tab === "sell") {
      if (!user) {
        alert("Please log in to create a listing");
        router.push("/login");
        return;
      }
      setShowCreateForm(true);
    } else {
      setShowCreateForm(false);
    }
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AgroCare Marketplace
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Buy Or Sell Farming Tools, Plants And More - Powered By Our
            Community Of Growers
          </p>

          {/* Buy/Sell Toggle */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => handleTabChange("buy")}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === "buy"
                  ? "bg-green-700 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              BUY
            </button>
            <button
              onClick={() => handleTabChange("sell")}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                showCreateForm
                  ? "bg-green-700 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              SELL
            </button>
          </div>
        </div>

        {/* Login Required Message for Selling */}
        {activeTab === "sell" && !user && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-yellow-800">
                  Login Required
                </h3>
                <p className="text-yellow-600">
                  Please Log In To Create Marketplace Listings.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        {!showCreateForm && (
          <MarketplaceFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            priceFilter={priceFilter}
            setPriceFilter={setPriceFilter}
            locationFilter={locationFilter}
            setLocationFilter={setLocationFilter}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        )}

        {/* Create Listing Form */}
        {showCreateForm && user && (
          <CreateListingForm
            onClose={() => {
              setShowCreateForm(false);
              setActiveTab("buy");
            }}
            onSuccess={() => {
              setShowCreateForm(false);
              setActiveTab("buy");
              fetchListings();
            }}
          />
        )}

        {/* Products Grid */}
        {!showCreateForm && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Products</h2>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {listings.map((listing) => (
                  <ProductCard
                    key={listing._id}
                    listing={listing}
                    currentUser={user}
                  />
                ))}
              </div>
            )}

            {!loading && listings.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No Listings Found Matching Your Criteria.
                </p>
                <button
                  onClick={handleCreateListing}
                  className="mt-4 bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 transition-colors"
                >
                  Create First Listing
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}