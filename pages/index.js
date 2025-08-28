import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Verify token and get user info
      fetch("/api/auth/verify", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setUser(data.user);
          } else {
            localStorage.removeItem("token");
          }
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem("token");
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/login");
  };

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading...</div>;
  }

  if (!user) {
    return (
      <div>
        <Navbar /> 
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h1>Welcome to AgroCare</h1>
        <p>Please log in to continue</p>
        <Link href="/login">
          <button style={{ padding: "10px 20px", margin: "10px" }}>Login</button>
        </Link>
        <Link href="/register">
          <button style={{ padding: "10px 20px", margin: "10px" }}>Register</button>
        </Link>
      </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1>HI {user.first_name} {user.last_name}!</h1>
        <button onClick={handleLogout} style={{ padding: "10px 20px" }}>
          Logout
        </button>
      </div>
      
      <div style={{ marginTop: "20px" }}>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Location:</strong> {user.location}</p>
        {user.profile_image_url && (
          <div>
            <p><strong>Profile Picture:</strong></p>
            <img src={user.profile_image_url} alt="Profile" width="100" height="100" style={{ borderRadius: "50%" }} />
          </div>
        )}
      </div>
    </div>
  );
}