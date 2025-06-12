import React, { useState, useEffect, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridReadyEvent, GridApi, ModuleRegistry } from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Eye } from 'lucide-react';
import { dashboardApi, Pod } from '@/services/dashboardApi';
import { useAuth } from '@/contexts/AuthContext';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);
interface PodsTableProps {
  onPodClick: (id: number) => void;
}
const PodCard: React.FC<{
  pod: Pod;
  onPodClick: (id: number) => void;
}> = ({
  pod,
  onPodClick
}) => <Card className="mb-3 bg-white shadow-sm hover:shadow-md transition-shadow rounded-xl">
    <CardContent className="p-6">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 pr-3">
          <h3 className="font-semibold text-lg text-gray-900 mb-1">{pod.pod_name}</h3>
          <p className="text-sm text-gray-600 mb-2">{pod.location_name}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => onPodClick(pod.id)} className="text-[#FDDC4E] hover:text-yellow-600 hover:bg-yellow-50 shrink-0">
          <Eye className="w-4 h-4" />
        </Button>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <div>
            <span className="font-medium text-gray-700">Pod ID: </span>
            <span className="text-gray-600">{pod.id}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Total Doors: </span>
            <span className="text-gray-600">{pod.pod_numtotaldoors}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center">
            <span className="font-medium text-gray-700 mr-2">Power: </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${pod.pod_power_status === 'ON' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {pod.pod_power_status}
            </span>
          </div>
          <div className="flex items-center">
            <span className="font-medium text-gray-700 mr-2">Status: </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${pod.status === 'active' ? 'bg-green-100 text-green-800' : pod.status === 'inactive' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
              {pod.status}
            </span>
          </div>
        </div>
        <div>
          <span className="font-medium text-gray-700">Health: </span>
          <span className="text-gray-600">{pod.pod_health}</span>
        </div>
      </div>
    </CardContent>
  </Card>;
const PodsTable: React.FC<PodsTableProps> = ({
  onPodClick
}) => {
  const {
    accessToken
  } = useAuth();
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
  const ActionCellRenderer = ({
    data
  }: {
    data: Pod;
  }) => <div className="flex justify-center items-center h-full">
      <Button variant="ghost" size="sm" onClick={() => onPodClick(data.id)} className="text-gray-800 bg-gray-100">
        <Eye className="w-4 h-4" />
      </Button>
    </div>;
  const StatusCellRenderer = ({
    value
  }: {
    value: string;
  }) => <div className="flex justify-center items-center h-full">
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${value === 'active' ? 'bg-green-100 text-green-800' : value === 'inactive' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
        {value}
      </span>
    </div>;
  const PowerStatusCellRenderer = ({
    value
  }: {
    value: string;
  }) => <div className="flex justify-center items-center h-full">
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${value === 'ON' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {value}
      </span>
    </div>;
  const columnDefs: ColDef[] = [{
    field: 'id',
    headerName: 'POD ID',
    width: 120,
    sortable: true,
    cellClass: 'vertical-center'
  }, {
    field: 'pod_name',
    headerName: 'POD NAME',
    width: 200,
    sortable: true,
    cellClass: 'vertical-center'
  }, {
    field: 'pod_power_status',
    headerName: 'POWER STATUS',
    width: 150,
    sortable: true,
    cellRenderer: PowerStatusCellRenderer,
    cellClass: 'vertical-center'
  }, {
    field: 'status',
    headerName: 'STATUS',
    width: 130,
    sortable: true,
    cellRenderer: StatusCellRenderer,
    cellClass: 'vertical-center'
  }, {
    field: 'pod_health',
    headerName: 'HEALTH',
    width: 150,
    sortable: true,
    cellClass: 'vertical-center'
  }, {
    field: 'pod_numtotaldoors',
    headerName: 'TOTAL DOORS',
    width: 140,
    sortable: true,
    cellClass: 'vertical-center'
  }, {
    field: 'location_name',
    headerName: 'LOCATION NAME',
    flex: 1,
    minWidth: 200,
    sortable: true,
    cellClass: 'vertical-center'
  }, {
    field: 'action',
    headerName: 'ACTION',
    width: 120,
    cellRenderer: ActionCellRenderer,
    sortable: false,
    filter: false,
    cellClass: 'vertical-center'
  }];
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
    floatingFilter: false
  };

  // Filter pods for mobile cards
  const filteredPods = pods.filter(pod => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    return pod.pod_name?.toLowerCase().includes(searchLower) || pod.location_name?.toLowerCase().includes(searchLower) || pod.status?.toLowerCase().includes(searchLower) || pod.pod_power_status?.toLowerCase().includes(searchLower) || pod.pod_health?.toLowerCase().includes(searchLower) || pod.id.toString().includes(searchLower);
  });
  return <div className="space-y-6">
      {/* Pod Dashboard Manager */}
      <Card className="bg-white shadow-sm rounded-xl">
        <CardHeader className="pb-4 pt-6 bg-gray-50 rounded-t-xl">
          <CardTitle className="text-xl font-semibold text-gray-900 text-center">
            Pod Dashboard Manager
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Alert Pods</span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Reservation Pods</span>
                <span className="text-sm text-gray-600 mx-[12px]">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Ignore Pods</span>
                <span className="text-sm text-gray-600 mx-[12px]">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Unregistered</span>
                <span className="text-sm text-gray-600 mx-[12px]">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Certified</span>
                <span className="text-sm text-gray-600 mx-[12px]">0</span>
              </div>
            </div>

            {/* Center Column */}
            <div className="text-center space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Total Pods</p>
                <p className="text-4xl font-bold text-gray-900">0</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Field Pods</p>
                <p className="text-4xl font-bold text-gray-900">0</p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Green</span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Red</span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Yellow</span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Active</span>
                <span className="text-sm text-gray-600 mx-[12px]">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Inactive</span>
                <span className="text-sm text-gray-600 mx-[12px]">0</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Existing Pods Table */}
      <Card className="bg-white shadow-sm rounded-xl">
        <CardHeader className="pb-6 pt-6 rounded-t-xl bg-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
              <Package className="w-5 h-5 mr-2 text-[#1f2937]" />
              Pods
            </CardTitle>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center space-x-2">
                <Input placeholder="Search pods..." value={searchText} onChange={e => setSearchText(e.target.value)} className="w-full md:w-64 rounded-lg" />
              </div>
              <Select value={recordCount.toString()} onValueChange={value => setRecordCount(Number(value))}>
                <SelectTrigger className="w-full md:w-32 rounded-lg">
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
        <CardContent className="p-6">
          {isMobile ? <div className="space-y-3">
              {loading ? <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FDDC4E] mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading pods...</p>
                </div> : filteredPods.length > 0 ? <div className="max-h-[70vh] overflow-y-auto px-1">
                  {filteredPods.map(pod => <PodCard key={pod.id} pod={pod} onPodClick={onPodClick} />)}
                </div> : <div className="text-center py-8">
                  <p className="text-gray-500">No pods found</p>
                </div>}
            </div> : <div className="ag-theme-alpine w-full rounded-lg overflow-hidden" style={{
          height: 500,
          '--ag-header-background-color': '#FFFBEB',
          '--ag-row-hover-color': '#FEF3C7',
          '--ag-odd-row-background-color': '#FEFEFE',
          '--ag-even-row-background-color': '#F9F9F9',
          '--ag-header-cell-border': '1px solid #E5E7EB',
          '--ag-row-border-color': '#E5E7EB',
          '--ag-border-radius': '0.5rem',
          '--ag-selected-row-background-color': 'transparent'
        } as React.CSSProperties}>
              <AgGridReact rowData={pods} columnDefs={columnDefs} defaultColDef={defaultColDef} loading={loading} onGridReady={onGridReady} animateRows={true} suppressCellFocus={true} suppressRowClickSelection={true} rowHeight={60} headerHeight={50} pagination={true} paginationPageSize={10} paginationPageSizeSelector={[10, 25, 50]} suppressPaginationPanel={false} suppressColumnVirtualisation={true} rowClass="cursor-default" />
            </div>}
        </CardContent>
      </Card>
    </div>;
};
export default PodsTable;