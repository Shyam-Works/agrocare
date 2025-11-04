// pages/login.js - Refactored with components
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { signIn, getSession } from "next-auth/react";
import { Mail, Lock } from "lucide-react";
import { Button, Input } from "../components";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  // Vanta background setup
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);

  useEffect(() => {
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

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
      } catch (error) {
        console.error("Error loading Vanta.js:", error);
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

  // Check for errors from URL params (from NextAuth redirects)
  useEffect(() => {
    if (router.query.error) {
      switch (router.query.error) {
        case "OAuthAccountNotLinked":
          setError(
            "An account with this email already exists. Please sign in with your original method."
          );
          break;
        case "CredentialsSignin":
          setError("Invalid email or password.");
          break;
        default:
          setError("An error occurred during sign in.");
      }
    }
  }, [router.query.error]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await signIn("google", {
        callbackUrl: "/profile",
        redirect: false,
      });

      if (result?.error) {
        console.error("Google sign-in error:", result.error);
        switch (result.error) {
          case "OAuthAccountNotLinked":
            setError(
              "An account with this email already exists. Please sign in with email/password first."
            );
            break;
          default:
            setError("Google sign-in failed. Please try again.");
        }
      } else if (result?.ok) {
        const session = await getSession();
        if (session) {
          router.push("/profile");
        }
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      setError("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Please fill in all fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: form.email.toLowerCase().trim(),
        password: form.password,
        redirect: false,
      });

      if (result?.ok) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        const session = await getSession();
        
        if (session) {
          router.push("/profile");
        } else {
          setError("Session creation failed. Please try again.");
        }
      } else {
        if (result?.error === "CredentialsSignin") {
          setError(
            "Invalid email or password. Please check your credentials and try again."
          );
        } else {
          setError("Login failed. Please try again.");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return;

    setForgotLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();

      if (res.ok) {
        router.push(`/otp-verify?email=${encodeURIComponent(forgotEmail)}`);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError("Something went wrong");
    }
    setForgotLoading(false);
  };

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
        `,
        }}
      />
      
      <div className="absolute inset-0 bg-black bg-opacity-10 z-0"></div>

      <div className="bg-white/1.5 backdrop-blur-[6px] rounded-3xl shadow-xl p-8 w-full max-w-md relative z-10 border border-white/10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 animate-fade-in-up">
            Welcome back
          </h1>
          <p className="text-gray-200 animate-fade-in-up animation-delay-200">
            Login to your AgroCare account
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-400/30 text-red-100 px-4 py-3 rounded-lg mb-6 backdrop-blur-sm">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6 animate-fade-in-up animation-delay-400"
        >
          {/* Email Input */}
          <Input
            name="email"
            type="email"
            label="Email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
            icon={Mail}
            variant="glassmorphism"
            required
            disabled={loading}
            maxLength={35}
            className="animate-slide-in-left animation-delay-600"
          />

          {/* Password Input */}
          <Input
            name="password"
            type="password"
            label="Password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            icon={Lock}
            showPasswordToggle
            variant="glassmorphism"
            required
            disabled={loading}
            maxLength={50}
            className="animate-slide-in-right animation-delay-800"
          />

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            disabled={loading}
            loading={loading}
            loadingText="Signing In..."
            className="animate-bounce-in animation-delay-1000"
          >
            Sign In
          </Button>
        </form>

        {/* Google Sign In */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/30"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white/20 text-gray-200 backdrop-blur-sm rounded">
              Or continue with
            </span>
          </div>
        </div>

        <Button
          onClick={handleGoogleSignIn}
          variant="google"
          size="md"
          fullWidth
          disabled={loading}
          loading={loading}
          loadingText="Connecting..."
          className="flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </Button>

        {/* Links */}
        <div className="text-center mt-3 text-sm text-gray-200">
          Do not have an account?{" "}
          <Link
            href="/register"
            className="text-green-300 font-medium hover:text-green-400"
          >
            Sign Up
          </Link>
        </div>
        
        <div className="text-center mt-3 text-sm text-gray-200">
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="text-sm text-green-300 hover:text-green-400"
          >
            Forgot Password?
          </button>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in-up">
          <div className="bg-white/20 backdrop-blur-[90px] rounded-3xl p-8 w-full max-w-md border border-white/10 shadow-xl">
            <h3 className="text-2xl font-bold text-white mb-4 animate-fade-in-up">
              Reset Password
            </h3>
            <p className="text-gray-200 mb-6 animate-fade-in-up animation-delay-200">
              Enter your email to receive a password reset OTP
            </p>
            <form
              onSubmit={handleForgotPassword}
              className="space-y-6 animate-fade-in-up animation-delay-400"
            >
              <Input
                type="email"
                placeholder="Enter your email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                icon={Mail}
                variant="glassmorphism"
                required
              />
              
              <div className="flex space-x-3">
                <Button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  variant="outline"
                  size="md"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={forgotLoading}
                  loading={forgotLoading}
                  loadingText="Sending..."
                  className="flex-1 bg-[#C5D96F60] border border-[#99d98c] hover:bg-[#A1B84C66]"
                >
                  Send OTP
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}