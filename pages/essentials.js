// pages/essentials.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/Navbar";

const categories = [
  "Plants",
  "Tools",
  "Seeds",
  "Pest",
  "Fertilizers",
  "Rental",
];

function ProductModal({ listing, isOpen, onClose, currentUser }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!isOpen || !listing) return null;

  // Debug: Let's see the entire listing object structure
  console.log("=== FULL LISTING OBJECT ===", listing);
  console.log("=== USER_ID OBJECT ===", listing.user_id);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
    }).format(price);
  };

  const nextImage = () => {
    if (listing.images && listing.images.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === listing.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (listing.images && listing.images.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? listing.images.length - 1 : prev - 1
      );
    }
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  // Close modal when clicking outside
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50"
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* Image Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {listing.images && listing.images.length > 0 ? (
                <>
                  <Image
                    src={listing.images[currentImageIndex]}
                    alt={listing.title}
                    fill
                    className="object-cover"
                  />

                  {/* Image Navigation Arrows */}
                  {listing.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg"
                      >
                        <svg
                          className="w-5 h-5 text-gray-800"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </button>

                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg"
                      >
                        <svg
                          className="w-5 h-5 text-gray-800"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg
                    className="w-16 h-16 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Image Thumbnails */}
            {listing.images && listing.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {listing.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                      index === currentImageIndex
                        ? "border-green-500"
                        : "border-gray-200"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${listing.title} ${index + 1}`}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details Section */}
          <div className="space-y-6">
            {/* Product Info */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium capitalize">
                  {listing.type}
                </span>
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                  {listing.category}
                </span>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {listing.title}
              </h1>

              <p className="text-3xl font-bold text-green-600 mb-4">
                {formatPrice(listing.price)}
              </p>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Description
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {listing.description}
              </p>
            </div>

            {/* Location */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Location
              </h3>
              <p className="text-gray-700 flex items-center">
                <svg
                  className="w-5 h-5 text-gray-400 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {listing.location}
              </p>
            </div>

            {/* Seller Info */}
            {listing.user_id && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Seller
                </h3>
                <div className="flex items-center space-x-3">
                  {/* Profile Image - Check if this is the current user's listing */}
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                    {/* If this is the current user's listing, use session data */}
                    {currentUser && listing.user_id._id === currentUser.id ? (
                      currentUser.profile_image_url || currentUser.image ? (
                        <img
                          src={
                            currentUser.profile_image_url || currentUser.image
                          }
                          alt={`${
                            currentUser.first_name ||
                            currentUser.name?.split(" ")[0]
                          } ${currentUser.last_name || ""}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // If image fails to load, show initials
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-green-600 flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">
                            {(
                              currentUser.first_name ||
                              currentUser.name?.split(" ")[0]
                            )?.charAt(0)}
                            {(
                              currentUser.last_name ||
                              currentUser.name?.split(" ").slice(1).join(" ")
                            )?.charAt(0)}
                          </span>
                        </div>
                      )
                    ) : /* For other users, check populated data */
                    listing.user_id.profile_image_url ||
                      listing.user_id.image ? (
                      <>
                        <img
                          src={
                            listing.user_id.profile_image_url ||
                            listing.user_id.image
                          }
                          alt={`${listing.user_id.first_name} ${listing.user_id.last_name}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // If image fails to load, show initials
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                        <div
                          className="w-full h-full bg-green-600 items-center justify-center"
                          style={{ display: "none" }}
                        >
                          <span className="text-white font-semibold text-lg">
                            {listing.user_id.first_name?.charAt(0)}
                            {listing.user_id.last_name?.charAt(0)}
                          </span>
                        </div>
                      </>
                    ) : (
                      // Fallback to initials when no image URL
                      <div className="w-full h-full bg-green-600 flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {listing.user_id.first_name?.charAt(0)}
                          {listing.user_id.last_name?.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {listing.user_id.first_name} {listing.user_id.last_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {listing.user_id.email}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {/* Contact Info */}
            {listing.contact_info && (
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Contact Information
                </h3>
                <div className="space-y-2">
                  {listing.contact_info.phone && (
                    <p className="flex items-center text-gray-700">
                      <svg
                        className="w-5 h-5 text-green-600 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      {listing.contact_info.phone}
                    </p>
                  )}
                  {listing.contact_info.email && (
                    <p className="flex items-center text-gray-700">
                      <svg
                        className="w-5 h-5 text-green-600 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      {listing.contact_info.email}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Posted Date */}
            <div className="text-sm text-gray-500 border-t pt-4">
              Posted on{" "}
              {new Date(listing.created_at).toLocaleDateString("en-CA", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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

  // Check authentication on mount
  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        console.log("Session response:", data); // Debug log

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
            Buy or sell farming tools, plants and more - powered by our
            community of growers
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
                  Please log in to create marketplace listings.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        {!showCreateForm && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              <input
                type="text"
                placeholder="Price range (e.g., 10-100)"
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />

              <input
                type="text"
                placeholder="Location"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Category Filters */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                Browse categories
              </h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-4 py-2 rounded-full font-medium transition-colors ${
                    selectedCategory === "all"
                      ? "bg-green-700 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full font-medium transition-colors ${
                      selectedCategory === category
                        ? "bg-green-700 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
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
                {" "}
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>{" "}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {" "}
                {listings.map((listing) => (
                  <ProductCard key={listing._id} listing={listing} />
                ))}{" "}
              </div>
            )}

            {!loading && listings.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No listings found matching your criteria.
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

// Update the ProductCard component
function ProductCard({ listing }) {
  const [showModal, setShowModal] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
    }).format(price);
  };

  return (
    <>
      <div
        className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer"
        onClick={() => setShowModal(true)}
      >
        {/* Container for the responsive layout */}
        <div className="flex flex-col md:flex-row">
          {/* Image Container */}
          <div className="w-full md:w-1/3 aspect-square relative flex-shrink-0">
            {listing.images && listing.images[0] ? (
              <Image
                src={listing.images[0]}
                alt={listing.title}
                fill
                className="object-cover rounded-t-lg md:rounded-l-lg md:rounded-tr-none"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-t-lg md:rounded-l-lg md:rounded-tr-none">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Details Container */}
          <div className="w-full md:w-2/3 p-4 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                {listing.title}
              </h3>
              <p className="text-sm text-green-700 font-medium mb-1 capitalize">
                {listing.type}
              </p>
              <p className="text-sm text-gray-600 mb-2">{listing.location}</p>
            </div>
            <div className="mt-auto">
              <p className="text-lg font-bold text-gray-900">
                {formatPrice(listing.price)}
              </p>
              {listing.user_id && (
                <p className="text-xs text-gray-500 mt-2">
                  By {listing.user_id.first_name} {listing.user_id.last_name}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Product Modal */}
      <ProductModal
        listing={listing}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}
// Create Listing Form Component
function CreateListingForm({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    type: "sell",
    category: "Tools",
    location: "",
    contact_info: {
      phone: "",
      email: "",
    },
    images: [],
  });
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Update the handleSubmit function in CreateListingForm component
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Remove the localStorage token logic - NextAuth handles sessions automatically
      const response = await fetch("/api/marketplace", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Remove the Authorization header - NextAuth uses cookies
        },
        credentials: "include", // Important: include cookies for session
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert("Listing created successfully!");
        onSuccess();
      } else {
        // Handle specific error cases
        if (response.status === 401) {
          alert("Please log in to create a listing");
          // Optionally redirect to login
          window.location.href = "/login";
        } else {
          alert("Error creating listing: " + (data.error || data.message));
        }
      }
    } catch (error) {
      console.error("Error creating listing:", error);
      alert("Error creating listing: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("contact_info.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        contact_info: {
          ...prev.contact_info,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("type", "marketplace"); // New type for marketplace images

      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      const data = await res.json();

      if (data.secure_url) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, data.secure_url],
        }));
      } else {
        alert("Image upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Create Listing</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Pure cow milk"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price ($)
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="5"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Pure cow milk, sourced fresh daily from healthy, grass-fed cows..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="sell"
                  checked={formData.type === "sell"}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                Sell
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="rent"
                  checked={formData.type === "rent"}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                Rent
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Markham, ON"
          />
        </div>

        {/* Image Upload Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Images
          </label>
          <div className="space-y-4">
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
              >
                {uploadingImage ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Add Image
                  </>
                )}
              </label>
            </div>

            {/* Image Preview */}
            {formData.images.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {formData.images.map((imageUrl, index) => (
                  <div key={index} className="relative">
                    <img
                      src={imageUrl}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Phone
            </label>
            <input
              type="text"
              name="contact_info.phone"
              value={formData.contact_info.phone}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="(123) 456-7890"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Email
            </label>
            <input
              type="email"
              name="contact_info.email"
              value={formData.contact_info.email}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder=""
            />
          </div>
        </div>
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 rounded-lg bg-green-700 text-white hover:bg-green-800 transition-colors"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Listing"}
          </button>
        </div>
      </form>
    </div>
  );
}
