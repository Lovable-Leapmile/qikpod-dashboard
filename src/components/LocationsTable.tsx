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
}> = ({
  location,
  onLocationClick
}) => <Card className="mb-3 bg-white shadow-sm hover:shadow-md transition-shadow rounded-xl">
    <CardContent className="p-6">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 pr-3">
          <h3 className="font-semibold text-lg text-gray-900 mb-1">{location.primary_name}</h3>
          <p className="text-sm text-gray-600 mb-2">{location.location_name}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => onLocationClick(location.id)} className="text-[#FDDC4E] hover:text-yellow-600 hover:bg-yellow-50 shrink-0">
          <Eye className="w-4 h-4" />
        </Button>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
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
  </Card>;
const LocationsTable: React.FC<LocationsTableProps> = ({
  onLocationClick
}) => {
  const {
    accessToken
  } = useAuth();
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
  const ActionCellRenderer = ({
    data
  }: {
    data: Location;
  }) => <div className="flex justify-center items-center h-full">
      <Button variant="ghost" size="sm" onClick={() => onLocationClick(data.id)} className="text-[#FDDC4E] hover:text-yellow-600 hover:bg-yellow-50">
        <Eye className="w-4 h-4" />
      </Button>
    </div>;
  const columnDefs: ColDef[] = [{
    field: 'id',
    headerName: 'ID',
    width: 100,
    sortable: true,
    cellClass: 'vertical-center'
  }, {
    field: 'primary_name',
    headerName: 'NAME',
    width: 200,
    sortable: true,
    cellClass: 'vertical-center'
  }, {
    field: 'location_name',
    headerName: 'LOCATION NAME',
    width: 250,
    sortable: true,
    cellClass: 'vertical-center'
  }, {
    field: 'location_address',
    headerName: 'ADDRESS',
    flex: 1,
    minWidth: 300,
    sortable: true,
    cellClass: 'vertical-center'
  }, {
    field: 'location_pincode',
    headerName: 'PINCODE',
    width: 150,
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
    return location.primary_name?.toLowerCase().includes(searchLower) || location.location_name?.toLowerCase().includes(searchLower) || location.location_address?.toLowerCase().includes(searchLower) || location.location_pincode?.toLowerCase().includes(searchLower) || location.id.toString().includes(searchLower);
  });
  return <Card className="bg-white shadow-sm rounded-xl">
      <CardHeader className="pb-6 pt-6 rounded-t-xl bg-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-[#FDDC4E]" />
            Locations
          </CardTitle>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center space-x-2">
              <Input placeholder="Search locations..." value={searchText} onChange={e => setSearchText(e.target.value)} className="w-full md:w-64 rounded-lg" />
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
                <p className="text-gray-500 mt-2">Loading locations...</p>
              </div> : filteredLocations.length > 0 ? <div className="max-h-[70vh] overflow-y-auto px-1">
                {filteredLocations.map(location => <LocationCard key={location.id} location={location} onLocationClick={onLocationClick} />)}
              </div> : <div className="text-center py-8">
                <p className="text-gray-500">No locations found</p>
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
            <AgGridReact rowData={locations} columnDefs={columnDefs} defaultColDef={defaultColDef} loading={loading} onGridReady={onGridReady} animateRows={true} suppressCellFocus={true} suppressRowClickSelection={true} rowHeight={60} headerHeight={50} pagination={true} paginationPageSize={10} paginationPageSizeSelector={[10, 25, 50]} suppressPaginationPanel={false} suppressColumnVirtualisation={true} rowClass="cursor-default" />
          </div>}
      </CardContent>
    </Card>;
};
export default LocationsTable;