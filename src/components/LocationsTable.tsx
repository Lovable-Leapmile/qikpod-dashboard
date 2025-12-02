import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridApi } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import '@/styles/ag-grid.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Eye, RefreshCw, Search } from 'lucide-react';
import { dashboardApi, Location } from '@/services/dashboardApi';
import { useAuth } from '@/contexts/AuthContext';
import NoDataIllustration from '@/components/ui/no-data-illustration';
interface LocationsTableProps {
  onLocationClick: (id: number) => void;
  isDashboard?: boolean;
}
const LocationsTable: React.FC<LocationsTableProps> = ({
  onLocationClick,
  isDashboard = false
}) => {
  const {
    accessToken
  } = useAuth();
  const gridRef = useRef<AgGridReact>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pageSize, setPageSize] = useState(25);
  const [autoRefresh, setAutoRefresh] = useState(false);
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
  const ActionRenderer = ({
    data
  }: {
    data: Location;
  }) => {
    return <Button variant="ghost" size="sm" onClick={e => {
      e.stopPropagation();
      onLocationClick(data.id);
    }} className="h-8 w-8 p-0 transition-colors bg-gray-100 text-gray-600 hover:text-gray-800 hover:bg-[#FDDC4E] hover:text-black" title="View Location Details">
        <Eye className="h-4 w-4" />
      </Button>;
  };
  const columnDefs: ColDef[] = [{
    field: 'id',
    headerName: 'ID',
    sortable: true,
    filter: true,
    width: 80,
    cellClass: 'font-medium text-center'
  }, {
    field: 'primary_name',
    headerName: 'Name',
    sortable: true,
    filter: true,
    flex: 1,
    minWidth: 150,
    cellClass: 'font-medium'
  }, {
    field: 'location_name',
    headerName: 'Location',
    sortable: true,
    filter: true,
    flex: 1,
    minWidth: 150,
    cellClass: 'text-muted-foreground'
  }, {
    field: 'location_address',
    headerName: 'Address',
    sortable: true,
    filter: true,
    flex: 2,
    minWidth: 200,
    cellClass: 'text-muted-foreground',
    tooltipField: 'location_address'
  }, {
    field: 'location_pincode',
    headerName: 'Pincode',
    sortable: true,
    filter: true,
    width: 120,
    cellClass: 'text-muted-foreground text-center'
  }, {
    headerName: 'Action',
    width: 100,
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
        fileName: `locations-${new Date().toISOString().split('T')[0]}.csv`
      });
    }
  };
  const hasData = locations.length > 0;
  return <div className="w-full h-full flex flex-col animate-fade-in px-[4px]">
      {/* Header Section */}
      <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm mb-6">
        <div className="p-4 border-b border-gray-200 bg-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Title with Icon */}
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">Locations</h2>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px] sm:min-w-[300px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input placeholder="Search locations..." value={globalFilter} onChange={e => handleGlobalFilter(e.target.value)} className="pl-10" />
              </div>

              {/* Page Size Selector */}
              <div className="flex items-center space-x-2">
                <Select value={pageSize.toString()} onValueChange={value => setPageSize(Number(value))}>
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
                <Button variant="outline" size="sm" onClick={refreshData}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 w-full">
        {loading ? <div className="flex items-center justify-center h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div> : hasData ? <>
            {/* Desktop view - AG Grid */}
            <div className="hidden md:block">
              <div className={`ag-theme-alpine ${isDashboard ? 'h-[400px]' : 'h-[calc(100vh-200px)]'} w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm`}>
                <AgGridReact ref={gridRef} rowData={locations} columnDefs={columnDefs} defaultColDef={{
              resizable: true,
              sortable: true,
              filter: true,
              cellClass: 'flex items-center'
            }} pagination={true} paginationPageSize={pageSize} loading={loading} suppressRowHoverHighlight={false} suppressCellFocus={true} animateRows={true} rowBuffer={10} enableCellTextSelection={true} onGridReady={onGridReady} rowHeight={36} headerHeight={38} suppressColumnVirtualisation={true} rowSelection="single" suppressRowClickSelection={true} quickFilterText={globalFilter} />
              </div>
            </div>

            {/* Mobile view - Cards */}
            <div className="block md:hidden">
              <div className="space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto">
                {locations.map(location => <Card key={location.id} className="bg-white shadow-sm rounded-xl border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">ID: {location.id}</div>
                          <div className="text-lg font-semibold mt-1">{location.primary_name}</div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={e => {
                    e.stopPropagation();
                    onLocationClick(location.id);
                  }} className="h-8 w-8 p-0 transition-colors bg-gray-100 text-gray-600 hover:text-gray-800 hover:bg-[#FDDC4E] hover:text-black">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">Location:</span> {location.location_name}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">Address:</span> {location.location_address}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">Pincode:</span> {location.location_pincode}
                        </div>
                      </div>
                    </CardContent>
                  </Card>)}
              </div>
            </div>
          </> : <NoDataIllustration title="No locations found" description={locations.length === 0 ? "No locations data available." : "No matching locations found."} icon="map-pin" />}
      </div>
    </div>;
};
export default LocationsTable;