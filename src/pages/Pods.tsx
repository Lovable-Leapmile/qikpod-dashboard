import React from 'react';
import PodsTable from '@/components/PodsTable';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const PodsPage: React.FC = () => {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const handlePodClick = (podId: number) => {
    navigate(`/pods/${podId}`);
  };
  
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
    <Layout title="Pods Management" breadcrumb="Operations / Pods Management">
      <PodsTable onPodClick={handlePodClick} />
    </Layout>
  );
};

export default PodsPage;