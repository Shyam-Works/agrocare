// pages/register.js - Complete fixed version
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router"; // Add this import
import { Check, X } from "lucide-react";
import { Button, Input, FileUpload } from "../components";

export default function RegisterPage() {
  const router = useRouter(); // Add this line
  
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
    location: "",
    profile_image_url: "",
  });
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [error, setError] = useState("");

  // Vanta background setup
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);

  useEffect(() => {
    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const script = document.createElement("script");
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });

    const initVanta = async () => {
      try {
        await loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.min.js"
        );
        await loadScript(
          "https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.topology.min.js"
        );
        if (window.VANTA && vantaRef.current && !vantaEffect.current) {
          vantaEffect.current = window.VANTA.TOPOLOGY({
            el: vantaRef.current,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.0,
            minWidth: 200.0,
            scale: 1.0,
            scaleMobile: 1.0,
          });
        }
      } catch (err) {
        console.error("Error loading Vanta.js:", err);
      }
    };

    initVanta();

    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, []);

  const getPasswordValidation = (password) => ({
    minLength: password.length >= 6,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  });

  const passwordValidation = getPasswordValidation(form.password);
  const isPasswordValid = Object.values(passwordValidation).every(Boolean);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  // In your register form component
const handleImageUpload = async (file, error) => {
  if (error) {
    console.error('File upload error:', error);
    // Handle error - maybe show toast or set error state
    return;
  }

  if (!file) {
    // Clear the image if no file selected
    setForm(prev => ({
      ...prev,
      profile_image_url: ''
    }));
    return;
  }

  try {
    setImageUploading(true);

    // Create FormData to send file
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'profile'); // Specify this is for profile upload

    // Upload to your existing API route
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (response.ok && data.secure_url) {
      // Update form with Cloudinary URL
      setForm(prev => ({
        ...prev,
        profile_image_url: data.secure_url
      }));
      
      // Optional: Show success message
      console.log('Image uploaded successfully:', data.secure_url);
    } else {
      console.error('Upload failed:', data.error);
      // Handle upload failure - you might want to show an error message to user
    }

  } catch (uploadError) {
    console.error('Upload error:', uploadError);
    // Handle network or other errors
  } finally {
    setImageUploading(false);
  }
};

  // FIXED handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (
      !form.first_name ||
      !form.last_name ||
      !form.email ||
      !form.password ||
      !form.confirm_password
    ) {
      setError("Please fill in all required fields");
      return;
    }

    if (!isPasswordValid) {
      setError("Password does not meet all requirements");
      return;
    }

    if (form.password !== form.confirm_password) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      console.log("Submitting registration data...");

      // Make actual API call to your registration endpoint
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          password: form.password,
          confirm_password: form.confirm_password,
          location: form.location,
          profile_image_url: form.profile_image_url,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Success - redirect to login page
        alert("Registration successful! Please sign in with your credentials.");
        router.push("/login");
      } else {
        // Handle API errors
        setError(data.error || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const ValidationIcon = ({ isValid }) =>
    isValid ? (
      <Check className="w-4 h-4 text-green-500" />
    ) : (
      <X className="w-4 h-4 text-red-500" />
    );

  const getPasswordStrengthInfo = () => {
    const validCount = Object.values(passwordValidation).filter(Boolean).length;
    
    if (validCount >= 4) {
      return { strength: 'Strong', color: 'text-green-600', width: 'w-full', bgColor: 'bg-green-500' };
    } else if (validCount >= 2) {
      return { strength: 'Medium', color: 'text-yellow-600', width: 'w-3/5', bgColor: 'bg-yellow-500' };
    } else {
      return { strength: 'Weak', color: 'text-red-600', width: 'w-1/5', bgColor: 'bg-red-500' };
    }
  };

  const passwordStrength = form.password ? getPasswordStrengthInfo() : null;

  return (
    <div
      ref={vantaRef}
      className="min-h-screen flex items-center justify-center p-4 relative"
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes slideInLeft {
            from {
              opacity: 0;
              transform: translateX(-30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes slideInRight {
            from {
              opacity: 0;
              transform: translateX(30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes bounceIn {
            0% {
              opacity: 0;
              transform: scale(0.3);
            }
            50% {
              transform: scale(1.05);
            }
            70% {
              transform: scale(0.9);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }
          
          .animate-fade-in-up {
            animation: fadeInUp 0.8s ease-out forwards;
          }
          
          .animate-slide-in-left {
            animation: slideInLeft 0.6s ease-out forwards;
          }
          
          .animate-slide-in-right {
            animation: slideInRight 0.6s ease-out forwards;
          }
          
          .animate-bounce-in {
            animation: bounceIn 0.6s ease-out forwards;
          }
          
          .animation-delay-200 {
            animation-delay: 0.2s;
            opacity: 0;
          }
          
          .animation-delay-400 {
            animation-delay: 0.4s;
            opacity: 0;
          }
          
          .animation-delay-600 {
            animation-delay: 0.6s;
            opacity: 0;
          }
          
          .animation-delay-800 {
            animation-delay: 0.8s;
            opacity: 0;
          }
          
          .animation-delay-1000 {
            animation-delay: 1s;
            opacity: 0;
          }
          
          .animation-delay-1200 {
            animation-delay: 1.2s;
            opacity: 0;
          }
          
          .animation-delay-1400 {
            animation-delay: 1.4s;
            opacity: 0;
          }
          
          .animation-delay-1600 {
            animation-delay: 1.6s;
            opacity: 0;
          }
          
          .animation-delay-1800 {
            animation-delay: 1.8s;
            opacity: 0;
          }
          
          .animation-delay-2000 {
            animation-delay: 2s;
            opacity: 0;
          }
        `,
        }}
      />
      
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-10 z-0 pointer-events-none"></div>

      <div className="bg-white/1.5 backdrop-blur-[6px] rounded-3xl shadow-xl p-6 w-full max-w-md relative z-10 border border-white/10">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2 animate-fade-in-up" style={{ color: "#C5D96F" }}>
            Join AgroCare
          </h1>
          <p className="text-sm text-white animate-fade-in-up animation-delay-200">
            Create your account to get started
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg mb-4 text-sm animate-fade-in-up animation-delay-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-3 animate-slide-in-left animation-delay-600">
            <Input
              name="first_name"
              label="First Name"
              placeholder="First Name"
              value={form.first_name}
              onChange={handleChange}
              variant="glassmorphism"
              size="md"
              required
              maxLength={50}
            />
            <Input
              name="last_name"
              label="Last Name"
              placeholder="Last Name"
              value={form.last_name}
              onChange={handleChange}
              variant="glassmorphism"
              size="md"
              required
              maxLength={50}
            />
          </div>

          {/* Email */}
          <div className="animate-slide-in-right animation-delay-800">
            <Input
              name="email"
              type="email"
              label="Email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              variant="glassmorphism"
              required
              maxLength={100}
            />
          </div>

          {/* Password */}
          <div className="animate-fade-in-up animation-delay-1000">
            <Input
              name="password"
              type="password"
              label="Password"
              placeholder="Create a password"
              value={form.password}
              onChange={handleChange}
              showPasswordToggle
              variant="glassmorphism"
              required
              maxLength={50}
            />
            
            {form.password && passwordStrength && (
              <div className="mt-2">
                <div className="mb-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-300">Password Strength</span>
                    <span className={`text-xs font-medium ${passwordStrength.color}`}>
                      {passwordStrength.strength}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-300 ${passwordStrength.bgColor} ${passwordStrength.width}`}
                    ></div>
                  </div>
                </div>
                
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="animate-slide-in-left animation-delay-1200">
            <Input
              name="confirm_password"
              type="password"
              label="Confirm Password"
              placeholder="Confirm your password"
              value={form.confirm_password}
              onChange={handleChange}
              showPasswordToggle
              variant="glassmorphism"
              required
              maxLength={50}
              error={form.confirm_password && form.password !== form.confirm_password ? 'Passwords do not match' : ''}
            />
          </div>

          {/* Profile Photo */}
          <div className="animate-slide-in-right animation-delay-1400">
            <FileUpload
              label="Profile Photo"
              variant="profile"
              onChange={handleImageUpload}
              loading={imageUploading}
              previewUrl={form.profile_image_url}
              placeholder="Upload Photo"
              loadingText="Uploading..."
              maxSizeText="5MB"
            />
          </div>

          {/* Location */}
          <div className="animate-fade-in-up animation-delay-1600">
            <Input
              name="location"
              label="Location"
              placeholder="Enter your location"
              onChange={handleChange}
              variant="glassmorphism"
              required
              maxLength={100}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            disabled={loading || imageUploading || !isPasswordValid}
            loading={loading}
            loadingText="Creating Account..."
            className="mt-6 animate-bounce-in animation-delay-1800"
          >
            Create Account
          </Button>
        </form>

        <div className="text-center mt-4 text-xs text-white animate-fade-in-up animation-delay-2000">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-[#C5D96F] font-medium hover:text-green-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}