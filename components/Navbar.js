// components/Navbar.js
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, User, LogOut, ChevronDown } from "lucide-react";

const Navbar = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const user = session?.user;

  const timeoutRef = useRef(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    setShowProfileDropdown(false);
    router.push("/");
  };

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Identification", path: "/identification" },
    { name: "Disease Diagnosis", path: "/disease-diagnosis"},
    { name: "Dashboard", path: "/dashboard"},
    { name: "Marketplace", path: "/essentials" },
    { name: "How to Start", path: "" },
  ];

  const filteredNavItems = navItems.filter((item) => {
    if (item.protected && !user) return false;
    return true;
  });

  return (
    <nav
      className={`sticky top-0 z-40 transition-all duration-500 ${
        scrolled
          ? "bg-[#fbf6eb]/50 backdrop-blur-xl"
          : "bg-white/50 backdrop-blur-md"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="AgroCare Logo"
              className="h-10 w-10 object-contain"
            />
            <span className="text-2xl font-bold text-[#1c352d]">Agrocare</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {filteredNavItems.map((item) => {
              const isActive = router.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className="relative px-4 py-2"
                >
                  <span
                    className={`relative z-10 text-sm font-medium transition-colors duration-300 text-[1.2rem] ${
                      isActive ? "text-[#1c352d]" : "text-gray-700"
                    }`}
                  >
                    {item.name}
                  </span>

                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full h-0.5 bg-[#1c352d]"></div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="flex space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
                <div className="w-16 h-6 rounded-md bg-gray-200 animate-pulse"></div>
              </div>
            ) : user ? (
              <div
                className="relative"
                onMouseEnter={() => {
                  if (timeoutRef.current) clearTimeout(timeoutRef.current);
                  setShowProfileDropdown(true);
                }}
                onMouseLeave={() => {
                  timeoutRef.current = setTimeout(
                    () => setShowProfileDropdown(false),
                    500
                  );
                }}
              >
                {/* Avatar + Name */}
                <div className="flex items-center space-x-3 px-3 py-2 rounded-xl transition-all duration-300 cursor-pointer">
                  <div className="relative">
                    <img
                      src={
                        user.profile_image_url ||
                        user.image ||
                        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
                      }
                      alt="Profile"
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-[#1c352d]/20"
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user.first_name || user.name?.split(" ")[0] || "User"}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition-all duration-300 ${
                      showProfileDropdown ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {/* Dropdown */}
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-1 w-52 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 py-2 px-2 z-50">
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      <User className="w-4 h-4 mr-3" />
                      Profile
                    </Link>
                    <div className="h-px bg-gray-200 my-2"></div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-3">
                <Link
                  href="/login"
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2.5 text-sm font-medium text-white rounded-xl bg-[#1c352d]"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="relative p-2 text-gray-700 focus:outline-none rounded-lg transition-all duration-300"
            >
              <div className="relative w-6 h-6">
                <Menu
                  className={`absolute inset-0 h-6 w-6 transition-all duration-300 ${
                    isMenuOpen
                      ? "opacity-0 rotate-90 scale-0"
                      : "opacity-100 rotate-0 scale-100"
                  }`}
                />
                <X
                  className={`absolute inset-0 h-6 w-6 transition-all duration-300 ${
                    isMenuOpen
                      ? "opacity-100 rotate-0 scale-100"
                      : "opacity-0 -rotate-90 scale-0"
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
            isMenuOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200 rounded-b-2xl">
            {filteredNavItems.map((item) => {
              const isActive = router.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ${
                    isActive
                      ? "text-[#1c352d] border-l-4 border-[#1c352d]"
                      : "text-gray-700"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              );
            })}

            {/* Mobile Auth */}
            {loading ? (
              <div className="px-3 py-2 space-y-2">
                <div className="w-full h-12 rounded-xl bg-gray-200 animate-pulse"></div>
              </div>
            ) : user ? (
              <div className="px-3 py-3 border-t border-gray-200 mt-2">
                <div className="flex items-center space-x-3 mb-3 p-3 rounded-xl bg-gray-50">
                  <div className="relative">
                    <img
                      src={
                        user.profile_image_url ||
                        user.image ||
                        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
                      }
                      alt="Profile"
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-[#1c352d]/20"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#1c352d] rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {user.first_name || user.name?.split(" ")[0] || "User"}{" "}
                      {user.last_name ||
                        user.name?.split(" ").slice(1).join(" ") ||
                        ""}
                    </p>
                    <p className="text-xs text-gray-600">{user.email}</p>
                  </div>
                </div>
                <Link
                  href="/profile"
                  className="flex items-center px-4 py-3 text-base font-medium text-gray-700 rounded-xl transition-all duration-300 mb-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="w-5 h-5 mr-3" />
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-3 text-base font-medium text-gray-700 rounded-xl transition-all duration-300"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Sign out
                </button>
              </div>
            ) : (
              <div className="px-3 py-3 border-t border-gray-200 space-y-2 mt-2">
                <Link
                  href="/login"
                  className="block w-full px-4 py-3 text-center text-gray-700 border-2 border-gray-200 rounded-xl font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="block w-full px-4 py-3 text-center bg-[#1c352d] text-white rounded-xl font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
