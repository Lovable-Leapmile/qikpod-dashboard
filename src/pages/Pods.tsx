import React, { useState } from 'react';
import PodsTable from '@/components/PodsTable';
import PodDetail from '@/components/PodDetail';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';

const PodsPage: React.FC = () => {
  const { accessToken } = useAuth();
  const [currentView, setCurrentView] = useState<'pods' | 'podDetail'>('pods');
  const [selectedPodId, setSelectedPodId] = useState<number | null>(null);

  const handlePodClick = (podId: number) => {
    setSelectedPodId(podId);
    setCurrentView('podDetail');
  };

  const handleBackToPods = () => {
    setCurrentView('pods');
    setSelectedPodId(null);
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

  if (currentView === 'podDetail' && selectedPodId) {
    return (
      <Layout title="Pod Details" breadcrumb="Operations / Pods Management / Pod Details">
        <PodDetail podId={selectedPodId} onBack={handleBackToPods} />
      </Layout>
    );
  }

  return (
    <Layout title="Pods Management" breadcrumb="Operations / Pods Management">
      <div className="px-[4px]">
        <PodsTable onPodClick={handlePodClick} />
      </div>
    </Layout>
  );
};

export default PodsPage;