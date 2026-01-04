"use client";

import { Button } from "antd";

export default function UnauthorizedPage() {
  const handleLogin = () => {
    alert("Login button clicked!");
    console.log("Login button clicked");
    window.location.href = "/login";
  };

  const handleGoHome = () => {
    alert("Go home button clicked!");
    console.log("Go home button clicked");
    window.location.href = "/";
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#ffffff",
      padding: "20px",
    }}>
      <div style={{
        background: "white",
        borderRadius: "20px",
        padding: "48px",
        boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15)",
        maxWidth: "600px",
        width: "100%",
        textAlign: "center",
        border: "1px solid rgba(0, 0, 0, 0.1)",
      }}>
        <h1 style={{
          fontSize: "32px",
          fontWeight: "700",
          color: "#2c3e50",
          marginBottom: "24px",
        }}>
          Access Restricted
        </h1>
        
        <p style={{
          fontSize: "16px",
          color: "#5a6c7d",
          lineHeight: "1.6",
          marginBottom: "32px",
        }}>
          The requested page requires specific permissions to access.
        </p>

        <div style={{ 
          display: "flex", 
          gap: "16px", 
          justifyContent: "center", 
          marginBottom: "32px",
        }}>
          <Button
            type="primary"
            size="large"
            onClick={handleLogin}
            style={{
              background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
              border: "none",
              borderRadius: "12px",
              height: "48px",
              padding: "0 32px",
              fontWeight: "600",
              fontSize: "16px",
            }}
          >
            Login Again
          </Button>
          
          <Button
            size="large"
            onClick={handleGoHome}
            style={{
              borderRadius: "12px",
              height: "48px",
              padding: "0 32px",
              fontWeight: "600",
              fontSize: "16px",
            }}
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
