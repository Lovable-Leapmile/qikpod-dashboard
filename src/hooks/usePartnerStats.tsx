import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

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
    { title: "Pickup Pending", value: 0, color: "text-orange-600", status: "PickupPending" },
    { title: "Pickup Completed", value: 0, color: "text-green-600", status: "PickupCompleted" },
    { title: "RTO Pending", value: 0, color: "text-orange-600", status: "RTOPending" },
    { title: "RTO Completed", value: 0, color: "text-green-600", status: "RTOCompleted" },
    { title: "Drop Pending", value: 0, color: "text-orange-600", status: "DropPending" },
  ]);
  const [loading, setLoading] = useState(true);

  const fetchPartnerStats = async () => {
    if (!accessToken) return;

    setLoading(true);
    try {
      const baseUrl = localStorage.getItem("api_base_url")?.replace("/podcore", "") || "https://productionv36.qikpod.com";
      const response = await fetch(
        `${baseUrl}/podcore/partner_reservation/reservation_status/?order_by_field=updated_at&order_by_type=DESC`,
        {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch partner statistics");
      }

      const data = await response.json();
      const records = data.records || data || [];

      // Count reservations by status
      const statusCounts = {
        PickupPending: 0,
        PickupCompleted: 0,
        RTOPending: 0,
        RTOCompleted: 0,
        DropPending: 0,
      };

      records.forEach((record: any) => {
        const status = record.reservation_status;
        if (status && statusCounts.hasOwnProperty(status)) {
          statusCounts[status as keyof typeof statusCounts]++;
        }
      });

      const updatedStats = [
        { title: "Pickup Pending", value: statusCounts.PickupPending, color: "text-orange-600", status: "PickupPending" },
        { title: "Pickup Completed", value: statusCounts.PickupCompleted, color: "text-green-600", status: "PickupCompleted" },
        { title: "RTO Pending", value: statusCounts.RTOPending, color: "text-orange-600", status: "RTOPending" },
        { title: "RTO Completed", value: statusCounts.RTOCompleted, color: "text-green-600", status: "RTOCompleted" },
        { title: "Drop Pending", value: statusCounts.DropPending, color: "text-orange-600", status: "DropPending" },
      ];
      setStats(updatedStats);
    } catch (error) {
      console.error("Error fetching partner stats:", error);
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
