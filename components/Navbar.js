import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Navbar - Token from localStorage:", token); // Debug log
    
    if (token) {
      // Verify token and get user info
      fetch("/api/auth/verify", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          console.log("Navbar - Response status:", res.status); // Debug log
          return res.json();
        })
        .then((data) => {
          console.log("Navbar - API Response:", data); // Debug log
          if (data.user && data.success !== false) {
            setUser(data.user);
            console.log("Navbar - User profile_image_url:", data.user.profile_image_url); // Debug log
          } else {
            console.log("Navbar - No user found or verification failed");
            localStorage.removeItem("token");
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("Navbar - API Error:", error); // Debug log
          localStorage.removeItem("token");
          setLoading(false);
        });
    } else {
      console.log("Navbar - No token found");
      setLoading(false);
    }
  }, []);

  // Don't render anything while loading to prevent flash
  if (loading) {
    return (
      <nav className="bg-green-800 px-6 py-4 flex items-center justify-between">
        {/* Logo Section - Far Left */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <img 
              src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=40&h=40&fit=crop&crop=center" 
              alt="AgroCare Logo" 
              className="w-8 h-8 rounded-full object-cover"
            />
          </div>
          <h1 className="text-white text-xl font-semibold">AgroCare</h1>
        </div>

        {/* Navigation Links - Center */}
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/HowToStart" className="text-green-100 hover:text-white transition-colors duration-200 font-medium">
            How to Start
          </Link>
          <Link href="/identification" className="text-green-100 hover:text-white transition-colors duration-200 font-medium">
            Identification
          </Link>
          <Link href="/diagnoses" className="text-green-100 hover:text-white transition-colors duration-200 font-medium">
            Diagnoses
          </Link>
          <Link href="/essentials" className="text-green-100 hover:text-white transition-colors duration-200 font-medium">
            Essentials
          </Link>
          <Link href="/about" className="text-green-100 hover:text-white transition-colors duration-200 font-medium">
            About Us
          </Link>
        </div>

        {/* Loading placeholder */}
        <div className="w-12 h-12 rounded-full border-2 border-white bg-white/20 animate-pulse"></div>
      </nav>
    );
  }
  
  return (
    <nav className="bg-green-800 px-6 py-4 flex items-center justify-between">
      {/* Logo Section - Far Left */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
          <img 
            src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=40&h=40&fit=crop&crop=center" 
            alt="AgroCare Logo" 
            className="w-8 h-8 rounded-full object-cover"
          />
        </div>
        <h1 className="text-white text-xl font-semibold">AgroCare.IO</h1>
      </div>

      {/* Navigation Links - Center */}
      <div className="hidden md:flex items-center space-x-8">
        <Link href="/HowToStart" className="text-green-100 hover:text-white transition-colors duration-200 font-medium">
          How to Start
        </Link>
        <Link href="/identification" className="text-green-100 hover:text-white transition-colors duration-200 font-medium">
          Identification
        </Link>
        <Link href="/diagnoses" className="text-green-100 hover:text-white transition-colors duration-200 font-medium">
          Diagnoses
        </Link>
        <Link href="/essentials" className="text-green-100 hover:text-white transition-colors duration-200 font-medium">
          Essentials
        </Link>
        <Link href="/about" className="text-green-100 hover:text-white transition-colors duration-200 font-medium">
          About Us
        </Link>
      </div>

      {/* User Profile Section - Far Right */}
      <div className="flex items-center">
        {user ? (
          <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden">
            <img 
              src={user.profile_image_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop&crop=face"} 
              alt="User Profile" 
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error("Navbar - Image load error for:", user.profile_image_url);
                e.target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop&crop=face";
              }}
            />
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <Link href="/login" className="bg-white text-green-800 px-4 py-2 rounded-full font-medium hover:bg-green-50 transition-colors duration-200">
              Login
            </Link>
            <Link href="/register" className="bg-green-600 text-white px-4 py-2 rounded-full font-medium hover:bg-green-700 border border-white transition-colors duration-200">
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}