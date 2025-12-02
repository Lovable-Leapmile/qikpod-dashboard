import React from 'react';
import UsersNetworkSection from '@/components/UsersNetworkSection';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';

const UsersPage: React.FC = () => {
  const { accessToken } = useAuth();
  
  if (!accessToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to view users.</p>
        </div>
      </div>
    );
  }

  return (
    <Layout title="Users Management" breadcrumb="Users & Network / Users Management">
      <UsersNetworkSection onBack={() => {}} />
    </Layout>
  );
};

export default UsersPage;