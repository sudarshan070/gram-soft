"use client";

import React, { useEffect } from "react";
import { Button } from "antd";
import { useRouter } from "next/navigation";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class AuthErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Auth Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <AuthErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

function AuthErrorFallback({ error }: { error?: Error }) {
  const router = useRouter();

  useEffect(() => {
    // Check if it's an auth-related error and redirect
    if (error?.message?.includes("403") || error?.message?.includes("401")) {
      router.push("/unauthorized");
    }
  }, [error, router]);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #ee5a24 0%, #ff6b6b 100%)",
      padding: "20px",
    }}>
      <div style={{
        background: "white",
        borderRadius: "12px",
        padding: "40px",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
        maxWidth: "500px",
        width: "100%",
        textAlign: "center",
      }}>
        <h2 style={{ color: "#d32f2f", marginBottom: "16px" }}>Authentication Error</h2>
        <p style={{ color: "#666", marginBottom: "24px" }}>
          There was an issue with your authentication. Redirecting you to the login page...
        </p>
        <Button
          type="primary"
          onClick={() => router.push("/login")}
          danger
        >
          Go to Login
        </Button>
      </div>
    </div>
  );
}

// Hook to handle auth errors
export function useAuthErrorHandler() {
  const router = useRouter();

  const handleAuthError = (error: any) => {
    if (error?.status === 401 || error?.status === 403) {
      router.push("/unauthorized");
    }
  };

  return { handleAuthError };
}
