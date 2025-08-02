import React, { useState, useEffect } from 'react';
import DashboardStats from '@/components/DashboardStats';
import LocationsTable from '@/components/LocationsTable';
import PodsTable from '@/components/PodsTable';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardApi } from '@/services/dashboardApi';
import { useNavigate } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const [dashboardStats, setDashboardStats] = useState({
    locations: 0,
    pods: 0,
    users: 0,
    reservations: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

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

  const handleLocationClick = (locationId: number) => {
    navigate(`/locations/${locationId}`);
  };

  const handlePodClick = (podId: number) => {
    navigate(`/pods/${podId}`);
  };

  if (!accessToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Please log in to view dashboard.</p>
      </div>
    );
  }

  return (
    <Layout title="Dashboard" breadcrumb="">
      <div className="flex flex-col lg:flex-row min-h-screen bg-[#f9fafb]">
        {/* Left Panel - Full height only on desktop */}
        <aside className="w-full lg:w-1/5 flex-shrink-0 px-4 py-6 lg:h-[calc(100vh-64px)]">
          <DashboardStats dashboardStats={dashboardStats} statsLoading={statsLoading} />
        </aside>

        {/* Right Panel - Full page scrollable content */}
        <main className="w-full lg:flex-1 px-4 py-6">
          <div className="space-y-10 w-full">
            {/* Locations Table. */}
            <div className="w-full">
              <LocationsTable onLocationClick={handleLocationClick} />
            </div>

            {/* Pods Table */}
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
