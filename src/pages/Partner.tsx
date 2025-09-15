import React from 'react';
import Partner from '@/components/Partner';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';

const PartnerPage: React.FC = () => {
  const { accessToken } = useAuth();
  
  if (!accessToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to view partner.</p>
        </div>
      </div>
    );
  }

  return (
    <Layout title="Partner Management" breadcrumb="Users & Network / Partner Management">
      <div className="px-[4px]">
        <Partner onBack={() => window.history.back()} />
      </div>
    </Layout>
  );
};

export default PartnerPage;