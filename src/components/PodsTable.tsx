import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridApi } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import '@/styles/ag-grid.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Eye, RefreshCw, Search, Filter, Download } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { dashboardApi, Pod } from '@/services/dashboardApi';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import NoDataIllustration from '@/components/ui/no-data-illustration';

interface PodsTableProps {
  onPodClick: (id: number) => void;
}

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
  const [pageSize, setPageSize] = useState(25);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const data = await dashboardApi.getPods(accessToken, pageSize);
      setPods(data || []);
    } catch (error) {
      console.error('Error fetching pods:', error);
      setPods([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken, pageSize]);

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

  const ActionRenderer = ({
    data
  }: {
    data: Pod;
  }) => {
    return <div className="flex items-center justify-center h-full">
        <Button variant="ghost" size="sm" onClick={e => {
        e.stopPropagation();
        onPodClick(data.id);
      }} className="h-8 w-8 p-0 transition-colors bg-gray-100 text-gray-600 hover:text-gray-800 hover:bg-[#FDDC4E] hover:text-black" title="View Pod Details">
          <Eye className="h-4 w-4" />
        </Button>
      </div>;
  };

  const StatusRenderer = ({
    value
  }: {
    value: string;
  }) => {
    return <span className={cn('px-2 py-1 rounded-full text-xs font-semibold',
      value === 'active' ? 'bg-green-100 text-green-800' :
      value === 'inactive' ? 'bg-red-100 text-red-800' :
      'bg-gray-100 text-gray-800')}>
      {value}
    </span>;
  };

  const PowerStatusRenderer = ({
    value
  }: {
    value: string;
  }) => {
    return <span className={cn('px-2 py-1 rounded-full text-xs font-semibold',
      value === 'ON' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
      {value}
    </span>;
  };

  const columnDefs: ColDef[] = [{
    field: 'id',
    headerName: 'ID',
    sortable: true,
    filter: true,
    flex: 1,
    minWidth: 100,
    cellClass: 'font-medium text-center'
  }, {
    field: 'pod_name',
    headerName: 'Pod Name',
    sortable: true,
    filter: true,
    flex: 2,
    minWidth: 180,
    cellClass: 'font-medium'
  }, {
    field: 'pod_power_status',
    headerName: 'Power Status',
    sortable: true,
    filter: true,
    flex: 1,
    minWidth: 120,
    cellRenderer: PowerStatusRenderer,
    cellClass: 'text-center'
  }, {
    field: 'status',
    headerName: 'Status',
    sortable: true,
    filter: true,
    flex: 1,
    minWidth: 120,
    cellRenderer: StatusRenderer,
    cellClass: 'text-center'
  }, {
    field: 'pod_health',
    headerName: 'Health',
    sortable: true,
    filter: true,
    flex: 1,
    minWidth: 120,
    cellClass: 'text-muted-foreground text-center'
  }, {
    field: 'pod_numtotaldoors',
    headerName: 'Total Doors',
    sortable: true,
    filter: true,
    flex: 1,
    minWidth: 120,
    cellClass: 'text-muted-foreground text-center'
  }, {
    field: 'location_name',
    headerName: 'Location',
    sortable: true,
    filter: true,
    flex: 2,
    minWidth: 200,
    cellClass: 'text-muted-foreground'
  }, {
    headerName: 'Action',
    field: 'action',
    width: 80,
    cellRenderer: ActionRenderer,
    sortable: false,
    filter: false,
    resizable: false,
    cellClass: ['flex', 'items-center', 'justify-center']
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

  const exportData = () => {
    if (gridRef.current?.api) {
      gridRef.current.api.exportDataAsCsv({
        fileName: `pods-${new Date().toISOString().split('T')[0]}.csv`
      });
    }
  };

  const hasData = pods.length > 0;

  return <div className="w-full h-full flex flex-col animate-fade-in sm:px-4 lg:px-6 px-0">
      {/* Header Section - Compact */}
      <div className="border border-gray-200 rounded-lg lg:rounded-xl bg-white overflow-hidden shadow-sm mb-4 sm:mb-6">
        <div className="p-3 border-b border-gray-200 bg-gray-100">
          <div className="flex flex-row items-center justify-between gap-4 w-full">
            <div className="flex items-center space-x-2">
              <Package className="h-3.5 w-3.5 text-gray-900" />
              <h2 className="text-sm font-semibold text-gray-900">Pods</h2>
            </div>

            <div className="flex items-center space-x-3 flex-1 max-w-2xl">
              {/* Search */}
              <div className="relative flex-1 min-w-[120px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                <Input placeholder="Search..." value={globalFilter} onChange={e => handleGlobalFilter(e.target.value)} className="pl-8 text-xs h-8" />
              </div>

              {/* Page Size Selector */}
              <div className="flex items-center space-x-1">
                <Select value={pageSize.toString()} onValueChange={value => setPageSize(Number(value))}>
                  <SelectTrigger className="w-16 text-xs h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-xs text-gray-600">/page</span>
              </div>

              <Button variant="outline" size="sm" onClick={refreshData} className="h-8 px-2 text-xs">
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* AG Grid Table */}
      <div className="flex-1 w-full">
        {loading ? <div className="flex items-center justify-center h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div> : hasData ? <div className="ag-theme-alpine h-[calc(100vh-240px)] sm:h-[calc(100vh-280px)] w-full rounded-lg lg:rounded-xl overflow-hidden border border-gray-200 shadow-sm">
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
              paginationPageSize={pageSize}
              loading={loading}
              suppressRowHoverHighlight={false}
              suppressCellFocus={true}
              animateRows={true}
              rowBuffer={10}
              enableCellTextSelection={true}
              onGridReady={onGridReady}
              rowHeight={36}
              headerHeight={38}
              suppressColumnVirtualisation={true}
              rowSelection="single"
              suppressRowClickSelection={true}
              quickFilterText={globalFilter}
            />
          </div> : <NoDataIllustration title="No pods found" description={pods.length === 0 ? "No pods data available." : "No matching pods found."} icon="package" />}
      </div>
    </div>;
};

export default PodsTable;