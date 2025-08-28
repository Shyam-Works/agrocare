import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function LoginPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();

      if (res.ok) {
        localStorage.setItem("token", json.token);
        alert("Login successful!");
        router.push("/");
      } else {
        alert(json.error);
      }
    } catch (error) {
      alert("Login failed. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="h-screen bg-white flex items-center justify-center p-5">
      <div className="bg-white rounded-3xl shadow-lg p-10 w-full max-w-sm">
        <h1 className="text-3xl font-semibold text-gray-800 text-center mb-8">
          Login to AgroCare
        </h1>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Email
            </label>
            <input
              name="email"
              type="email"
              placeholder="Email"
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base focus:border-blue-500 focus:outline-none transition-colors"
              required
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Password
            </label>
            <input
              name="password"
              type="password"
              placeholder="Password"
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base focus:border-blue-500 focus:outline-none transition-colors"
              required
            />
          </div>

          <div className="text-right mt-2 mb-5">
            <a href="#" className="text-blue-500 text-sm hover:underline">
              Forgot password?
            </a>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-green-600 text-white py-4 rounded-lg text-base font-semibold hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors mt-3"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="text-center mt-5 text-gray-600 text-sm">
          Do not have an account?{" "}
          <Link href="/register" className="text-blue-500 font-medium hover:underline">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}