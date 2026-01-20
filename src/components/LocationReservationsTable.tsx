import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardApi, StandardReservation, AdhocReservation } from "@/services/dashboardApi";
import { Eye, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import NoDataIllustration from "@/components/ui/no-data-illustration";

interface LocationReservationsTableProps {
  locationId: number;
  onStandardReservationClick?: (reservationId: number) => void;
  onAdhocReservationClick?: (reservationId: number) => void;
}

const LocationReservationsTable: React.FC<LocationReservationsTableProps> = ({
  locationId,
  onStandardReservationClick,
  onAdhocReservationClick,
}) => {
  const { accessToken } = useAuth();
  const [isStandardMode, setIsStandardMode] = useState(true);
  const [standardReservations, setStandardReservations] = useState<StandardReservation[]>([]);
  const [adhocReservations, setAdhocReservations] = useState<AdhocReservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const fetchStandardReservations = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const data = await dashboardApi.getLocationStandardReservations(accessToken, locationId);
      setStandardReservations(data || []);
    } catch (error) {
      console.error("Error fetching location standard reservations:", error);
      setStandardReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdhocReservations = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const data = await dashboardApi.getLocationAdhocReservations(accessToken, locationId);
      setAdhocReservations(data || []);
    } catch (error) {
      console.error("Error fetching location adhoc reservations:", error);
      setAdhocReservations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isStandardMode) {
      fetchStandardReservations();
    } else {
      fetchAdhocReservations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStandardMode, accessToken, locationId]);

  const refreshData = () => {
    if (isStandardMode) {
      fetchStandardReservations();
    } else {
      fetchAdhocReservations();
    }
  };

  const currentStandardHasData = standardReservations && standardReservations.length > 0;
  const currentAdhocHasData = adhocReservations && adhocReservations.length > 0;
  
  const totalCount = isStandardMode ? standardReservations.length : adhocReservations.length;

  return (
    <div className="w-full h-full flex flex-col animate-fade-in">
      {/* Header Section */}
      <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm mb-6">
        <div className="p-4 border-b border-gray-200 bg-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Title with Collapse Toggle and Count */}
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
                Reservations ({totalCount})
              </h2>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
              {/* Mode Toggle */}
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-medium ${isStandardMode ? "text-gray-900" : "text-gray-500"}`}>
                  Standard
                </span>
                <Switch
                  checked={!isStandardMode}
                  onCheckedChange={(checked) => setIsStandardMode(!checked)}
                  className="data-[state=checked]:bg-[#FDDC4E] data-[state=checked]:border-[#FDDC4E]"
                />
                <span className={`text-sm font-medium ${!isStandardMode ? "text-gray-900" : "text-gray-500"}`}>
                  Adhoc
                </span>
              </div>

              {/* Refresh Button */}
              <Button variant="outline" size="sm" onClick={refreshData} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {isExpanded && (
          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
              </div>
            ) : isStandardMode ? (
              currentStandardHasData ? (
                <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto">
                  {standardReservations.map((reservation) => (
                    <Card key={reservation.id} className="bg-white shadow-sm rounded-xl border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">ID: {reservation.id}</div>
                            <div className="text-lg font-semibold mt-1">{reservation.drop_by_name || "N/A"}</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onStandardReservationClick?.(reservation.id)}
                            className="h-8 w-8 p-0 transition-colors bg-gray-100 text-gray-600 hover:text-gray-800 hover:bg-[#FDDC4E] hover:text-black"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div className="text-sm">
                              <span className="font-medium text-gray-700">Location:</span>{" "}
                              {reservation.location_name || "N/A"}
                            </div>
                            <div className="text-sm">
                              <span className="font-medium text-gray-700">Created By:</span>{" "}
                              {reservation.created_by_name || "N/A"}
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div className="text-sm">
                              <span className="font-medium text-gray-700">Status:</span>
                              <span
                                className={`inline-flex px-2 py-1 text-xs rounded-full ml-2 ${
                                  reservation.status === "ACTIVE"
                                    ? "bg-green-100 text-green-800"
                                    : reservation.status === "COMPLETED"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {reservation.status || "N/A"}
                              </span>
                            </div>
                            <div className="text-sm">
                              <span className="font-medium text-gray-700">Created:</span> {reservation.created_at || "N/A"}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <NoDataIllustration
                  title="No reservations found"
                  description="No standard reservations found for this location."
                  icon="inbox"
                />
              )
            ) : currentAdhocHasData ? (
              <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto">
                {adhocReservations.map((reservation) => (
                  <Card key={reservation.id} className="bg-white shadow-sm rounded-xl border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">ID: {reservation.id}</div>
                          <div className="text-lg font-semibold mt-1">{reservation.pod_name || "N/A"}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onAdhocReservationClick?.(reservation.id)}
                          className="h-8 w-8 p-0 transition-colors bg-gray-100 text-gray-600 hover:text-gray-800 hover:bg-[#FDDC4E] hover:text-black"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">Phone:</span> {reservation.user_phone || "N/A"}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">Drop Time:</span> {reservation.drop_time || "N/A"}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">Pickup Time:</span>{" "}
                            {reservation.pickup_time || "N/A"}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">RTO Pickup:</span>{" "}
                            {reservation.rto_picktime || "N/A"}
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">Status:</span>
                          <span
                            className={`inline-flex px-2 py-1 text-xs rounded-full ml-2 ${
                              reservation.reservation_status === "ACTIVE"
                                ? "bg-green-100 text-green-800"
                                : reservation.reservation_status === "COMPLETED"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {reservation.reservation_status || "N/A"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <NoDataIllustration
                title="No reservations found"
                description="No adhoc reservations found for this location."
                icon="inbox"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationReservationsTable;