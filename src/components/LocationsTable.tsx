import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardApi, Location } from '@/services/dashboardApi';
import { useToast } from '@/hooks/use-toast';

interface LocationsTableProps {
  onLocationClick: (id: number) => void;
}

const LocationsTable: React.FC<LocationsTableProps> = ({ onLocationClick }) => {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Location;
    direction: 'asc' | 'desc';
  } | null>(null);

  // Filter locations based on search text
  const filteredLocations = useMemo(() => {
    if (!searchText) return locations;
    
    return locations.filter((location) =>
      Object.values(location).some((value) =>
        value?.toString().toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }, [locations, searchText]);

  // Sort locations based on current sort configuration
  const sortedLocations = useMemo(() => {
    if (!sortConfig) return filteredLocations;

    return [...filteredLocations].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredLocations, sortConfig]);

  // Calculate pagination
  const totalPages = Math.ceil(sortedLocations.length / pageSize);
  const startIndex = currentPage * pageSize;
  const endIndex = startIndex + pageSize;
  const currentLocations = sortedLocations.slice(startIndex, endIndex);

  const handleSort = (key: keyof Location) => {
    setSortConfig((prevConfig) => {
      if (prevConfig?.key === key) {
        return {
          key,
          direction: prevConfig.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key, direction: 'asc' };
    });
  };

  const fetchLocations = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const data = await dashboardApi.getLocations(accessToken, 1000);
      setLocations(data);
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch locations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchLocations();
  }, [accessToken]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-lg text-gray-500">Loading locations...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Locations Management</h3>
          <p className="text-sm text-gray-500">Manage all locations in your network</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search locations..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <div className="mx-6 my-6 space-y-4">
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead 
                  className="px-6 py-5 text-left text-sm font-semibold text-gray-600 cursor-pointer hover:text-gray-900 transition-colors"
                  onClick={() => handleSort('id')}
                >
                  ID
                  {sortConfig?.key === 'id' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </TableHead>
                <TableHead 
                  className="px-6 py-5 text-left text-sm font-semibold text-gray-600 cursor-pointer hover:text-gray-900 transition-colors"
                  onClick={() => handleSort('primary_name')}
                >
                  NAME
                  {sortConfig?.key === 'primary_name' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </TableHead>
                <TableHead 
                  className="px-6 py-5 text-left text-sm font-semibold text-gray-600 cursor-pointer hover:text-gray-900 transition-colors"
                  onClick={() => handleSort('location_name')}
                >
                  LOCATION NAME
                  {sortConfig?.key === 'location_name' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </TableHead>
                <TableHead 
                  className="px-6 py-5 text-left text-sm font-semibold text-gray-600 cursor-pointer hover:text-gray-900 transition-colors"
                  onClick={() => handleSort('location_address')}
                >
                  ADDRESS
                  {sortConfig?.key === 'location_address' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </TableHead>
                <TableHead 
                  className="px-6 py-5 text-left text-sm font-semibold text-gray-600 cursor-pointer hover:text-gray-900 transition-colors"
                  onClick={() => handleSort('location_pincode')}
                >
                  PINCODE
                  {sortConfig?.key === 'location_pincode' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </TableHead>
                <TableHead className="px-6 py-5 text-left text-sm font-semibold text-gray-600">
                  ACTION
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentLocations.map((location, index) => (
                <TableRow
                  key={location.id}
                  className={`
                    ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} 
                    hover:bg-blue-50/50 transition-colors border-b border-gray-100 last:border-b-0
                  `}
                >
                  <TableCell className="px-6 py-5 text-sm text-gray-900 font-medium">
                    {location.id}
                  </TableCell>
                  <TableCell className="px-6 py-5 text-sm text-gray-700">
                    {location.primary_name}
                  </TableCell>
                  <TableCell className="px-6 py-5 text-sm text-gray-700">
                    {location.location_name}
                  </TableCell>
                  <TableCell className="px-6 py-5 text-sm text-gray-700">
                    {location.location_address}
                  </TableCell>
                  <TableCell className="px-6 py-5 text-sm text-gray-700">
                    {location.location_pincode}
                  </TableCell>
                  <TableCell className="px-6 py-5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onLocationClick(location.id)}
                      className="h-8 w-8 p-0 hover:bg-[#FDDC4E]/20 hover:text-gray-900 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-xl">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(endIndex, sortedLocations.length)} of {sortedLocations.length} results
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="text-xs"
              >
                Previous
              </Button>
              <span className="text-sm text-gray-700">
                Page {currentPage + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
                className="text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationsTable;