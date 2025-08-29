import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLink, setActiveLink] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  // Navigation links array
  const navLinks = [
    { href: "/HowToStart", label: "How to Start", id: "how-to-start" },
    { href: "/identification", label: "Identification", id: "identification" },
    { href: "/disease-diagnosis", label: "Diagnoses", id: "diagnoses" },
    { href: "/essentials", label: "Essentials", id: "essentials" },
    { href: "/about", label: "About Us", id: "about" }
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (token) {
      fetch("/api/auth/verify", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user && data.success !== false) {
            setUser(data.user);
          } else {
            localStorage.removeItem("token");
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("Auth error:", error);
          localStorage.removeItem("token");
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  // Set active link based on current route
  useEffect(() => {
    const currentPath = router.pathname;
    const activeNavItem = navLinks.find(link => link.href === currentPath);
    if (activeNavItem) {
      setActiveLink(activeNavItem.id);
    }
  }, [router.pathname]);

  const handleLinkClick = (e, linkId, href) => {
    e.preventDefault();
    setActiveLink(linkId);
    setMobileMenuOpen(false);
    
    setTimeout(() => {
      router.push(href);
    }, 150);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setMobileMenuOpen(false);
    router.push("/");
  };

  // Close mobile menu when clicking outside or on route change
  useEffect(() => {
    const handleRouteChange = () => {
      setMobileMenuOpen(false);
    };

    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  if (loading) {
    return (
      <nav className="bg-green-800 px-6 py-4 flex items-center justify-between relative z-50">
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
        <div className="w-12 h-12 rounded-full border-2 border-white bg-white/20 animate-pulse"></div>
      </nav>
    );
  }
  
  return (
    <>
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <nav className="bg-green-800 px-6 py-4 flex items-center justify-between relative z-50">
        {/* Logo Section */}
        <Link href="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity duration-200">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <img 
              src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=40&h=40&fit=crop&crop=center" 
              alt="AgroCare Logo" 
              className="w-8 h-8 rounded-full object-cover"
            />
          </div>
          <h1 className="text-white text-xl font-semibold">AgroCare.IO</h1>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className={`
                relative text-green-100 hover:text-white transition-colors duration-200 font-medium py-2 px-1
                ${activeLink === link.id ? 'text-white' : ''}
              `}
              onClick={(e) => handleLinkClick(e, link.id, link.href)}
            >
              {link.label}
              {/* Individual Bottom-Up Underline */}
              <span className={`
                absolute bottom-0 left-0 w-full h-0.5 bg-white transform origin-bottom transition-all duration-300 ease-out
                ${activeLink === link.id 
                  ? 'scale-y-100 opacity-100' 
                  : 'scale-y-0 opacity-0 hover:scale-y-100 hover:opacity-100'
                }
              `}></span>
            </Link>
          ))}
        </div>

        {/* Desktop User Profile Section */}
        <div className="hidden md:flex items-center">
          {user ? (
            <div className="group relative">
              <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden group-hover:border-green-200 transition-colors duration-200 cursor-pointer">
                <img 
                  src={user.profile_image_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop&crop=face"} 
                  alt="User Profile" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop&crop=face";
                  }}
                />
              </div>
              
              {/* Desktop Profile Dropdown */}
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60]">
                <div className="py-2">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    {user.name || user.email}
                  </div>
                  <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200">
                    Profile
                  </Link>
                  <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200">
                    Settings
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors duration-200"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link 
                href="/login" 
                className="bg-white text-green-800 px-4 py-2 rounded-full font-medium hover:bg-green-50 hover:shadow-md transform hover:scale-105 transition-all duration-200"
              >
                Login
              </Link>
              <Link 
                href="/register" 
                className="bg-green-600 text-white px-4 py-2 rounded-full font-medium hover:bg-green-700 border border-white hover:shadow-md transform hover:scale-105 transition-all duration-200"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-white hover:text-green-200 transition-colors duration-200 p-2 relative z-[70]"
        >
          <div className="w-6 h-6 flex flex-col justify-center items-center">
            <span className={`block w-6 h-0.5 bg-current transform transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : '-translate-y-1'}`}></span>
            <span className={`block w-6 h-0.5 bg-current transform transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
            <span className={`block w-6 h-0.5 bg-current transform transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : 'translate-y-1'}`}></span>
          </div>
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      <div className={`
        fixed top-[72px] left-0 right-0 bg-green-800 border-t border-green-700 z-50 md:hidden
        transform transition-all duration-300 ease-out shadow-lg
        ${mobileMenuOpen 
          ? 'opacity-100 translate-y-0 visible max-h-screen' 
          : 'opacity-0 -translate-y-4 invisible max-h-0'
        }
      `}>
        <div className="px-6 py-4 space-y-4 max-h-[calc(100vh-72px)] overflow-y-auto">
          {/* Mobile Navigation Links */}
          <div className="space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className={`
                  block text-green-100 hover:text-white transition-colors duration-200 font-medium py-2 rounded-lg
                  ${activeLink === link.id ? 'text-white bg-green-700 px-3' : 'hover:bg-green-700 px-3'}
                `}
                onClick={(e) => handleLinkClick(e, link.id, link.href)}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile User Section */}
          {user ? (
            <div className="pt-4 border-t border-green-700 space-y-3">
              <div className="flex items-center space-x-3 pb-2 px-3">
                <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
                  <img 
                    src={user.profile_image_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"} 
                    alt="User Profile" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face";
                    }}
                  />
                </div>
                <div className="text-white font-medium">{user.name || user.email}</div>
              </div>
              <Link 
                href="/profile" 
                className="block text-green-100 hover:text-white hover:bg-green-700 transition-colors duration-200 py-2 px-3 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Profile
              </Link>
              <Link 
                href="/settings" 
                className="block text-green-100 hover:text-white hover:bg-green-700 transition-colors duration-200 py-2 px-3 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Settings
              </Link>
              <button 
                onClick={handleLogout}
                className="block w-full text-left text-red-300 hover:text-red-200 hover:bg-green-700 transition-colors duration-200 py-2 px-3 rounded-lg"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-green-700 space-y-3">
              <Link 
                href="/login" 
                className="block bg-white text-green-800 px-4 py-3 rounded-lg font-medium hover:bg-green-50 transition-colors duration-200 text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link 
                href="/register" 
                className="block bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 border border-white transition-colors duration-200 text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}


