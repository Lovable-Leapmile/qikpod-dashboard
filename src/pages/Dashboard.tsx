import React from 'react';
import DashboardStats from '@/components/DashboardStats';
import LocationsTable from '@/components/LocationsTable';
import PodsTable from '@/components/PodsTable';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardApi } from '@/services/dashboardApi';
import { useState, useEffect } from 'react';

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
      <div className="flex gap-4 h-[calc(100vh-120px)]">
        {/* Left Panel - Stats Cards (20% width) */}
        <div className="w-1/5 flex-shrink-0">
          <DashboardStats dashboardStats={dashboardStats} statsLoading={statsLoading} />
        </div>
        
        {/* Right Panel - Tables (80% width) */}
        <div className="w-4/5 flex flex-col gap-4 overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <LocationsTable onLocationClick={(id) => console.log('Location clicked:', id)} />
          </div>
          <div className="flex-1 overflow-hidden">
            <PodsTable onPodClick={(id) => console.log('Pod clicked:', id)} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;