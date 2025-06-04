import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, Smartphone } from 'lucide-react';
const Login = () => {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpField, setShowOtpField] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {
    generateOTP,
    validateOTP,
    login
  } = useAuth();
  const handleRequestOTP = async () => {
    if (!mobile || mobile.length < 10) {
      return;
    }
    setIsLoading(true);
    const success = await generateOTP(mobile);
    if (success) {
      setShowOtpField(true);
    }
    setIsLoading(false);
  };
  const handleLogin = async () => {
    if (!otp || otp.length < 4) {
      return;
    }
    setIsLoading(true);
    const result = await validateOTP(mobile, otp);
    if (result.success && result.data) {
      const userData = result.data.records[0];
      login(result.data.access_token, userData);
    }
    setIsLoading(false);
  };
  return <div className="min-h-screen flex">
      {/* Left Side - Welcome Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 flex-col justify-center items-center text-white p-12">
        <div className="text-center max-w-md">
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto bg-yellow-300 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <Lock className="w-16 h-16 text-yellow-700" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Welcome to QikPod</h1>
          <p className="text-xl text-yellow-100">Your Smart Locker Management System</p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      
    </div>;
};
export default Login;