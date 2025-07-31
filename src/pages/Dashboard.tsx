import React, { useState, useEffect } from 'react';
import DashboardStats from '@/components/DashboardStats';
import LocationsTable from '@/components/LocationsTable';
import PodsTable from '@/components/PodsTable';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardApi } from '@/services/dashboardApi';

const DashboardPage: React.FC = () => {
  const { accessToken } = useAuth();
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

  if (!accessToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Please log in to view dashboard.</p>
      </div>
    );
  }

  return (
    <Layout title="Dashboard" breadcrumb="">
      <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] bg-[#f9fafb]">
        {/* Left Panel - Responsive width & full height */}
        <aside className="w-full lg:w-1/5 flex-shrink-0 pl-2 pr-3 py-4">
          <DashboardStats dashboardStats={dashboardStats} statsLoading={statsLoading} />
        </aside>

        {/* Right Panel - Responsive + Scrollable */}
        <main className="flex-1 overflow-y-auto pl-2 pr-4 py-6">
          <div className="space-y-10 w-full">
            <div className="max-h-[520px] overflow-y-auto">
              <LocationsTable onLocationClick={(id) => console.log('Location clicked:', id)} />
            </div>
            <div className="max-h-[520px] overflow-y-auto">
              <PodsTable onPodClick={(id) => console.log('Pod clicked:', id)} />
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default DashboardPage;
