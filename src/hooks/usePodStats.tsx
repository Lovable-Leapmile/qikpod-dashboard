import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardApi, PodStats } from '@/services/dashboardApi';

interface PodDashboardStats extends PodStats {
  alert_pods: number;
  reservation_pods: number;
  field_pods: number;
  ignore_pods: number;
}

export const usePodStats = () => {
  const { accessToken } = useAuth();
  const [podStats, setPodStats] = useState<PodDashboardStats>({
    total_pods: 0,
    certified_pods: 0,
    unregistered_pods: 0,
    green_pods: 0,
    red_pods: 0,
    yellow_pods: 0,
    active_pods: 0,
    inactive_pods: 0,
    alert_pods: 0,
    reservation_pods: 0,
    field_pods: 0,
    ignore_pods: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchPodStats = async () => {
    if (!accessToken) return;
    
    setLoading(true);
    try {
      const [
        podStats,
        alertPods,
        reservationPods,
        fieldPods,
        ignorePods
      ] = await Promise.all([
        dashboardApi.getPodStats(accessToken),
        dashboardApi.getAlertPodsCount(accessToken),
        dashboardApi.getReservationPodsCount(accessToken),
        dashboardApi.getFieldPodsCount(accessToken),
        dashboardApi.getIgnorePodsCount(accessToken)
      ]);

      setPodStats({
        ...podStats,
        alert_pods: alertPods,
        reservation_pods: reservationPods,
        field_pods: fieldPods,
        ignore_pods: ignorePods,
      });
    } catch (error) {
      console.error('Error fetching pod stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPodStats();
  }, [accessToken]);

  return {
    podStats,
    loading,
    refetch: fetchPodStats,
  };
};