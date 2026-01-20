import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useApiUrl } from "@/hooks/useApiUrl";
import { Eye, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import NoDataIllustration from "@/components/ui/no-data-illustration";

interface LocationUser {
  id: number;
  user_id: number;
  user_name: string;
  user_phone: string;
  user_type: string;
  user_email: string;
  location_id: number;
  location_name: string;
}

interface LocationUsersTableProps {
  locationId: number;
  onUserClick?: (userId: number) => void;
}

const LocationUsersTable: React.FC<LocationUsersTableProps> = ({
  locationId,
  onUserClick,
}) => {
  const { accessToken } = useAuth();
  const apiUrl = useApiUrl();
  const [users, setUsers] = useState<LocationUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const fetchUsers = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const response = await fetch(
        `${apiUrl.podcore}/users/locations/?location_id=${locationId}&order_by_field=updated_at&order_by_type=DESC`,
        {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = await response.json();
      setUsers(data.records || []);
    } catch (error) {
      console.error("Error fetching location users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, locationId]);

  const getUserTypeBadge = (userType: string) => {
    const type = userType?.toLowerCase();
    let colorClass = "bg-gray-100 text-gray-800";
    if (type === "admin") colorClass = "bg-purple-100 text-purple-800";
    else if (type === "customer") colorClass = "bg-blue-100 text-blue-800";
    else if (type === "merchant") colorClass = "bg-green-100 text-green-800";
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${colorClass}`}>
        {userType || "N/A"}
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
                Users ({users.length})
              </h2>
            </div>

            {/* Refresh Button */}
            <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading}>
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
            ) : users.length > 0 ? (
              <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto">
                {users.map((user) => (
                  <Card key={user.id} className="bg-white shadow-sm rounded-xl border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">ID: {user.user_id || user.id}</div>
                          <div className="text-lg font-semibold mt-1">{user.user_name || "N/A"}</div>
                        </div>
                        {onUserClick && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onUserClick(user.user_id || user.id)}
                            className="h-8 w-8 p-0 transition-colors bg-gray-100 text-gray-600 hover:text-gray-800 hover:bg-[#FDDC4E] hover:text-black"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">Phone:</span>{" "}
                            {user.user_phone || "N/A"}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">Email:</span>{" "}
                            <span className="break-all">{user.user_email || "N/A"}</span>
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">Type:</span>{" "}
                          {getUserTypeBadge(user.user_type)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <NoDataIllustration
                title="No users found"
                description="No users are associated with this location."
                icon="inbox"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationUsersTable;
