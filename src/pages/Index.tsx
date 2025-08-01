
import { useState, useEffect } from 'react';
import Login from '@/components/Login';
import Dashboard from '@/components/Dashboard';
import { useAuth } from '@/contexts/AuthContext';

const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth();

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

  return isAuthenticated ? <Dashboard /> : <Login />;
};

const Index = () => {
  return <AppContent />;
};

export default Index;
