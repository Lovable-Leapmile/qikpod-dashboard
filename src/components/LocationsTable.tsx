import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridApi } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import '@/styles/ag-grid.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Eye, RefreshCw, Search } from 'lucide-react';
import { dashboardApi, Location } from '@/services/dashboardApi';
import { useAuth } from '@/contexts/AuthContext';
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
  const [pageSize, setPageSize] = useState(25);
  const [isMobile, setIsMobile] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Mobile detection without external hook
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIfMobile();

    // Add event listener
    window.addEventListener('resize', checkIfMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

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
      cellClass: 'font-medium text-center',
      hide: isMobile,
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
      cellClass: 'text-muted-foreground',
      hide: isMobile,
    },
    {
      field: 'location_address',
      headerName: 'Address',
      sortable: true,
      filter: true,
      flex: 3,
      minWidth: 300,
      cellClass: 'text-muted-foreground',
      tooltipField: 'location_address',
      hide: isMobile,
    },
    {
      field: 'location_pincode',
      headerName: 'Pincode',
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 120,
      cellClass: 'text-muted-foreground text-center',
      hide: isMobile,
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

  const hasData = locations.length > 0;

  return (
    <div className="w-full h-full flex flex-col animate-fade-in sm:px-4 lg:px-6 px-0">
      {/* Header Section */}
      <div className="border border-gray-200 rounded-lg lg:rounded-xl bg-white overflow-hidden shadow-sm mb-4 sm:mb-6">
        <div className="p-3 border-b border-gray-200 bg-gray-100">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full">
            <div className="flex items-center space-x-2">
              <MapPin className="h-3.5 w-3.5 text-gray-900" />
              <h2 className="text-sm font-semibold text-gray-900">Locations</h2>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center space-y-3 md:space-y-0 md:space-x-3 w-full md:w-auto">
              {/* Search */}
              <div className="relative w-full md:min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                <Input
                  placeholder="Search..."
                  value={globalFilter}
                  onChange={(e) => handleGlobalFilter(e.target.value)}
                  className="pl-8 text-xs h-8 w-full"
                />
              </div>

              <div className="flex items-center space-x-3 w-full md:w-auto">
                {/* Page Size Selector */}
                <div className="flex items-center space-x-1">
                  <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
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
                  <span className="text-xs text-gray-600 hidden md:inline">/page</span>
                </div>

                <Button variant="outline" size="sm" onClick={refreshData} className="h-8 px-2 text-xs">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  <span className="hidden md:inline">Refresh</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 w-full">
        {loading ? (
          <div className="flex items-center justify-center h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : hasData ? (
          isMobile ? (
            <div className="space-y-3">
              {locations.map((location) => (
                <div
                  key={location.id}
                  className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => onLocationClick(location.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{location.primary_name}</h3>
                      <p className="text-sm text-muted-foreground">{location.location_name}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onLocationClick(location.id);
                      }}
                      className="h-8 w-8 p-0 transition-colors bg-gray-100 text-gray-600 hover:text-gray-800 hover:bg-[#FDDC4E] hover:text-black"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    <p className="truncate">{location.location_address}</p>
                    <p className="text-right">Pincode: {location.location_pincode}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
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
                rowHeight={36}
                headerHeight={38}
                suppressColumnVirtualisation={true}
                rowSelection="single"
                suppressRowClickSelection={true}
                quickFilterText={globalFilter}
              />
            </div>
          )
        ) : (
          <NoDataIllustration
            title="No locations found"
            description={locations.length === 0 ? 'No locations data available.' : 'No matching locations found.'}
            icon="map-pin"
          />
        )}
      </div>
    </div>
  );
};

export default LocationsTable;