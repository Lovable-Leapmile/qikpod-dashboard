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
    <Layout title="" breadcrumb="">
      <div className="flex min-h-screen overflow-hidden">
        {/* Left Panel - Stats */}
        <div className="w-1/5 flex-shrink-0 h-full flex flex-col justify-between">
          <DashboardStats dashboardStats={dashboardStats} statsLoading={statsLoading} />
        </div>

        {/* Right Panel - Combined Card */}
        <div className="w-4/5 pl-4 pr-2 py-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-md p-4">
            <h2 className="text-lg font-semibold mb-4">Locations & Pods Overview</h2>
            <div className="mb-6">
              <LocationsTable onLocationClick={(id) => console.log('Location clicked:', id)} />
            </div>
            <div>
              <PodsTable onPodClick={(id) => console.log('Pod clicked:', id)} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
