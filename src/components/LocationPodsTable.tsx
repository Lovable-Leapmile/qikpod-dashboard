import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useApiUrl } from "@/hooks/useApiUrl";
import { Eye, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import NoDataIllustration from "@/components/ui/no-data-illustration";

interface Pod {
  id: number;
  pod_name: string;
  pod_power_status: string;
  status: string;
  pod_health: string;
  pod_numtotaldoors: number;
  location_name: string;
}

interface LocationPodsTableProps {
  locationId: number;
  onPodClick?: (podId: number) => void;
}

const LocationPodsTable: React.FC<LocationPodsTableProps> = ({
  locationId,
  onPodClick,
}) => {
  const { accessToken } = useAuth();
  const apiUrl = useApiUrl();
  const [pods, setPods] = useState<Pod[]>([]);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const fetchPods = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const response = await fetch(
        `${apiUrl.podcore}/pods/?location_id=${locationId}&order_by_field=updated_at&order_by_type=DESC`,
        {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = await response.json();
      setPods(data.records || []);
    } catch (error) {
      console.error("Error fetching location pods:", error);
      setPods([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, locationId]);

  const getStatusBadge = (status: string) => {
    const isActive = status?.toLowerCase() === "active";
    return (
      <span
        className={`inline-flex px-2 py-1 text-xs rounded-full ${
          isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}
      >
        {status || "N/A"}
      </span>
    );
  };

  const getHealthBadge = (health: string) => {
    const healthLower = health?.toLowerCase();
    let colorClass = "bg-gray-100 text-gray-800";
    if (healthLower === "green") colorClass = "bg-green-100 text-green-800";
    else if (healthLower === "yellow") colorClass = "bg-yellow-100 text-yellow-800";
    else if (healthLower === "red") colorClass = "bg-red-100 text-red-800";
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${colorClass}`}>
        {health || "N/A"}
      </span>
    );
  };

  return (
    <div className="w-full h-full flex flex-col animate-fade-in">
      {/* Header Section */}
      <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm mb-6">
        <div className="p-4 border-b border-gray-200 bg-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Title with Count */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 h-6 w-6"
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
              <h2 className="text-lg font-semibold text-gray-900">
                Pods ({pods.length})
              </h2>
            </div>

            {/* Refresh Button */}
            <Button variant="outline" size="sm" onClick={fetchPods} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>

        {/* Content Section */}
        {isExpanded && (
          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
              </div>
            ) : pods.length > 0 ? (
              <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto">
                {pods.map((pod) => (
                  <Card key={pod.id} className="bg-white shadow-sm rounded-xl border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">ID: {pod.id}</div>
                          <div className="text-lg font-semibold mt-1">{pod.pod_name || "N/A"}</div>
                        </div>
                        {onPodClick && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onPodClick(pod.id)}
                            className="h-8 w-8 p-0 transition-colors bg-gray-100 text-gray-600 hover:text-gray-800 hover:bg-[#FDDC4E] hover:text-black"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">Doors:</span>{" "}
                            {pod.pod_numtotaldoors || "N/A"}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">Power:</span>{" "}
                            {pod.pod_power_status || "N/A"}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">Status:</span>{" "}
                            {getStatusBadge(pod.status)}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">Health:</span>{" "}
                            {getHealthBadge(pod.pod_health)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <NoDataIllustration
                title="No pods found"
                description="No pods are associated with this location."
                icon="inbox"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationPodsTable;
