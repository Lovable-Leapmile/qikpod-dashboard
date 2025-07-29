import React from 'react';
import DashboardStats from '@/components/DashboardStats';
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
    <Layout title="Dashboard" breadcrumb="Dashboard">
      <DashboardStats dashboardStats={dashboardStats} statsLoading={statsLoading} />
    </Layout>
  );
};

export default DashboardPage;