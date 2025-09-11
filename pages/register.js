// import { useState } from "react";
// import Link from "next/link";
// import { useRouter } from "next/router";

// export default function RegisterPage() {
//   const router = useRouter();
//   const [form, setForm] = useState({
//     first_name: "",
//     last_name: "",
//     email: "",
//     password: "",
//     confirm_password: "",
//     location: "",
//     profile_image_url: "",
//   });
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   async function handleImageUpload(e) {
//     const file = e.target.files[0];
//     if (!file) return;

//     const formData = new FormData();
//     formData.append("file", file);

//     try {
//       const res = await fetch("/api/upload", {
//         method: "POST",
//         body: formData,
//       });

//       const data = await res.json();

//       if (data.secure_url) {
//         console.log("Uploaded image:", data.secure_url);
//         setForm({ ...form, profile_image_url: data.secure_url });
//       } else {
//         alert("Image upload failed");
//       }
//     } catch (error) {
//       console.error("Upload error:", error);
//       alert("Image upload failed");
//     }
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (form.password !== form.confirm_password) {
//       alert("Passwords do not match!");
//       return;
//     }
    
//     setLoading(true);

//     try {
//       const res = await fetch("/api/auth/register", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(form),
//       });

//       const json = await res.json();
      
//       if (res.ok) {
//         // Registration successful
//         alert(json.message || "Registration successful!");
//         router.push("/login");
//       } else {
//         // Registration failed
//         alert(json.error || "Registration failed!");
//       }
//     } catch (error) {
//       console.error("Registration error:", error);
//       alert("Registration failed!");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="h-screen bg-white flex items-center justify-center p-4 overflow-hidden">
//       <div className="bg-white rounded-3xl shadow-lg p-6 w-full max-w-md">
//         <h1 className="text-2xl font-semibold text-gray-800 text-center mb-6">
//           Register for AgroCare
//         </h1>
        
//         <form onSubmit={handleSubmit} className="space-y-3">
//           {/* Name Fields */}
//           <div className="grid grid-cols-2 gap-3">
//             <div>
//               <label className="block text-sm font-medium text-gray-600 mb-1">
//                 First Name
//               </label>
//               <input
//                 name="first_name"
//                 placeholder="First Name"
//                 onChange={handleChange}
//                 className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
//                 required
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-600 mb-1">
//                 Last Name
//               </label>
//               <input
//                 name="last_name"
//                 placeholder="Last Name"
//                 onChange={handleChange}
//                 className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
//                 required
//               />
//             </div>
//           </div>

//           {/* Email */}
//           <div>
//             <label className="block text-sm font-medium text-gray-600 mb-1">
//               Email
//             </label>
//             <input
//               name="email"
//               type="email"
//               placeholder="Email"
//               onChange={handleChange}
//               className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
//               required
//             />
//           </div>

//           {/* Password */}
//           <div>
//             <label className="block text-sm font-medium text-gray-600 mb-1">
//               Password
//             </label>
//             <input
//               name="password"
//               type="password"
//               placeholder="Password"
//               onChange={handleChange}
//               className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
//               required
//             />
//           </div>

//           {/* Confirm Password */}
//           <div>
//             <label className="block text-sm font-medium text-gray-600 mb-1">
//               Confirm Password
//             </label>
//             <input
//               name="confirm_password"
//               type="password"
//               placeholder="Password"
//               onChange={handleChange}
//               className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
//               required
//             />
//           </div>

//           {/* Profile Image Section */}
//           <div className="text-center py-2">
//             <div className="mb-2">
//               {form.profile_image_url ? (
//                 <img 
//                   src={form.profile_image_url} 
//                   alt="Profile" 
//                   className="w-12 h-12 rounded-full border-2 border-gray-200 object-cover mx-auto"
//                 />
//               ) : (
//                 <div className="w-12 h-12 rounded-full border-2 border-gray-200 bg-gray-50 flex items-center justify-center text-xl mx-auto">
//                   👤
//                 </div>
//               )}
//             </div>
//             <input
//               type="file"
//               accept="image/*"
//               onChange={handleImageUpload}
//               className="hidden"
//               id="profile-upload"
//             />
//             <label 
//               htmlFor="profile-upload" 
//               className="bg-green-600 text-white px-4 py-1 rounded-full text-xs font-medium cursor-pointer hover:bg-green-700 transition-colors"
//             >
//               Profile Photo
//             </label>
//           </div>

//           {/* Location */}
//           <div>
//             <label className="block text-sm font-medium text-gray-600 mb-1">
//               Location
//             </label>
//             <input
//               name="location"
//               placeholder="Location"
//               onChange={handleChange}
//               className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
//               required
//             />
//           </div>

//           {/* Submit Button */}
//           <button 
//             type="submit" 
//             disabled={loading} 
//             className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors mt-4"
//           >
//             {loading ? "Registering..." : "Register"}
//           </button>
//         </form>

//         {/* Login Link */}
//         <div className="text-center mt-4 text-sm text-gray-600">
//           Already have an account?{" "}
//           <Link href="/login" className="text-blue-600 font-medium hover:underline">
//             Login
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }
// pages/api/auth/register.js
// pages/register.js
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Upload, User } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); // Clear error when user starts typing
  };

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setImageUploading(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.secure_url) {
        console.log("Uploaded image:", data.secure_url);
        setForm({ ...form, profile_image_url: data.secure_url });
      } else {
        setError("Image upload failed. Please try again.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError("Image upload failed. Please try again.");
    } finally {
      setImageUploading(false);
    }
  }

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);
      const result = await signIn('google', { 
        callbackUrl: '/profile',
        redirect: false 
      });
      
      if (result?.error) {
        setError('Google sign-up failed. Please try again.');
      } else if (result?.ok) {
        router.push('/profile');
      }
    } catch (error) {
      setError('Google sign-up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Client-side validation
    if (!form.first_name || !form.last_name || !form.email || !form.password || !form.confirm_password) {
      setError("Please fill in all required fields");
      return;
    }

    if (form.password !== form.confirm_password) {
      setError("Passwords do not match!");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    
    setLoading(true);

    try {
      // Register the user
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      
      if (res.ok) {
        // Registration successful, now sign them in automatically
        const signInResult = await signIn('credentials', {
          email: form.email,
          password: form.password,
          redirect: false,
        });

        if (signInResult?.ok) {
          router.push('/profile');
        } else {
          // Registration successful but auto sign-in failed
          setError("Registration successful! Please sign in manually.");
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        }
      } else {
        setError(data.error || "Registration failed!");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError("Registration failed! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-800 mb-2">
            Join AgroCare
          </h1>
          <p className="text-gray-600">Create your account to get started</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                name="first_name"
                placeholder="First Name"
                value={form.first_name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                name="last_name"
                placeholder="Last Name"
                value={form.last_name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              name="email"
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password *
            </label>
            <div className="relative">
              <input
                name="confirm_password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={form.confirm_password}
                onChange={handleChange}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Profile Image Section */}
          <div className="text-center py-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Profile Photo (Optional)
            </label>
            <div className="flex flex-col items-center space-y-3">
              {form.profile_image_url ? (
                <img 
                  src={form.profile_image_url} 
                  alt="Profile" 
                  className="w-20 h-20 rounded-full border-4 border-green-100 object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full border-4 border-gray-200 bg-gray-50 flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
              )}
              
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="profile-upload"
                disabled={imageUploading}
              />
              <label 
                htmlFor="profile-upload" 
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
                  imageUploading 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>{imageUploading ? 'Uploading...' : 'Upload Photo'}</span>
              </label>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              name="location"
              placeholder="Enter your location"
              value={form.location}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading || imageUploading} 
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Google Sign Up */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <button
          onClick={handleGoogleSignUp}
          disabled={loading}
          className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign up with Google
        </button>

        {/* Login Link */}
        <div className="text-center mt-6 text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-green-600 font-medium hover:text-green-700">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}