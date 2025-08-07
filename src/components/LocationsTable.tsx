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
import { MapPin, Eye, RefreshCw, Search } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { dashboardApi, Location } from '@/services/dashboardApi';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import NoDataIllustration from '@/components/ui/no-data-illustration';

interface LocationsTableProps {
  onLocationClick: (id: number) => void;
}

const LocationCard: React.FC<{
  location: Location;
  onLocationClick: (id: number) => void;
}> = ({ location, onLocationClick }) => (
  <Card className="bg-white shadow-sm rounded-xl border-gray-200 mb-4">
    <CardContent className="p-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{location.primary_name}</h3>
          <p className="text-sm text-muted-foreground">{location.location_name}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onLocationClick(location.id)}
          className="text-gray-800 bg-gray-100 hover:bg-gray-200"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          <div>
            <span className="font-medium text-gray-700">ID: </span>
            <span className="text-muted-foreground">{location.id}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Pincode: </span>
            <span className="text-muted-foreground">{location.location_pincode}</span>
          </div>
        </div>
        <div>
          <span className="font-medium text-gray-700">Address: </span>
          <span className="text-muted-foreground">{location.location_address}</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

const LocationsTable: React.FC<LocationsTableProps> = ({ onLocationClick }) => {
  const { accessToken } = useAuth();
  const gridRef = useRef<AgGridReact>(null);
  const [locations, setLocations] = useState<Location[]>([]);
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
      const data = await dashboardApi.getLocations(accessToken, recordCount);
      setLocations(data || []); // Ensure we have an array even if data is undefined
    } catch (error) {
      console.error('Error fetching locations:', error);
      setLocations([]);
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

  const ActionCellRenderer = ({ data }: { data: Location }) => (
    <div className="h-full flex items-center justify-center">
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onLocationClick(data.id);
        }}
        className="text-gray-800 bg-gray-100 hover:bg-gray-200"
      >
        <Eye className="h-4 w-4" />
      </Button>
    </div>
  );

  const columnDefs: ColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
      sortable: true,
      cellClass: 'font-medium text-center',
      suppressSizeToFit: true
    },
    {
      field: 'primary_name',
      headerName: 'NAME',
      width: 150,
      sortable: true,
      cellClass: 'font-medium',
      suppressSizeToFit: true
    },
    {
      field: 'location_name',
      headerName: 'LOCATION',
      width: 180,
      sortable: true,
      cellClass: 'text-muted-foreground',
      suppressSizeToFit: true
    },
    {
      field: 'location_address',
      headerName: 'ADDRESS',
      width: 300,
      sortable: true,
      cellClass: 'text-muted-foreground',
      suppressSizeToFit: true,
      flex: 1
    },
    {
      field: 'location_pincode',
      headerName: 'PINCODE',
      width: 100,
      sortable: true,
      cellClass: 'text-muted-foreground',
      suppressSizeToFit: true
    },
    {
      field: 'action',
      headerName: 'ACTION',
      width: 100,
      cellRenderer: ActionCellRenderer,
      sortable: false,
      filter: false,
      cellClass: 'flex items-center justify-center',
      suppressMovable: true,
      suppressSizeToFit: true
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

  const hasData = locations.length > 0;
  const filteredLocations = locations.filter(location => {
    if (!globalFilter) return true;
    const searchLower = globalFilter.toLowerCase();
    return (
      location.primary_name?.toLowerCase().includes(searchLower) ||
      location.location_name?.toLowerCase().includes(searchLower) ||
      location.location_address?.toLowerCase().includes(searchLower) ||
      location.location_pincode?.toLowerCase().includes(searchLower) ||
      location.id.toString().includes(searchLower)
    );
  });

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header Section - Compact */}
      <div className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm mb-4">
        <div className="p-3 border-b border-gray-200 bg-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            {/* Title section - left aligned */}
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-900" />
              <h2 className="text-md font-semibold text-gray-900">Locations</h2>
            </div>

            {/* Controls section - right aligned */}
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              {/* Search bar */}
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                <Input
                  placeholder="Search..."
                  value={globalFilter}
                  onChange={e => handleGlobalFilter(e.target.value)}
                  className="pl-9 h-8 text-sm"
                />
              </div>

              {/* Page size selector */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-600 whitespace-nowrap">Show:</span>
                <Select value={recordCount.toString()} onValueChange={value => setRecordCount(Number(value))}>
                  <SelectTrigger className="w-16 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Refresh button */}
              <Button variant="outline" size="sm" onClick={refreshData} disabled={loading} className="h-8">
                <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
              </Button>
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
          <>
            {/* Desktop view - AG Grid */}
            <div className="hidden md:block">
              <div className="ag-theme-alpine h-[calc(100vh-220px)] w-full rounded-lg overflow-hidden border border-gray-200 shadow-sm">
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
                  paginationPageSize={25}
                  loading={loading}
                  suppressRowHoverHighlight={true} // Disable hover effects
                  suppressCellFocus={true}
                  animateRows={false} // Disable row animations
                  rowBuffer={10}
                  enableCellTextSelection={true}
                  onGridReady={onGridReady}
                  rowHeight={40} // Slightly reduced row height
                  headerHeight={40} // Slightly reduced header height
                  suppressColumnVirtualisation={true}
                  rowSelection="single"
                  suppressRowClickSelection={true}
                  suppressMenuHide={true}
                  onRowClicked={(event) => onLocationClick(event.data.id)}
                />
              </div>
            </div>

            {/* Mobile view - Cards */}
            <div className="block md:hidden">
              <div className="space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto">
                {filteredLocations.map(location => (
                  <LocationCard
                    key={location.id}
                    location={location}
                    onLocationClick={onLocationClick}
                  />
                ))}
              </div>
            </div>
          </>
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