import React, { useState, useEffect, useCallback } from 'react';
import { ColDef, GridApi } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Eye, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { dashboardApi, Pod } from '@/services/dashboardApi';

interface DashboardPodsTableProps {
  onPodClick: (id: number) => void;
}

const PodCard: React.FC<{ pod: Pod; onPodClick: (id: number) => void }> = ({ pod, onPodClick }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
    <div className="flex justify-between items-start mb-2">
      <div>
        <h3 className="font-semibold text-gray-900">{pod.pod_name}</h3>
        <p className="text-sm text-gray-600">{pod.location_name}</p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPodClick(pod.id)}
        className="h-8 w-8 p-0"
      >
        <Eye className="h-4 w-4" />
      </Button>
    </div>
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Badge variant={pod.status === 'active' ? 'default' : 'secondary'}>
            {pod.status}
          </Badge>
          <Badge variant={pod.pod_power_status === 'ON' ? 'default' : 'destructive'}>
            {pod.pod_power_status}
          </Badge>
        </div>
        <p className="text-sm text-gray-700">
          <span className="font-medium">Health:</span> {pod.pod_health}
        </p>
      </div>
  </div>
);

const DashboardPodsTable: React.FC<DashboardPodsTableProps> = ({ onPodClick }) => {
  const { accessToken } = useAuth();
  const isMobile = useIsMobile();
  const [pods, setPods] = useState<Pod[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [gridApi, setGridApi] = useState<GridApi | null>(null);

  const StatusCellRenderer = ({ value }: { value: string }) => (
    <Badge variant={value === 'active' ? 'default' : 'secondary'}>
      {value}
    </Badge>
  );

  const PowerStatusCellRenderer = ({ value }: { value: string }) => (
    <Badge variant={value === 'ON' ? 'default' : 'destructive'}>
      {value}
    </Badge>
  );

  const ActionCellRenderer = ({ data }: { data: Pod }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onPodClick(data.id)}
      className="h-8 w-8 p-0"
    >
      <Eye className="h-4 w-4" />
    </Button>
  );

  const columnDefs: ColDef<Pod>[] = [
    {
      field: 'pod_name',
      headerName: 'Pod Name',
      width: 200,
      sortable: true,
      filter: true,
    },
    {
      field: 'location_name',
      headerName: 'Location',
      width: 200,
      sortable: true,
      filter: true,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      sortable: true,
      filter: true,
      cellRenderer: StatusCellRenderer,
    },
    {
      field: 'pod_power_status',
      headerName: 'Power',
      width: 120,
      sortable: true,
      filter: true,
      cellRenderer: PowerStatusCellRenderer,
    },
    {
      field: 'pod_health',
      headerName: 'Health',
      width: 100,
      sortable: true,
      filter: true,
    },
    {
      headerName: 'Action',
      width: 100,
      cellRenderer: ActionCellRenderer,
      sortable: false,
      filter: false,
    },
  ];

  const defaultColDef = {
    resizable: true,
    sortable: true,
    filter: true,
  };

  const fetchData = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const data = await dashboardApi.getPods(accessToken, 1000);
      setPods(data);
    } catch (error) {
      console.error('Error fetching pods:', error);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onGridReady = (params: any) => {
    setGridApi(params.api);
  };

  useEffect(() => {
    if (gridApi) {
      gridApi.setGridOption('quickFilterText', searchText);
    }
  }, [searchText, gridApi]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center min-h-48">
          <div className="text-lg text-gray-500">Loading pods...</div>
        </div>
      </div>
    );
  }

  if (isMobile) {
    const filteredPods = pods.filter(pod =>
      Object.values(pod).some(value =>
        value?.toString().toLowerCase().includes(searchText.toLowerCase())
      )
    );

    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Pods</h3>
            <span className="text-sm text-gray-500">{filteredPods.length} records</span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search pods..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          {filteredPods.map((pod) => (
            <PodCard
              key={pod.id}
              pod={pod}
              onPodClick={onPodClick}
            />
          ))}
          {filteredPods.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No pods found</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Pods</h3>
          <span className="text-sm text-gray-500">{pods.length} records</span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search pods..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
  <div className="ag-theme-alpine min-w-[600px] w-full">
    <AgGridReact
      rowData={pods}
      columnDefs={columnDefs}
      defaultColDef={defaultColDef}
      onGridReady={onGridReady}
      pagination={true}
      paginationPageSize={10}
      domLayout="autoHeight"
      getRowHeight={() => 28} // More spacious rows
    />
  </div>
</div>

      </div>
    </div>
  );
};

export default DashboardPodsTable;