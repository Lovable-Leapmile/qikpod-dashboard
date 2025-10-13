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
      const response = await fetch(
        "https://productionv36.qikpod.com/podcore/pod_monitor/?pod_type=reservation_details",
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
      const record = data.records?.[0];

      if (record) {
        const updatedStats = [
          {
            title: "Pickup Pending",
            value: record.pickuppending || 0,
            color: "text-orange-600",
            status: "PickupPending",
          },
          {
            title: "Pickup Completed",
            value: record.pickupcompleted || 0,
            color: "text-green-600",
            status: "PickupCompleted",
          },
          { title: "RTO Pending", value: record.rtopending || 0, color: "text-orange-600", status: "RTOPending" },
          { title: "RTO Completed", value: record.rtocompleted || 0, color: "text-green-600", status: "RTOCompleted" },
          { title: "Drop Pending", value: record.droppending || 0, color: "text-orange-600", status: "DropPending" },
        ];
        setStats(updatedStats);
      }
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
