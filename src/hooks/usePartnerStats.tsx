import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface PartnerStat {
  title: string;
  value: number;
  color: string;
  status: string;
}

export const usePartnerStats = () => {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<PartnerStat[]>([
    { title: 'Pickup Pending', value: 0, color: 'text-orange-600', status: 'PickupPending' },
    { title: 'Pickup Completed', value: 0, color: 'text-green-600', status: 'PickupCompleted' },
    { title: 'RTO Pending', value: 0, color: 'text-orange-600', status: 'RTOPending' },
    { title: 'RTO Completed', value: 0, color: 'text-green-600', status: 'RTOCompleted' },
    { title: 'Drop Pending', value: 0, color: 'text-orange-600', status: 'DropPending' }
  ]);
  const [loading, setLoading] = useState(true);

  const fetchPartnerStats = async () => {
    if (!accessToken) return;
    
    setLoading(true);
    try {
      const promises = stats.map(async (stat) => {
        const response = await fetch(
          `https://stagingv3.leapmile.com/podcore/partner_reservation/reservation_status/?reservation_status=${stat.status}&order_by_field=updated_at&order_by_type=DESC`,
          {
            headers: {
              'accept': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch ${stat.title}`);
        }

        const data = await response.json();
        return {
          ...stat,
          value: data.count || 0
        };
      });

      const updatedStats = await Promise.all(promises);
      setStats(updatedStats);
    } catch (error) {
      console.error('Error fetching partner stats:', error);
      toast({
        title: "Error",
        description: "Failed to fetch partner statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartnerStats();
  }, [accessToken]);

  return {
    stats,
    loading,
    refetch: fetchPartnerStats,
  };
};