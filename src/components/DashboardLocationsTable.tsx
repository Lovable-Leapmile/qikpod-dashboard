import React, { useState, useEffect, useCallback } from 'react';
import { ColDef, GridApi } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { dashboardApi, Location } from '@/services/dashboardApi';

interface DashboardLocationsTableProps {
  onLocationClick: (id: number) => void;
}

const LocationCard: React.FC<{ location: Location; onLocationClick: (id: number) => void }> = ({ 
  location, 
  onLocationClick 
}) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
    <div className="flex justify-between items-start mb-2">
      <div>
        <h3 className="font-semibold text-gray-900">#{location.id}</h3>
        <p className="text-sm text-gray-600">{location.primary_name}</p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onLocationClick(location.id)}
        className="h-8 w-8 p-0"
      >
        <Eye className="h-4 w-4" />
      </Button>
    </div>
    <div className="space-y-1">
      <p className="text-sm text-gray-700">
        <span className="font-medium">Location:</span> {location.location_name}
      </p>
      <p className="text-sm text-gray-700">
        <span className="font-medium">Address:</span> {location.location_address}
      </p>
    </div>
  </div>
);

const DashboardLocationsTable: React.FC<DashboardLocationsTableProps> = ({ onLocationClick }) => {
  const { accessToken } = useAuth();
  const isMobile = useIsMobile();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [gridApi, setGridApi] = useState<GridApi | null>(null);

  const ActionCellRenderer = ({ data }: { data: Location }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onLocationClick(data.id)}
      className="h-8 w-8 p-0"
    >
      <Eye className="h-4 w-4" />
    </Button>
  );

  const columnDefs: ColDef<Location>[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
      sortable: true,
      filter: true,
    },
    {
      field: 'primary_name',
      headerName: 'Name',
      width: 200,
      sortable: true,
      filter: true,
    },
    {
      field: 'location_name',
      headerName: 'Location Name',
      width: 200,
      sortable: true,
      filter: true,
    },
    {
      field: 'location_address',
      headerName: 'Address',
      width: 300,
      sortable: true,
      filter: true,
    },
    {
      field: 'location_pincode',
      headerName: 'Pincode',
      width: 120,
      sortable: true,
      filter: true,
    },
    {
      headerName: 'Action',
      width: 100,
      cellRenderer: ActionCellRenderer,
      sortable: false,
      filter: false,
    },
  ];

  const defaultColDef = {
    resizable: true,
    sortable: true,
    filter: true,
  };

  const fetchData = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const data = await dashboardApi.getLocations(accessToken, 1000);
      setLocations(data);
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onGridReady = (params: any) => {
    setGridApi(params.api);
  };

  useEffect(() => {
    if (gridApi) {
      gridApi.setGridOption('quickFilterText', searchText);
    }
  }, [searchText, gridApi]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center min-h-48">
          <div className="text-lg text-gray-500">Loading locations...</div>
        </div>
      </div>
    );
  }

  if (isMobile) {
    const filteredLocations = locations.filter(location =>
      Object.values(location).some(value =>
        value?.toString().toLowerCase().includes(searchText.toLowerCase())
      )
    );

    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Locations</h3>
            <span className="text-sm text-gray-500">{filteredLocations.length} records</span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search locations..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          {filteredLocations.map((location) => (
            <LocationCard
              key={location.id}
              location={location}
              onLocationClick={onLocationClick}
            />
          ))}
          {filteredLocations.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No locations found</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Locations</h3>
          <span className="text-sm text-gray-500">{locations.length} records</span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search locations..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <div className="ag-theme-alpine" style={{ width: '100%' }}>
  <AgGridReact
    rowData={locations}
    columnDefs={columnDefs}
    defaultColDef={defaultColDef}
    onGridReady={onGridReady}
    pagination={true}
    paginationPageSize={10}
    domLayout="autoHeight"
    getRowHeight={() => 48} // Increased row height for better spacing
  />
</div>
    </div>
  );
};

export default DashboardLocationsTable;