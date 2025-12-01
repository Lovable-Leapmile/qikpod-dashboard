import React, { createContext, useContext, useState, useEffect } from "react";

interface ApiConfigContextType {
  baseUrl: string;
  isConfigured: boolean;
  setApiConfig: (subdomain: string) => void;
}

const ApiConfigContext = createContext<ApiConfigContextType | undefined>(undefined);

export const useApiConfig = () => {
  const context = useContext(ApiConfigContext);
  if (context === undefined) {
    throw new Error("useApiConfig must be used within an ApiConfigProvider");
  }
  return context;
};

const PRODUCTION_BASE_URL = "https://productionv36.qikpod.com/podcore";
const STORAGE_KEY = "api_base_url";

export const ApiConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const environment = import.meta.env.VITE_ENVIRONMENT || "staging";
  const isProduction = environment === "production";

  // Initialize state
  const [baseUrl, setBaseUrl] = useState<string>(() => {
    if (isProduction) {
      return PRODUCTION_BASE_URL;
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored || "";
  });

  const [isConfigured, setIsConfigured] = useState<boolean>(() => {
    if (isProduction) {
      return true;
    }
    return !!localStorage.getItem(STORAGE_KEY);
  });

  const setApiConfig = (subdomain: string) => {
    const fullUrl = `https://${subdomain}.com/podcore`;
    setBaseUrl(fullUrl);
    setIsConfigured(true);
    localStorage.setItem(STORAGE_KEY, fullUrl);
  };

  const value: ApiConfigContextType = {
    baseUrl,
    isConfigured,
    setApiConfig,
  };

  return <ApiConfigContext.Provider value={value}>{children}</ApiConfigContext.Provider>;
};
