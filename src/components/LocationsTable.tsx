import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridApi } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import '@/styles/ag-grid.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Eye, RefreshCw, Search, Filter, Download } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { dashboardApi, Location } from '@/services/dashboardApi';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import NoDataIllustration from '@/components/ui/no-data-illustration';

interface LocationsTableProps {
  onLocationClick: (id: number) => void;
}

const LocationsTable: React.FC<LocationsTableProps> = ({ onLocationClick }) => {
  const { accessToken } = useAuth();
  const gridRef = useRef<AgGridReact>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [pageSize, setPageSize] = useState(25);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const data = await dashboardApi.getLocations(accessToken, pageSize);
      setLocations(data || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setLocations([]);
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

  const ActionRenderer = ({ data }: { data: Location }) => {
    return (
      <div className="flex items-center justify-center h-full">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onLocationClick(data.id);
          }}
          className="h-8 w-8 p-0 transition-colors bg-gray-100 text-gray-600 hover:text-gray-800 hover:bg-[#FDDC4E] hover:text-black"
          title="View Location Details"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  const columnDefs: ColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 100,
      cellClass: 'font-medium text-center'
    },
    {
      field: 'primary_name',
      headerName: 'Name',
      sortable: true,
      filter: true,
      flex: 2,
      minWidth: 180,
      cellClass: 'font-medium'
    },
    {
      field: 'location_name',
      headerName: 'Location',
      sortable: true,
      filter: true,
      flex: 2,
      minWidth: 200,
      cellClass: 'text-muted-foreground'
    },
    {
      field: 'location_address',
      headerName: 'Address',
      sortable: true,
      filter: true,
      flex: 3,
      minWidth: 300,
      cellClass: 'text-muted-foreground',
      tooltipField: 'location_address'
    },
    {
      field: 'location_pincode',
      headerName: 'Pincode',
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 120,
      cellClass: 'text-muted-foreground text-center'
    },
    {
      headerName: 'Action',
      field: 'action',
      width: 80,
      cellRenderer: ActionRenderer,
      sortable: false,
      filter: false,
      resizable: false,
      cellClass: ['flex', 'items-center', 'justify-center']
    }
  ];

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
        fileName: `locations-${new Date().toISOString().split('T')[0]}.csv`
      });
    }
  };

  const hasData = locations.length > 0;

  return (
    <div className="w-full h-full flex flex-col animate-fade-in px-2 sm:px-4 lg:px-6">
      {/* Header Section - Compact */}
      <div className="border border-gray-200 rounded-lg lg:rounded-xl bg-white overflow-hidden shadow-sm mb-4 sm:mb-6">
        <div className="p-3 sm:p-4 border-b border-gray-200 bg-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-3">
            <div className="flex items-center space-x-3">
              <MapPin className="h-4 w-4 text-gray-900" />
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Locations</h2>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="auto-refresh"
                  checked={autoRefresh}
                  onCheckedChange={checked => setAutoRefresh(checked === true)}
                />
                <label htmlFor="auto-refresh" className="text-xs sm:text-sm text-muted-foreground font-medium">
                  <span className="hidden sm:inline">Auto Refresh (2m)</span>
                  <span className="sm:hidden">Auto (2m)</span>
                </label>
              </div>

              <Button variant="outline" size="sm" onClick={refreshData} disabled={loading}>
                <RefreshCw className={cn('h-3 w-3 sm:h-4 sm:w-4', loading && 'animate-spin')} />
                <span className="hidden md:inline ml-1">Refresh</span>
              </Button>

              <Button variant="outline" size="sm" onClick={exportData}>
                <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="relative flex-1 max-w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
              <Input
                placeholder="Search locations..."
                value={globalFilter}
                onChange={e => handleGlobalFilter(e.target.value)}
                className="pl-8 sm:pl-10 text-sm"
              />
            </div>

            {/* Status Filter - Not used but kept for consistency */}
            <div className="flex items-center gap-2">
              <Filter className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px] text-sm">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Page Size Selector */}
            <div className="flex items-center space-x-2">
              <Select value={pageSize.toString()} onValueChange={value => setPageSize(Number(value))}>
                <SelectTrigger className="w-16 sm:w-20 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs sm:text-sm text-gray-600">records</span>
            </div>
          </div>
        </div>
      </div>

      {/* AG Grid Table */}
      <div className="flex-1 w-full">
        {loading ? (
          <div className="flex items-center justify-center h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : hasData ? (
          <div className="ag-theme-alpine h-[calc(100vh-240px)] sm:h-[calc(100vh-280px)] w-full rounded-lg lg:rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            <AgGridReact
              ref={gridRef}
              rowData={locations}
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
              rowHeight={52}
              headerHeight={50}
              suppressColumnVirtualisation={true}
              rowSelection="single"
              suppressRowClickSelection={true}
              quickFilterText={globalFilter}
            />
          </div>
        ) : (
          <NoDataIllustration
            title="No locations found"
            description={locations.length === 0 ? "No locations data available." : "No matching locations found."}
            icon="map-pin"
          />
        )}
      </div>
    </div>
  );
};

export default LocationsTable;