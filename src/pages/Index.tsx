import { useState, useEffect } from "react";
import Login from "@/components/Login";
import { useAuth } from "@/contexts/AuthContext";
import { useApiConfig } from "@/contexts/ApiConfigContext";
import { ApiConfigPopup } from "@/components/ApiConfigPopup";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { isConfigured, setApiConfig } = useApiConfig();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard after successful authentication
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleApiConfigSubmit = (subdomain: string) => {
    setApiConfig(subdomain);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  // Show API config popup if not configured (staging only)
  if (!isConfigured) {
    return <ApiConfigPopup open={true} onConfigSubmit={handleApiConfigSubmit} />;
  }

  // Show login page if not authenticated
  return <Login />;
};

export default Index;
