// Updated LocationsTable.tsx to match ReservationsTable style
import React, { useState, useEffect, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridReadyEvent, GridApi, ModuleRegistry } from 'ag-grid-community';
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

ModuleRegistry.registerModules([AllCommunityModule]);

interface LocationsTableProps {
  onLocationClick: (id: number) => void;
}

const LocationsTable: React.FC<LocationsTableProps> = ({ onLocationClick }) => {
  const { accessToken } = useAuth();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [recordCount, setRecordCount] = useState(25);
  const [searchText, setSearchText] = useState('');
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchData = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const data = await dashboardApi.getLocations(accessToken, recordCount);
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

  const onGridReady = (params: GridReadyEvent) => setGridApi(params.api);

  useEffect(() => {
    if (gridApi) {
      gridApi.setQuickFilter(searchText);
    }
  }, [searchText, gridApi]);

  const ActionCellRenderer = ({ data }: { data: Location }) => (
    <div className="flex justify-center">
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
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'primary_name', headerName: 'Name', flex: 1 },
    { field: 'location_name', headerName: 'Location Name', flex: 1 },
    { field: 'location_address', headerName: 'Address', flex: 1 },
    { field: 'location_pincode', headerName: 'Pincode', flex: 1 },
    {
      field: 'action',
      headerName: 'Action',
      width: 100,
      cellRenderer: ActionCellRenderer,
    },
  ];

  const defaultColDef = {
    resizable: true,
    sortable: true,
    filter: true,
    floatingFilter: false,
  };

  const filteredLocations = locations.filter((location) => {
    if (!searchText) return true;
    const text = searchText.toLowerCase();
    return (
      location.primary_name?.toLowerCase().includes(text) ||
      location.location_name?.toLowerCase().includes(text) ||
      location.location_address?.toLowerCase().includes(text) ||
      location.location_pincode?.toLowerCase().includes(text) ||
      location.id.toString().includes(text)
    );
  });

  const LocationCard = ({ location }: { location: Location }) => (
    <Card className="mb-2 bg-white shadow-sm hover:shadow-md">
      <CardContent className="p-3">
        <div className="flex justify-between mb-2">
          <div>
            <p className="text-sm font-semibold">{location.primary_name}</p>
            <p className="text-xs text-gray-500">{location.location_name}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onLocationClick(location.id)}>
            <Eye className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-xs text-gray-600">
          <p>ID: {location.id}</p>
          <p>Pincode: {location.location_pincode}</p>
          <p>Address: {location.location_address}</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card>
      <CardHeader className="bg-gray-50 py-3 px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Locations
          </CardTitle>
          <div className="flex gap-2 items-center">
            <Input
              placeholder="Search..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="h-8 w-40 text-xs"
            />
            <Select value={recordCount.toString()} onValueChange={(v) => setRecordCount(Number(v))}>
              <SelectTrigger className="h-8 w-24 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 25, 50, 100, 500, 1000].map((val) => (
                  <SelectItem key={val} value={val.toString()}>{val}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        {isMobile ? (
          filteredLocations.length > 0 ? (
            <div className="space-y-2 max-h-[50vh] overflow-y-auto">
              {filteredLocations.map((location) => (
                <LocationCard key={location.id} location={location} />
              ))}
            </div>
          ) : (
            <div className="text-center text-sm text-gray-500 py-6">No locations found</div>
          )
        ) : (
          <div className="ag-theme-alpine rounded overflow-hidden" style={{ height: 350 }}>
            <AgGridReact
              rowData={locations}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              loadingOverlayComponentParams={{ loadingMessage: 'Loading...' }}
              onGridReady={onGridReady}
              animateRows
              suppressRowClickSelection
              rowHeight={36}
              headerHeight={32}
              pagination
              paginationPageSize={10}
              suppressPaginationPanel={false}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LocationsTable;
