
import React, { useState, useEffect, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridReadyEvent, GridApi, ModuleRegistry, PaginationChangedEvent } from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Eye } from 'lucide-react';
import { dashboardApi, Location } from '@/services/dashboardApi';
import { useAuth } from '@/contexts/AuthContext';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

interface LocationsTableProps {
  onLocationClick: (id: number) => void;
}

const LocationCard: React.FC<{
  location: Location;
  onLocationClick: (id: number) => void;
}> = ({ location, onLocationClick }) => (
  <Card className="mb-2 bg-white shadow-sm hover:shadow-md transition-shadow rounded-lg">
    <CardContent className="p-3">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 pr-2">
          <h3 className="font-semibold text-sm text-gray-900 mb-1">{location.primary_name}</h3>
          <p className="text-xs text-gray-600">{location.location_name}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onLocationClick(location.id)}
          className="text-[#FDDC4E] hover:text-yellow-600 hover:bg-yellow-50 shrink-0 h-6 w-6 p-0"
        >
          <Eye className="w-3 h-3" />
        </Button>
      </div>
      <div className="space-y-1 text-xs">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <div>
            <span className="font-medium text-gray-700">ID: </span>
            <span className="text-gray-600">{location.id}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Pincode: </span>
            <span className="text-gray-600">{location.location_pincode}</span>
          </div>
        </div>
        <div>
          <span className="font-medium text-gray-700">Address: </span>
          <span className="text-gray-600">{location.location_address}</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

const LocationsTable: React.FC<LocationsTableProps> = ({ onLocationClick }) => {
  const { accessToken } = useAuth();
  const [locations, setLocations] = useState<Location[]>([]);
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

  const ActionCellRenderer = ({ data }: { data: Location }) => (
    <div className="flex justify-center items-center h-full">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onLocationClick(data.id)}
        className="text-gray-800 bg-gray-100"
      >
        <Eye className="w-4 h-4" />
      </Button>
    </div>
  );

  const columnDefs: ColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 100,
      sortable: true,
      cellClass: 'vertical-center',
      filter: 'agTextColumnFilter',
      filterParams: {
        suppressAndOrCondition: true,
        suppressFilterButton: true,
      },
    },
    {
      field: 'primary_name',
      headerName: 'NAME',
      width: 200,
      sortable: true,
      cellClass: 'vertical-center',
      filter: 'agTextColumnFilter',
      filterParams: {
        suppressAndOrCondition: true,
        suppressFilterButton: true,
      },
    },
    {
      field: 'location_name',
      headerName: 'LOCATION NAME',
      width: 250,
      sortable: true,
      cellClass: 'vertical-center',
      filter: 'agTextColumnFilter',
      filterParams: {
        suppressAndOrCondition: true,
        suppressFilterButton: true,
      },
    },
    {
      field: 'location_address',
      headerName: 'ADDRESS',
      flex: 1,
      minWidth: 300,
      sortable: true,
      cellClass: 'vertical-center',
      filter: 'agTextColumnFilter',
      filterParams: {
        suppressAndOrCondition: true,
        suppressFilterButton: true,
      },
    },
    {
      field: 'location_pincode',
      headerName: 'PINCODE',
      width: 150,
      sortable: true,
      cellClass: 'vertical-center',
      filter: 'agTextColumnFilter',
      filterParams: {
        suppressAndOrCondition: true,
        suppressFilterButton: true,
      },
    },
    {
      field: 'action',
      headerName: 'ACTION',
      width: 120,
      cellRenderer: ActionCellRenderer,
      sortable: false,
      filter: false,
      cellClass: 'vertical-center'
    }
  ];

  const fetchData = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      console.log('Fetching locations with token:', accessToken);
      console.log('Record count:', recordCount);
      const data = await dashboardApi.getLocations(accessToken, recordCount);
      console.log('Received locations data:', data);
      setLocations(data);
    } catch (error) {
      console.error('Error fetching locations:', error);
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

  // Filter locations for mobile cards
  const filteredLocations = locations.filter(location => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    return (
      location.primary_name?.toLowerCase().includes(searchLower) ||
      location.location_name?.toLowerCase().includes(searchLower) ||
      location.location_address?.toLowerCase().includes(searchLower) ||
      location.location_pincode?.toLowerCase().includes(searchLower) ||
      location.id.toString().includes(searchLower)
    );
  });

  return (
    <Card className="bg-white shadow-sm rounded-lg">
      <CardHeader className="pb-2 pt-3 px-3 rounded-t-lg bg-gray-50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <CardTitle className="text-sm font-semibold text-gray-900 flex items-center">
            <MapPin className="w-3 h-3 mr-1 text-[#1f2937]" />
            Locations
          </CardTitle>
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <Input
              placeholder="Search..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full md:w-40 rounded text-xs h-7"
            />
            <Select value={recordCount.toString()} onValueChange={(value) => setRecordCount(Number(value))}>
              <SelectTrigger className="w-full md:w-20 rounded text-xs h-7">
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
        </div>
      </CardHeader>
      <CardContent className="p-3">
        {isMobile ? (
          <div className="space-y-2">
            {loading ? (
              <div className="text-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#FDDC4E] mx-auto"></div>
                <p className="text-gray-500 mt-2 text-sm">Loading...</p>
              </div>
            ) : filteredLocations.length > 0 ? (
              <div className="max-h-[50vh] overflow-y-auto">
                {filteredLocations.map(location => (
                  <LocationCard
                    key={location.id}
                    location={location}
                    onLocationClick={onLocationClick}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 text-sm">No locations found</p>
              </div>
            )}
          </div>
        ) : (
          <div 
            className="ag-theme-alpine w-full rounded overflow-hidden" 
            style={{
              height: 320,
            }}
          >
            <AgGridReact
              rowData={locations}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              loading={loading}
              onGridReady={onGridReady}
              animateRows={true}
              suppressCellFocus={true}
              suppressRowClickSelection={true}
              rowHeight={32}
              headerHeight={28}
              pagination={true}
              paginationPageSize={10}
              paginationPageSizeSelector={[8, 15, 25]}
              suppressPaginationPanel={false}
              suppressColumnVirtualisation={true}
              rowClass="cursor-default"
              suppressMenuHide={true}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LocationsTable;
