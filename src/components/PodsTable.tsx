import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridApi } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import '@/styles/ag-grid.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Eye, RefreshCw, Search } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { dashboardApi, Pod } from '@/services/dashboardApi';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import NoDataIllustration from '@/components/ui/no-data-illustration';
interface PodsTableProps {
  onPodClick: (id: number) => void;
}
const PodCard: React.FC<{
  pod: Pod;
  onPodClick: (id: number) => void;
}> = ({
  pod,
  onPodClick
}) => <Card className="bg-white shadow-sm rounded-xl border-gray-200 mb-4">
    <CardContent className="p-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{pod.pod_name}</h3>
          <p className="text-sm text-muted-foreground">{pod.location_name}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => onPodClick(pod.id)} className="text-gray-800 bg-gray-100 hover:bg-gray-200">
          <Eye className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          <div>
            <span className="font-medium text-gray-700">ID: </span>
            <span className="text-muted-foreground">{pod.id}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Doors: </span>
            <span className="text-muted-foreground">{pod.pod_numtotaldoors}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center">
            <span className="font-medium text-gray-700 mr-1">Power: </span>
            <span className={cn('px-2 py-1 rounded-full text-xs font-semibold', pod.pod_power_status === 'ON' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
              {pod.pod_power_status}
            </span>
          </div>
          <div className="flex items-center">
            <span className="font-medium text-gray-700 mr-1">Status: </span>
            <span className={cn('px-2 py-1 rounded-full text-xs font-semibold', pod.status === 'active' ? 'bg-green-100 text-green-800' : pod.status === 'inactive' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800')}>
              {pod.status}
            </span>
          </div>
        </div>
        <div>
          <span className="font-medium text-gray-700">Health: </span>
          <span className="text-muted-foreground">{pod.pod_health}</span>
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
  const gridRef = useRef<AgGridReact>(null);
  const [pods, setPods] = useState<Pod[]>([]);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [recordCount, setRecordCount] = useState(25);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  const fetchData = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const data = await dashboardApi.getPods(accessToken, recordCount);
      setPods(data || []); // Ensure we have an array even if data is undefined
    } catch (error) {
      console.error('Error fetching pods:', error);
      setPods([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken, recordCount]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(fetchData, 2 * 60 * 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, fetchData]);
  const ActionCellRenderer = ({
    data
  }: {
    data: Pod;
  }) => <Button variant="ghost" size="sm" onClick={() => onPodClick(data.id)} className="text-gray-800 bg-gray-100 hover:bg-gray-200">
      <Eye className="h-4 w-4" />
    </Button>;
  const StatusCellRenderer = ({
    value
  }: {
    value: string;
  }) => <span className={cn('px-2 py-1 rounded-full text-xs font-semibold', value === 'active' ? 'bg-green-100 text-green-800' : value === 'inactive' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800')}>
      {value}
    </span>;
  const PowerStatusCellRenderer = ({
    value
  }: {
    value: string;
  }) => <span className={cn('px-2 py-1 rounded-full text-xs font-semibold', value === 'ON' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
      {value}
    </span>;
  const columnDefs: ColDef[] = [{
    field: 'id',
    headerName: 'POD ID',
    width: 120,
    sortable: true,
    cellClass: 'font-medium text-center'
  }, {
    field: 'pod_name',
    headerName: 'POD NAME',
    width: 200,
    sortable: true,
    cellClass: 'font-medium'
  }, {
    field: 'pod_power_status',
    headerName: 'POWER STATUS',
    width: 150,
    sortable: true,
    cellRenderer: PowerStatusCellRenderer,
    cellClass: 'flex items-center'
  }, {
    field: 'status',
    headerName: 'STATUS',
    width: 130,
    sortable: true,
    cellRenderer: StatusCellRenderer,
    cellClass: 'flex items-center'
  }, {
    field: 'pod_health',
    headerName: 'HEALTH',
    width: 150,
    sortable: true,
    cellClass: 'text-muted-foreground'
  }, {
    field: 'pod_numtotaldoors',
    headerName: 'TOTAL DOORS',
    width: 140,
    sortable: true,
    cellClass: 'text-muted-foreground'
  }, {
    field: 'location_name',
    headerName: 'LOCATION',
    flex: 1,
    minWidth: 200,
    sortable: true,
    cellClass: 'text-muted-foreground'
  }, {
    field: 'action',
    headerName: 'ACTION',
    width: 120,
    cellRenderer: ActionCellRenderer,
    sortable: false,
    filter: false,
    cellClass: 'flex items-center justify-center'
  }];
  const onGridReady = (params: any) => {
    params.api.sizeColumnsToFit();
  };
  const handleGlobalFilter = useCallback((value: string) => {
    setGlobalFilter(value);
    if (gridRef.current?.api) {
      gridRef.current.api.setGridOption('quickFilterText', value);
    }
  }, []);
  const refreshData = useCallback(() => {
    fetchData();
  }, [fetchData]);
  const hasData = pods && pods.length > 0;
  const filteredPods = pods.filter(pod => {
    if (!globalFilter) return true;
    const searchLower = globalFilter.toLowerCase();
    return pod.pod_name?.toLowerCase().includes(searchLower) || pod.location_name?.toLowerCase().includes(searchLower) || pod.status?.toLowerCase().includes(searchLower) || pod.pod_power_status?.toLowerCase().includes(searchLower) || pod.pod_health?.toLowerCase().includes(searchLower) || pod.id.toString().includes(searchLower);
  });
  return <div className="w-full h-full flex flex-col animate-fade-in">
      {/* Header Section */}
      <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm mb-6">
        <div className="p-4 border-b border-gray-200 bg-gray-100">
          

          {/* Search Controls */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input placeholder="Search pods..." value={globalFilter} onChange={e => handleGlobalFilter(e.target.value)} className="pl-10" />
            </div>

            {/* Page Size Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Show:</span>
              <Select value={recordCount.toString()} onValueChange={value => setRecordCount(Number(value))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="500">500</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-600">per page</span>
            </div>
          </div>
        </div>
      </div>

      {/* AG Grid Table */}
      <div className="flex-1 w-full">
        {hasData ? <>
            {/* Desktop view - AG Grid */}
            <div className="hidden md:block">
              <div className="ag-theme-alpine h-[calc(100vh-280px)] w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                <AgGridReact
                  ref={gridRef}
                  rowData={pods}
                  columnDefs={columnDefs}
                  defaultColDef={{
                    resizable: true,
                    sortable: true,
                    filter: true,
                    cellClass: 'flex items-center'
                  }}
                  pagination={true}
                  paginationPageSize={25}
                  loading={loading}
                  suppressRowHoverHighlight={true}
                  suppressCellFocus={true}
                  animateRows={false}
                  rowBuffer={10}
                  enableCellTextSelection={true}
                  onGridReady={onGridReady}
                  rowHeight={40}
                  headerHeight={40}
                  suppressColumnVirtualisation={true}
                  rowSelection="single"
                  suppressRowClickSelection={true}
                  onRowClicked={(event) => onPodClick(event.data.id)}
                />
              </div>
            </div>

            {/* Mobile view - Cards */}
            <div className="block md:hidden">
              <div className="space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto">
                {filteredPods.map(pod => <PodCard key={pod.id} pod={pod} onPodClick={onPodClick} />)}
              </div>
            </div>
          </> : <NoDataIllustration title="No pods found" description="No pods data available." icon="package" />}
      </div>
    </div>;
};
export default PodsTable;