import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Eye, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardApi, Pod } from '@/services/dashboardApi';
import { useToast } from '@/hooks/use-toast';

interface PodsTableProps {
  onPodClick: (id: number) => void;
}

const PodsTable: React.FC<PodsTableProps> = ({ onPodClick }) => {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const [pods, setPods] = useState<Pod[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Pod;
    direction: 'asc' | 'desc';
  } | null>(null);

  // Filter pods based on search text
  const filteredPods = useMemo(() => {
    if (!searchText) return pods;
    
    return pods.filter((pod) =>
      Object.values(pod).some((value) =>
        value?.toString().toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }, [pods, searchText]);

  // Sort pods based on current sort configuration
  const sortedPods = useMemo(() => {
    if (!sortConfig) return filteredPods;

    return [...filteredPods].sort((a, b) => {
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
  }, [filteredPods, sortConfig]);

  // Calculate pagination
  const totalPages = Math.ceil(sortedPods.length / pageSize);
  const startIndex = currentPage * pageSize;
  const endIndex = startIndex + pageSize;
  const currentPods = sortedPods.slice(startIndex, endIndex);

  const handleSort = (key: keyof Pod) => {
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

  const fetchPods = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const data = await dashboardApi.getPods(accessToken, 1000);
      setPods(data);
    } catch (error) {
      console.error('Error fetching pods:', error);
      toast({
        title: "Error",
        description: "Failed to fetch pods",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchPods();
  }, [accessToken]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-lg text-gray-500">Loading pods...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Pods Management</h3>
          <p className="text-sm text-gray-500">Manage all pods in your network</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search pods..."
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
                  onClick={() => handleSort('pod_name')}
                >
                  POD NAME
                  {sortConfig?.key === 'pod_name' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </TableHead>
                <TableHead 
                  className="px-6 py-5 text-left text-sm font-semibold text-gray-600 cursor-pointer hover:text-gray-900 transition-colors"
                  onClick={() => handleSort('location_name')}
                >
                  LOCATION
                  {sortConfig?.key === 'location_name' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </TableHead>
                <TableHead 
                  className="px-6 py-5 text-left text-sm font-semibold text-gray-600 cursor-pointer hover:text-gray-900 transition-colors"
                  onClick={() => handleSort('status')}
                >
                  STATUS
                  {sortConfig?.key === 'status' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </TableHead>
                <TableHead 
                  className="px-6 py-5 text-left text-sm font-semibold text-gray-600 cursor-pointer hover:text-gray-900 transition-colors"
                  onClick={() => handleSort('pod_power_status')}
                >
                  POWER
                  {sortConfig?.key === 'pod_power_status' && (
                    <span className="ml-1">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </TableHead>
                <TableHead 
                  className="px-6 py-5 text-left text-sm font-semibold text-gray-600 cursor-pointer hover:text-gray-900 transition-colors"
                  onClick={() => handleSort('pod_health')}
                >
                  HEALTH
                  {sortConfig?.key === 'pod_health' && (
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
              {currentPods.map((pod, index) => (
                <TableRow
                  key={pod.id}
                  className={`
                    ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} 
                    hover:bg-blue-50/50 transition-colors border-b border-gray-100 last:border-b-0
                  `}
                >
                  <TableCell className="px-6 py-5 text-sm text-gray-900 font-medium">
                    {pod.pod_name}
                  </TableCell>
                  <TableCell className="px-6 py-5 text-sm text-gray-700">
                    {pod.location_name}
                  </TableCell>
                  <TableCell className="px-6 py-5">
                    <Badge variant={pod.status === 'active' ? 'default' : 'secondary'}>
                      {pod.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-5">
                    <Badge variant={pod.pod_power_status === 'ON' ? 'default' : 'destructive'}>
                      {pod.pod_power_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-5 text-sm text-gray-700">
                    {pod.pod_health}
                  </TableCell>
                  <TableCell className="px-6 py-5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onPodClick(pod.id)}
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
                Showing {startIndex + 1} to {Math.min(endIndex, sortedPods.length)} of {sortedPods.length} results
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

export default PodsTable;