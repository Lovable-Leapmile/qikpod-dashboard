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
        <div className="text-center">
          <p className="text-gray-600">Please log in to view dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <Layout title="" breadcrumb="">
      <div className="flex h-[calc(100vh-80px)] overflow-hidden">
        {/* Left Panel - Stretchy cards column */}
        <div className="w-1/5 flex-shrink-0 h-full flex flex-col justify-between">
          <DashboardStats dashboardStats={dashboardStats} statsLoading={statsLoading} />
        </div>

        {/* Right Panel - Scrollable, well-spaced tables */}
        <div className="w-4/5 h-full overflow-y-auto flex flex-col gap-4 pl-4 pr-2 py-2">
          <div className="min-h-[350px] bg-white rounded-2xl shadow p-4 overflow-auto">
            <LocationsTable onLocationClick={(id) => console.log('Location clicked:', id)} />
          </div>
          <div className="min-h-[350px] bg-white rounded-2xl shadow p-4 overflow-auto">
            <PodsTable onPodClick={(id) => console.log('Pod clicked:', id)} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
