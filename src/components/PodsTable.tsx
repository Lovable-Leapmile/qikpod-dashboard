
import React, { useState, useEffect, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridReadyEvent, GridApi, ModuleRegistry } from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Search, Eye } from 'lucide-react';
import { dashboardApi, Pod } from '@/services/dashboardApi';
import { useAuth } from '@/contexts/AuthContext';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

interface PodsTableProps {
  onPodClick: (id: number) => void;
}

const PodCard: React.FC<{ pod: Pod; onPodClick: (id: number) => void }> = ({ 
  pod, 
  onPodClick 
}) => (
  <Card className="mb-4 bg-white shadow-sm">
    <CardContent className="p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-lg text-gray-900">{pod.pod_name}</h3>
          <p className="text-sm text-gray-600">{pod.location_name}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPodClick(pod.id)}
          className="text-blue-600 hover:text-blue-800"
        >
          <Eye className="w-4 h-4" />
        </Button>
      </div>
      <div className="space-y-2 text-sm">
        <div>
          <span className="font-medium text-gray-700">Pod ID: </span>
          <span className="text-gray-600">{pod.id}</span>
        </div>
        <div className="flex items-center space-x-4">
          <div>
            <span className="font-medium text-gray-700">Power: </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              pod.pod_power_status === 'ON' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {pod.pod_power_status}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Status: </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              pod.status === 'active' ? 'bg-green-100 text-green-800' : 
              pod.status === 'inactive' ? 'bg-red-100 text-red-800' : 
              'bg-gray-100 text-gray-800'
            }`}>
              {pod.status}
            </span>
          </div>
        </div>
        <div>
          <span className="font-medium text-gray-700">Health: </span>
          <span className="text-gray-600">{pod.pod_health}</span>
        </div>
        <div>
          <span className="font-medium text-gray-700">Total Doors: </span>
          <span className="text-gray-600">{pod.pod_numtotaldoors}</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

const PodsTable: React.FC<PodsTableProps> = ({ onPodClick }) => {
  const { accessToken } = useAuth();
  const [pods, setPods] = useState<Pod[]>([]);
  const [loading, setLoading] = useState(true);
  const [recordCount, setRecordCount] = useState(25);
  const [searchText, setSearchText] = useState('');
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const ActionCellRenderer = ({ data }: { data: Pod }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onPodClick(data.id)}
      className="text-blue-600 hover:text-blue-800"
    >
      <Eye className="w-4 h-4" />
    </Button>
  );

  const StatusCellRenderer = ({ value }: { value: string }) => (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
      value === 'active' ? 'bg-green-100 text-green-800' : 
      value === 'inactive' ? 'bg-red-100 text-red-800' : 
      'bg-gray-100 text-gray-800'
    }`}>
      {value}
    </span>
  );

  const PowerStatusCellRenderer = ({ value }: { value: string }) => (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
      value === 'ON' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
      {value}
    </span>
  );

  const columnDefs: ColDef[] = [
    { field: 'id', headerName: 'POD ID', width: 100, sortable: true },
    { field: 'pod_name', headerName: 'POD NAME', width: 150, sortable: true },
    { 
      field: 'pod_power_status', 
      headerName: 'POWER STATUS', 
      width: 130, 
      sortable: true,
      cellRenderer: PowerStatusCellRenderer
    },
    { 
      field: 'status', 
      headerName: 'STATUS', 
      width: 120, 
      sortable: true,
      cellRenderer: StatusCellRenderer
    },
    { field: 'pod_health', headerName: 'HEALTH', width: 120, sortable: true },
    { field: 'pod_numtotaldoors', headerName: 'TOTAL DOORS', width: 130, sortable: true },
    { field: 'location_name', headerName: 'LOCATION NAME', width: 200, sortable: true },
    {
      field: 'action',
      headerName: 'ACTION',
      width: 100,
      cellRenderer: ActionCellRenderer,
      sortable: false,
      filter: false,
    },
  ];

  const fetchData = useCallback(async () => {
    if (!accessToken) return;
    
    setLoading(true);
    try {
      console.log('Fetching pods with token:', accessToken);
      console.log('Record count:', recordCount);
      const data = await dashboardApi.getPods(accessToken, recordCount);
      console.log('Received pods data:', data);
      setPods(data);
    } catch (error) {
      console.error('Error fetching pods:', error);
    } finally {
      setLoading(false);
    }
  }, [accessToken, recordCount]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onGridReady = (params: GridReadyEvent) => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
  };

  useEffect(() => {
    if (gridApi) {
      gridApi.setGridOption('quickFilterText', searchText);
    }
  }, [searchText, gridApi]);

  const defaultColDef = {
    resizable: true,
    sortable: true,
    filter: true,
  };

  // Filter pods for mobile cards
  const filteredPods = pods.filter(pod => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    return (
      pod.pod_name?.toLowerCase().includes(searchLower) ||
      pod.location_name?.toLowerCase().includes(searchLower) ||
      pod.status?.toLowerCase().includes(searchLower) ||
      pod.pod_power_status?.toLowerCase().includes(searchLower) ||
      pod.pod_health?.toLowerCase().includes(searchLower) ||
      pod.id.toString().includes(searchLower)
    );
  });

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
            <Package className="w-5 h-5 mr-2 text-yellow-500" />
            Pods
          </CardTitle>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search pods..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-64"
              />
            </div>
            <Select value={recordCount.toString()} onValueChange={(value) => setRecordCount(Number(value))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 records</SelectItem>
                <SelectItem value="25">25 records</SelectItem>
                <SelectItem value="50">50 records</SelectItem>
                <SelectItem value="100">100 records</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isMobile ? (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading pods...</p>
              </div>
            ) : filteredPods.length > 0 ? (
              <div className="max-h-96 overflow-y-auto">
                {filteredPods.map((pod) => (
                  <PodCard
                    key={pod.id}
                    pod={pod}
                    onPodClick={onPodClick}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No pods found</p>
              </div>
            )}
          </div>
        ) : (
          <div className="ag-theme-alpine" style={{ height: 500, width: '100%' }}>
            <AgGridReact
              rowData={pods}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              loading={loading}
              onGridReady={onGridReady}
              animateRows={true}
              rowSelection="single"
              suppressCellFocus={true}
              rowHeight={50}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PodsTable;
