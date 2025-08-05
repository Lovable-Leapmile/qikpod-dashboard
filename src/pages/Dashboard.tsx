import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardStats from '@/components/DashboardStats';
import LocationsTable from '@/components/LocationsTable';
import PodsTable from '@/components/PodsTable';
import LocationDetail from '@/components/LocationDetail';
import PodDetail from '@/components/PodDetail';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardApi } from '@/services/dashboardApi';

const DashboardPage: React.FC = () => {
  const { accessToken } = useAuth();
  const navigate = useNavigate(); // ✅ for Vite or React Router apps

  // All useState hooks must be declared before any conditional logic
  const [dashboardStats, setDashboardStats] = useState({
    locations: 0,
    pods: 0,
    users: 0,
    reservations: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'dashboard' | 'locationDetail' | 'podDetail'>('dashboard');
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [selectedPodId, setSelectedPodId] = useState<number | null>(null);

  const fetchDashboardStats = async () => {
    if (!accessToken) return;
    setStatsLoading(true);
    try {
      const [locations, pods, users, reservations] = await Promise.all([
        dashboardApi.getLocationsCount(accessToken),
        dashboardApi.getPodsCount(accessToken),
        dashboardApi.getUsersCount(accessToken),
        dashboardApi.getReservationsCount(accessToken),
      ]);
      setDashboardStats({ locations, pods, users, reservations });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, [accessToken]);

  if (!accessToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Please log in to view dashboard.</p>
      </div>
    );
  }

  const handleLocationClick = (locationId: number) => {
    setSelectedLocationId(locationId);
    setCurrentView('locationDetail');
  };

  const handlePodClick = (podId: number) => {
    setSelectedPodId(podId);
    setCurrentView('podDetail');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedLocationId(null);
    setSelectedPodId(null);
  };

  if (currentView === 'locationDetail' && selectedLocationId) {
    return (
      <Layout title="Location Details" breadcrumb="Dashboard / Location Details">
        <LocationDetail locationId={selectedLocationId} onBack={handleBackToDashboard} />
      </Layout>
    );
  }

  if (currentView === 'podDetail' && selectedPodId) {
    return (
      <Layout title="Pod Details" breadcrumb="Dashboard / Pod Details">
        <PodDetail podId={selectedPodId} onBack={handleBackToDashboard} />
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard" breadcrumb="">
      <div className="flex flex-col lg:flex-row min-h-screen bg-[#f9fafb]">
        <aside className="w-full lg:w-1/5 flex-shrink-0 px-4 py-6 lg:h-[calc(100vh-64px)]">
          <DashboardStats dashboardStats={dashboardStats} statsLoading={statsLoading} />
        </aside>

        <main className="w-full lg:flex-1 px-4 py-6">
          <div className="space-y-10 w-full">
            <div className="w-full">
              <LocationsTable onLocationClick={handleLocationClick} />
            </div>

            <div className="w-full">
              <PodsTable onPodClick={handlePodClick} />
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default DashboardPage;
