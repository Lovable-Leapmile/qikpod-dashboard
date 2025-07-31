import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

interface User {
  user_name: string;
  user_type: string;
  user_address: string;
  merchant_type: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  accessToken: string | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  generateOTP: (mobile: string) => Promise<boolean>;
  validateOTP: (mobile: string, otp: string) => Promise<{ success: boolean; data?: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session on app load
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setAccessToken(token);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        // Clear invalid data
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_data');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('user_data', JSON.stringify(userData));
    setAccessToken(token);
    setUser(userData);
    setIsAuthenticated(true);
    toast.success(`Welcome back, ${userData.user_name}!`);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    setAccessToken(null);
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  };

  const generateOTP = async (mobile: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `https://stagingv3.leapmile.com/podcore/otp/generate_otp/?user_phone=${mobile}`,
        {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhY2wiOiJhZG1pbiIsImV4cCI6MTkwMDczNDA0MH0.pHhmwwEsMIO-5nyxOvw4G2ntQ7-H2A6hyFdQSci8OCY',
            'Accept': 'application/json',
          },
        }
      );

      const data = await response.json();
      
      if (response.ok) {
        toast.success('OTP sent successfully!');
        return true;
      } else {
        toast.error(data.message || 'Failed to send OTP');
        return false;
      }
    } catch (error) {
      console.error('Generate OTP error:', error);
      toast.error('No Internet Connection');
      return false;
    }
  };

  const validateOTP = async (mobile: string, otp: string): Promise<{ success: boolean; data?: any }> => {
    try {
      const response = await fetch(
        `https://stagingv3.leapmile.com/podcore/otp/validate_otp/?user_phone=${mobile}&otp_text=${otp}`,
        {
          method: 'GET',
          headers: {
             'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhY2wiOiJhZG1pbiIsImV4cCI6MTkwMDczNDA0MH0.pHhmwwEsMIO-5nyxOvw4G2ntQ7-H2A6hyFdQSci8OCY',
            'Accept': 'application/json',
          },
        }
      );

      const data = await response.json();
      
      if (response.ok) {
        // Use the stable token for all API operations instead of the returned token
        const stableToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhY2wiOiJhZG1pbiIsImV4cCI6MTkwMDczNDA0MH0.pHhmwwEsMIO-5nyxOvw4G2ntQ7-H2A6hyFdQSci8OCY';
        return { success: true, data: { ...data, access_token: stableToken } };
      } else {
        toast.error(data.message || 'Invalid OTP');
        return { success: false };
      }
    } catch (error) {
      console.error('Validate OTP error:', error);
      toast.error('No Internet Connection');
      return { success: false };
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    accessToken,
    login,
    logout,
    generateOTP,
    validateOTP,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
