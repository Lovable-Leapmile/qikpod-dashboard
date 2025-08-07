import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridApi } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import '@/styles/ag-grid.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Search, Download } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
interface LogData {
  id: number;
  log_id: string;
  log_level: string;
  log_type: string;
  log_message: string;
  log_eventtime: string;
  created_at: string;
  updated_at: string;
  status: string | null;
}
const LogsAgGrid = () => {
  const {
    accessToken
  } = useAuth();
  const gridRef = useRef<AgGridReact>(null);
  const [rowData, setRowData] = useState<LogData[]>([]);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const fetchLogs = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const response = await fetch('https://stagingv3.leapmile.com/logstore/logs/?order_by_field=updated_at&order_by_type=DESC', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setRowData(data.records || []);
      } else {
        console.error('Failed to fetch logs:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(fetchLogs, 2 * 60 * 1000);
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
  }, [autoRefresh, fetchLogs]);
  const LogLevelRenderer = (params: any) => {
    const level = params.value;
    const levelClasses = {
      INFO: 'bg-blue-100 text-blue-800',
      WARNING: 'bg-yellow-100 text-yellow-800',
      ERROR: 'bg-red-100 text-red-800',
      DEBUG: 'bg-gray-100 text-gray-800'
    };
    return <span className={cn('px-2 py-1 rounded-full text-xs font-semibold', levelClasses[level as keyof typeof levelClasses] || 'bg-gray-100 text-gray-800')}>
        {level}
      </span>;
  };
  const MessageRenderer = (params: any) => {
    return <div className="text-sm text-foreground truncate" title={params.value}>
        {params.value}
      </div>;
  };
  const DateRenderer = (params: any) => {
    const date = new Date(params.value);
    return <div className="text-sm">
        <div className="font-medium">{date.toLocaleDateString('en-IN')}</div>
        <div className="text-muted-foreground">{date.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })}</div>
      </div>;
  };
  const columnDefs: ColDef[] = [{
    headerName: 'ID',
    field: 'id',
    sortable: true,
    filter: true,
    width: 80,
    cellClass: 'font-medium text-center'
  }, {
    headerName: 'Log ID',
    field: 'log_id',
    sortable: true,
    filter: true,
    flex: 1,
    minWidth: 120,
    cellClass: 'font-medium text-primary'
  }, {
    headerName: 'Log Level',
    field: 'log_level',
    sortable: true,
    filter: true,
    flex: 1,
    minWidth: 120,
    cellRenderer: LogLevelRenderer
  }, {
    headerName: 'Log Type',
    field: 'log_type',
    sortable: true,
    filter: true,
    flex: 1,
    minWidth: 100,
    cellClass: 'text-muted-foreground'
  }, {
    headerName: 'Log Message',
    field: 'log_message',
    sortable: true,
    filter: true,
    flex: 3,
    minWidth: 300,
    cellRenderer: MessageRenderer
  }, {
    headerName: 'Time',
    field: 'log_eventtime',
    sortable: true,
    filter: true,
    flex: 1.5,
    minWidth: 160,
    cellRenderer: DateRenderer
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
  const exportData = () => {
    if (gridRef.current?.api) {
      gridRef.current.api.exportDataAsCsv({
        fileName: `logs-${new Date().toISOString().split('T')[0]}.csv`
      });
    }
  };
  return <div className="w-full h-full flex flex-col animate-fade-in">
      {/* Compact Header Section */}
      <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm mb-6">
        {/* Table Title and Controls */}
        <div className="p-4 border-b border-gray-200 bg-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <h2 className="text-lg font-semibold text-gray-900">Logs</h2>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Checkbox id="auto-refresh-logs" checked={autoRefresh} onCheckedChange={checked => setAutoRefresh(checked === true)} />
                <label htmlFor="auto-refresh-logs" className="text-sm text-muted-foreground font-medium">
                  Auto Refresh (2m)
                </label>
              </div>

              <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading}>
                <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
              </Button>

              <Button variant="outline" size="sm" onClick={exportData}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Search Controls */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input placeholder="Search logs..." value={globalFilter} onChange={e => handleGlobalFilter(e.target.value)} className="pl-10" />
            </div>
            
            {/* Page Size Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Show:</span>
              <Select value="25" onValueChange={() => {}}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-600">per page</span>
            </div>
          </div>
        </div>
      </div>

      {/* AG Grid Table */}
      <div className="flex-1 w-full">
        <div className="ag-theme-alpine h-[calc(100vh-200px)] w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm">
          <AgGridReact ref={gridRef} rowData={rowData} columnDefs={columnDefs} defaultColDef={{
          resizable: true,
          sortable: true,
          filter: true,
          cellClass: 'flex items-center'
        }} pagination={true} paginationPageSize={25} loading={loading} suppressRowHoverHighlight={false} suppressCellFocus={true} animateRows={true} rowBuffer={10} enableCellTextSelection={true} onGridReady={onGridReady} rowHeight={36} headerHeight={38} suppressColumnVirtualisation={true} rowSelection="single" suppressRowClickSelection={true} />
        </div>
      </div>
    </div>;
};
export default LogsAgGrid;