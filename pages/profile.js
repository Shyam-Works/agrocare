import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from "@/components/Navbar";
import { getSession } from "next-auth/react";
import { useSession } from "next-auth/react";

export default function Profile() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [marketplaceListings, setMarketplaceListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();


  useEffect(() => {
  console.log('\n=== PROFILE PAGE MOUNTED ===');
  console.log('Session data:', {
    id: session?.user?.id,
    first_name: session?.user?.first_name,
    last_name: session?.user?.last_name,
    email: session?.user?.email,
  });
  console.log('=== PROFILE PAGE DATA END ===\n');
}, [session]);
  // Fetch user session and marketplace listings
useEffect(() => {
  const fetchUserData = async () => {
    try {
      setLoading(true);

      console.log('\n=== FETCHING USER DATA ===');
      const sessionResponse = await fetch("/api/auth/session");
      const sessionData = await sessionResponse.json();

      console.log("Session response:", {
        hasUser: !!sessionData?.user,
        first_name: sessionData?.user?.first_name,
        last_name: sessionData?.user?.last_name,
        email: sessionData?.user?.email,
      });

      if (sessionData && sessionData.user) {
        const userData = {
          id: sessionData.user.id,
          email: sessionData.user.email,
          first_name: sessionData.user.first_name || sessionData.user.name?.split(" ")[0],
          last_name: sessionData.user.last_name || sessionData.user.name?.split(" ").slice(1).join(" "),
          role: sessionData.user.role,
          description: sessionData.user.description,
          profile_image_url: sessionData.user.profile_image_url || sessionData.user.image,
          location: sessionData.user.location,
          stats: sessionData.user.stats,
        };
        
        console.log('Setting user state with:', {
          first_name: userData.first_name,
          last_name: userData.last_name,
        });
        
        setUser(userData);

        // Fetch marketplace listings...
        try {
          const listingsResponse = await fetch(`/api/marketplace/user-listings`, {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (listingsResponse.ok) {
            const listingsData = await listingsResponse.json();
            if (listingsData.success) {
              setMarketplaceListings(listingsData.listings || []);
            }
          }
        } catch (listingsError) {
          console.error("Error fetching marketplace listings:", listingsError);
          setMarketplaceListings([]);
        }
      } else {
        console.log("No valid session found, redirecting to login");
        router.push("/login");
        return;
      }
      
      console.log('=== FETCH USER DATA END ===\n');
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Failed to load profile data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  fetchUserData();
}, [router]);

  const handleUpdateProfile = () => {
    router.push("/profile/edit");
  };

  const handleLogout = async () => {
    try {
      // Use NextAuth signOut if available, otherwise clear localStorage
      if (typeof window !== "undefined") {
        const { signOut } = await import("next-auth/react");
        await signOut({ redirect: false });
      }

      // Clear any localStorage tokens as fallback
      localStorage.removeItem("token");
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback: clear localStorage and redirect
      localStorage.removeItem("token");
      router.push("/");
    }
  };

  const handleEditListing = (listingId) => {
    router.push(`/marketplace/edit/${listingId}`);
  };

  const handleDeleteListing = async (listingId) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;

    try {
      const response = await fetch(`/api/marketplace/${listingId}`, {
        method: "DELETE",
        credentials: "include", // Use cookies instead of Authorization header
      });

      const data = await response.json();

      if (data.success) {
        setMarketplaceListings((listings) =>
          listings.filter((listing) => listing._id !== listingId)
        );
        alert("Listing deleted successfully!");
      } else {
        throw new Error(data.error || "Failed to delete listing");
      }
    } catch (error) {
      console.error("Error deleting listing:", error);
      alert(`Failed to delete listing: ${error.message}`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-800 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-green-800 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No user state (shouldn't happen due to redirect, but just in case)
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Please log in to view your profile.
            </p>
            <button
              onClick={() => router.push("/login")}
              className="bg-green-800 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      {/* Hero Section with Background Image */}
      <div
        className="relative h-24 md:h-36 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('/profile-background.png')",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>

        {/* Profile Photo positioned over the hero image */}
        <div className="absolute bottom-0 left-4 md:left-8 transform translate-y-1/2">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-green-600 overflow-hidden bg-white">
            <img
              src={
                user.profile_image_url ||
                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop&crop=face"
              }
              alt="Profile"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src =
                  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop&crop=face";
              }}
            />
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div
        className="min-h-screen pt-16 md:pt-20 px-4 md:px-8 pb-6"
        style={{ backgroundColor: "#f8f9fa" }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Name and Title */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {user.first_name} {user.last_name}
            </h1>
            <p className="text-gray-600 text-base md:text-lg mb-2">
              {user.role}
            </p>
            <p className="text-gray-700 text-sm md:text-base">
              {user.description}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Left Column - Account Info and Stats */}
            <div className="lg:col-span-1 space-y-4 md:space-y-6 ">
              {/* Account Info */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6 shadow-[3px_3px_0px_0px_grey]">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 md:mb-4">
                  Account Info
                </h3>
                <div className="space-y-2 md:space-y-3">
                  <div className="flex items-center space-x-3">
                    <svg
                      className="w-4 h-4 md:w-5 md:h-5 text-gray-500 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      ></path>
                    </svg>
                    <span className="text-gray-700 text-sm md:text-base break-all">
                      {user.email}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <svg
                      className="w-4 h-4 md:w-5 md:h-5 text-gray-500 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      ></path>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      ></path>
                    </svg>
                    <span className="text-gray-700 text-sm md:text-base">
                      {user.location || "Location not set"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6 shadow-[3px_3px_0px_0px_grey]">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 md:mb-4">
                  Stats
                </h3>
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-4 h-4 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        ></path>
                      </svg>
                    </div>


                    
                    <span className="text-gray-700 text-sm md:text-base">
                      Marketplace Listings:
                    </span>
                    <span className="font-semibold text-gray-900 ml-auto text-sm md:text-base">
                      {marketplaceListings.length}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        ></path>
                      </svg>
                    </div>
                    <span className="text-gray-700 text-sm md:text-base">
                      Total Scans:
                    </span>
                    <span className="font-semibold text-gray-900 ml-auto text-sm md:text-base">
                      {user.stats?.total_scans || 0}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-4 h-4 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        ></path>
                      </svg>
                    </div>
                    <span className="text-gray-700 text-sm md:text-base">
                      Last Crop Scan:
                    </span>
                    <span className="font-semibold text-gray-900 ml-auto text-sm md:text-base">
                      {formatDate(user.stats?.last_scan)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Marketplace Listings */}
            <div className="lg:col-span-2 rounded-xl shadow-[3px_3px_0px_0px_grey]">
              <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                    Marketplace Listings
                  </h2>
                </div>

                {marketplaceListings.length === 0 ? (
                  <div className="text-center py-8 md:py-12">
                    <svg
                      className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3 md:mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      ></path>
                    </svg>
                    <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">
                      No listings yet
                    </h3>
                    <p className="text-gray-500 mb-3 md:mb-4 text-sm md:text-base">
                      Start selling your products on the marketplace
                    </p>
                    <button
                      onClick={() => router.push("/essentials")}
                      className="bg-green-800 text-white px-4 py-2 md:px-6 md:py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium text-sm md:text-base"
                      style={{ backgroundColor: "#1c352d" }}
                    >
                      Create First Listing
                    </button>
                  </div>
                ) : (
                  <div className="max-h-[300px] overflow-y-auto space-y-3 md:space-y-4">
                    {marketplaceListings.map((listing) => (
                      <div
                        key={listing._id}
                        className="flex items-center justify-between p-3 md:p-4 border border-gray-200 rounded-lg md:rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3 md:space-x-4 flex-grow min-w-0">
                          <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg md:rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                            <img
                              src={
                                listing.images?.[0] ||
                                "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=64&h=64&fit=crop"
                              }
                              alt={listing.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src =
                                  "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=64&h=64&fit=crop";
                              }}
                            />
                          </div>
                          <div className="flex-grow min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm md:text-lg truncate">
                              {listing.title}
                            </h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs md:text-sm text-gray-500">
                                ${listing.price}
                              </span>
                              <span className="text-xs md:text-sm text-gray-400">
                                • {listing.category}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col md:flex-row items-end md:items-center space-y-1 md:space-y-0 md:space-x-2 flex-shrink-0">
                          <button
                            onClick={() => handleEditListing(listing._id)}
                            className="bg-[#f6bd60] text-white px-2 py-1 md:px-4 md:py-2 rounded-md md:rounded-lg text-xs md:text-sm font-medium hover:bg-[#e0a44f] transition-colors min-w-0"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDeleteListing(listing._id)}
                            className="bg-[#ef233c] text-white px-2 py-1 md:px-4 md:py-2 rounded-md md:rounded-lg text-xs md:text-sm font-medium hover:bg-[#d90429] transition-colors min-w-0"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons Section */}
          <div className="mt-6 md:mt-8">
            {/* Mobile: Horizontal scrollable buttons */}
            <div className="block md:hidden">
              <div className="flex space-x-3 overflow-x-auto pb-2">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="bg-green-800 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium text-sm whitespace-nowrap flex-shrink-0"
                >
                  Dashboard
                </button>
                <button
                  onClick={handleUpdateProfile}
                  className="bg-green-800 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium text-sm whitespace-nowrap flex-shrink-0"
                >
                  Update Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium text-sm whitespace-nowrap flex-shrink-0"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Desktop: Fixed bottom-left buttons */}
            <div className="hidden md:block">
              <div className="fixed bottom-6 left-8 flex space-x-4">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="bg-green-800 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium shadow-lg"
                  style={{ backgroundColor: "#1c352d" }}
                >
                  Dashboard
                </button>
                <button
                  onClick={handleUpdateProfile}
                  className="bg-green-800 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium shadow-lg"
                  style={{ backgroundColor: "#1c352d" }}
                >
                  Update Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-warning text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium shadow-lg"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
