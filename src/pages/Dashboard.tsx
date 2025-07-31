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
    reservations: 0
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
        dashboardApi.getReservationsCount(accessToken)
      ]);
      setDashboardStats({
        locations,
        pods,
        users,
        reservations
      });
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
      <div className="flex min-h-screen gap-4 px-4 py-4 bg-[#f9fafb]">
        {/* Left Panel - Stats Cards */}
        <div className="w-1/5 flex flex-col justify-between gap-4">
          <DashboardStats dashboardStats={dashboardStats} statsLoading={statsLoading} />
        </div>

        {/* Right Panel - Combined Card for Tables */}
        <div className="w-4/5 flex flex-col">
          <div className="bg-white shadow-md rounded-xl p-6 w-full">
            <h2 className="text-xl font-semibold mb-6">Locations</h2>
            <div className="mb-10">
              <LocationsTable onLocationClick={(id) => console.log('Location clicked:', id)} />
            </div>
            <h2 className="text-xl font-semibold mb-6">Pods</h2>
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
