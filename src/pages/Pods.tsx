import React from 'react';
import PodsTable from '@/components/PodsTable';
import { useAuth } from '@/contexts/AuthContext';

const PodsPage: React.FC = () => {
  const { accessToken } = useAuth();
  
  if (!accessToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to view pods.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pods Management</h1>
          <p className="text-gray-600 mt-1">Manage and monitor all pods in the system</p>
        </div>
        <PodsTable onPodClick={(id) => console.log('Pod clicked:', id)} />
      </div>
    </div>
  );
};

export default PodsPage;