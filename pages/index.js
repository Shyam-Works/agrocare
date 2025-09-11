// pages/index.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set loading to false once we know the session status
    if (status !== "loading") {
      setLoading(false);
    }
  }, [status]);

  const handleLogout = async () => {
    await signOut({ 
      callbackUrl: "/login",
      redirect: true 
    });
  };

  // Show loading state
  if (loading || status === "loading") {
    return (
      <div>
        <Navbar />
        <div style={{ padding: "20px", textAlign: "center" }}>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!session) {
    return (
      <div>
        <Navbar /> 
        <div style={{ padding: "20px", textAlign: "center" }}>
          <h1>Welcome to AgroCare</h1>
          <p>Please log in to continue</p>
          <Link href="/login">
            <button style={{ 
              padding: "10px 20px", 
              margin: "10px",
              backgroundColor: "#16a34a",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}>
              Login
            </button>
          </Link>
          <Link href="/register">
            <button style={{ 
              padding: "10px 20px", 
              margin: "10px",
              backgroundColor: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}>
              Register
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // Show authenticated user content
  return (
    <div>
      <Navbar />
      <div style={{ 
        padding: "20px",
        maxWidth: "1200px",
        margin: "0 auto"
      }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: "30px",
          backgroundColor: "#f8fafc",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}>
          <h1 style={{ 
            margin: 0, 
            color: "#1f2937",
            fontSize: "2rem"
          }}>
            Hi {session.user.first_name || session.user.name?.split(' ')[0] || 'User'} 
            {session.user.last_name && ` ${session.user.last_name}`}! 👋
          </h1>
          <button 
            onClick={handleLogout} 
            style={{ 
              padding: "12px 24px",
              backgroundColor: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "background-color 0.2s"
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = "#b91c1c"}
            onMouseOut={(e) => e.target.style.backgroundColor = "#dc2626"}
          >
            Logout
          </button>
        </div>
        
        <div style={{ 
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "10px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}>
          <h2 style={{ 
            marginBottom: "20px",
            color: "#374151",
            fontSize: "1.5rem"
          }}>
            Your Profile Information
          </h2>
          
          <div style={{ 
            display: "grid",
            gap: "15px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <strong style={{ minWidth: "100px", color: "#6b7280" }}>Email:</strong> 
              <span style={{ color: "#1f2937" }}>{session.user.email}</span>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <strong style={{ minWidth: "100px", color: "#6b7280" }}>Name:</strong> 
              <span style={{ color: "#1f2937" }}>
                {session.user.first_name && session.user.last_name 
                  ? `${session.user.first_name} ${session.user.last_name}`
                  : session.user.name
                }
              </span>
            </div>
            
            {session.user.location && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <strong style={{ minWidth: "100px", color: "#6b7280" }}>Location:</strong> 
                <span style={{ color: "#1f2937" }}>{session.user.location}</span>
              </div>
            )}
            
            {(session.user.profile_image_url || session.user.image) && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <strong style={{ minWidth: "100px", color: "#6b7280" }}>Profile:</strong> 
                <img 
                  src={session.user.profile_image_url || session.user.image} 
                  alt="Profile" 
                  style={{ 
                    width: "80px", 
                    height: "80px", 
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "3px solid #e5e7eb"
                  }} 
                />
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          marginTop: "30px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px"
        }}>
          <Link href="/profile">
            <div style={{
              padding: "20px",
              backgroundColor: "#16a34a",
              color: "white",
              borderRadius: "10px",
              textAlign: "center",
              cursor: "pointer",
              textDecoration: "none",
              transition: "transform 0.2s",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}
            onMouseOver={(e) => e.target.style.transform = "translateY(-2px)"}
            onMouseOut={(e) => e.target.style.transform = "translateY(0)"}
            >
              <h3 style={{ margin: "0 0 10px 0" }}>View Profile</h3>
              <p style={{ margin: 0, opacity: 0.9 }}>Manage your account settings</p>
            </div>
          </Link>

          <Link href="/scan">
            <div style={{
              padding: "20px",
              backgroundColor: "#2563eb",
              color: "white",
              borderRadius: "10px",
              textAlign: "center",
              cursor: "pointer",
              textDecoration: "none",
              transition: "transform 0.2s",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}
            onMouseOver={(e) => e.target.style.transform = "translateY(-2px)"}
            onMouseOut={(e) => e.target.style.transform = "translateY(0)"}
            >
              <h3 style={{ margin: "0 0 10px 0" }}>Plant Scanner</h3>
              <p style={{ margin: 0, opacity: 0.9 }}>Analyze your plant health</p>
            </div>
          </Link>
        </div>

        {/* Debug Info (remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{
            marginTop: "30px",
            padding: "15px",
            backgroundColor: "#f3f4f6",
            borderRadius: "8px",
            fontSize: "12px"
          }}>
            <strong>Debug Info:</strong>
            <pre style={{ marginTop: "10px", overflow: "auto" }}>
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}