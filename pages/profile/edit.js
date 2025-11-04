import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession, getSession } from "next-auth/react";

export default function EditProfile() {
  const { data: session, update: updateSession } = useSession(); // Add updateSession
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    location: "",
    description: "",
    profile_image_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        // Use NextAuth session directly instead of fetch
        if (session && session.user) {
          const userData = {
            id: session.user.id,
            email: session.user.email,
            first_name:
              session.user.first_name || session.user.name?.split(" ")[0] || "",
            last_name:
              session.user.last_name ||
              session.user.name?.split(" ").slice(1).join(" ") ||
              "",
            profile_image_url:
              session.user.profile_image_url || session.user.image || "",
            location: session.user.location || "",
            description: session.user.description || "",
            stats: session.user.stats,
          };

          setUser(userData);

          // Initialize form with user data
          setFormData({
            first_name: userData.first_name,
            last_name: userData.last_name,
            location: userData.location,
            description: userData.description,
            profile_image_url: userData.profile_image_url,
          });
        } else {
          // No valid session - redirect to login
          console.log("No valid session found, redirecting to login");
          router.push("/login");
          return;
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load profile data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (session !== undefined) {
      // Wait for session to load
      fetchUserData();
    }
  }, [session, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = async (file, error) => {
    if (error) {
      console.error("File upload error:", error);
      setError(error);
      return;
    }

    if (!file) {
      return;
    }

    try {
      setImageUploading(true);
      setError("");

      // Create FormData to send file
      const formDataForUpload = new FormData();
      formDataForUpload.append("file", file);
      formDataForUpload.append("type", "profile");

      // Upload to your existing API route
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataForUpload,
      });

      const data = await response.json();

      if (response.ok && data.secure_url) {
        // Update form with new Cloudinary URL
        setFormData((prev) => ({
          ...prev,
          profile_image_url: data.secure_url,
        }));

        console.log("Image uploaded successfully:", data.secure_url);
      } else {
        console.error("Upload failed:", data.error);
        setError(data.error || "Image upload failed. Please try again.");
      }
    } catch (uploadError) {
      console.error("Upload error:", uploadError);
      setError(
        "Network error during image upload. Please check your connection and try again."
      );
    } finally {
      setImageUploading(false);
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setUpdating(true);
  setError(null);
  setSuccess(false);

  try {
    console.log('\n=== EDIT PROFILE SUBMIT START ===');
    console.log('Current session:', {
      id: session?.user?.id,
      first_name: session?.user?.first_name,
      last_name: session?.user?.last_name,
    });
    
    const submitData = {
      userId: session?.user?.id,
      first_name: formData.first_name,
      last_name: formData.last_name,
      location: formData.location,
      description: formData.description,
      profile_image_url: formData.profile_image_url
    };

    console.log('Submitting update with data:', submitData);

    const response = await fetch("/api/auth/update-profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: 'include',
      body: JSON.stringify(submitData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || "Failed to update profile");
    }

    console.log('✅ API response:', data);
    console.log('Updated user from API:', data.user);
    setSuccess(true);

    // Wait for DB to settle
    console.log('Waiting 500ms for DB to settle...');
    await new Promise(resolve => setTimeout(resolve, 500));

    // Trigger session update
    console.log('🔄 Calling updateSession()...');
    const result = await updateSession();
    console.log('updateSession() returned:', result);

    // Wait a bit more for session to fully update
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if session updated
    console.log('Fetching fresh session to verify update...');
    const freshSessionResponse = await fetch('/api/auth/session');
    const freshSession = await freshSessionResponse.json();
    console.log('Fresh session after update:', {
      first_name: freshSession?.user?.first_name,
      last_name: freshSession?.user?.last_name,
    });

    console.log('=== EDIT PROFILE SUBMIT END ===\n');

    // Redirect
    setTimeout(() => {
      console.log('Redirecting to profile page...');
      router.push("/profile");
    }, 1000);

  } catch (error) {
    console.error("❌ Error updating profile:", error);
    setError(error.message);
  } finally {
    setUpdating(false);
  }
};

  // Show loading while session is loading
  if (session === undefined || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-800"></div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-12">
      <div className="max-w-2xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <button
            onClick={() => router.push("/profile")}
            className="flex items-center text-green-800 hover:text-green-700 mb-4 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              ></path>
            </svg>
            Back to Profile
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Update Profile
          </h1>
          <p className="text-gray-600 mt-2">Update your personal information</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl mb-6">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              Profile updated successfully! Redirecting...
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Edit Form */}
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Profile Image
              </label>
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-4 border-gray-200">
                  <img
                    src={
                      formData.profile_image_url ||
                      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop&crop=face"
                    }
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop&crop=face";
                    }}
                  />
                </div>
                <div>
                  <label
                    className={`bg-green-800 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors cursor-pointer font-medium ${
                      imageUploading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {imageUploading ? "Uploading..." : "Choose New Image"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          // Check file size (5MB limit)
                          if (file.size > 5 * 1024 * 1024) {
                            handleImageUpload(
                              null,
                              "File size should be less than 5MB"
                            );
                            return;
                          }
                          handleImageUpload(file, null);
                        }
                      }}
                      className="hidden"
                      disabled={imageUploading}
                    />
                  </label>
                  <p className="text-sm text-gray-500 mt-2">
                    JPG, PNG up to 5MB
                  </p>
                  {imageUploading && (
                    <div className="flex items-center mt-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-800 mr-2"></div>
                      <span className="text-sm text-green-700">
                        Uploading image...
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="first_name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  First Name *
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-800 focus:border-transparent transition-all"
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <label
                  htmlFor="last_name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Last Name *
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-800 focus:border-transparent transition-all"
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-800 focus:border-transparent transition-all"
                placeholder="Enter your location"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-800 focus:border-transparent transition-all resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
              <button
                type="button"
                onClick={() => router.push("/profile")}
                className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => router.push("/change-password")}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                Change Password
              </button>
              <button
                type="submit"
                disabled={updating || imageUploading}
                className="w-full sm:w-auto px-6 py-3 bg-green-800 text-white rounded-xl hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {updating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  "Update Profile"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
