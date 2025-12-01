// Hook to get the dynamic API base URL
export const useApiUrl = () => {
  const getBaseUrl = () => {
    const stored = localStorage.getItem("api_base_url");
    const environment = import.meta.env.VITE_ENVIRONMENT || "staging";
    
    if (environment === "production") {
      return "https://productionv36.qikpod.com";
    }
    
    // Remove /podcore suffix if present and return just the base
    return stored ? stored.replace("/podcore", "") : "https://productionv36.qikpod.com";
  };

  const baseUrl = getBaseUrl();

  return {
    podcore: `${baseUrl}/podcore`,
    payments: `${baseUrl}/payments`,
    notifications: `${baseUrl}/notifications`,
    logstore: `${baseUrl}/logstore`,
  };
};
