
import React, { useState, useEffect, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridReadyEvent, GridApi } from 'ag-grid-community';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Search, Eye } from 'lucide-react';
import { dashboardApi, Location } from '@/services/dashboardApi';
import { useAuth } from '@/contexts/AuthContext';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

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

  const ActionCellRenderer = ({ data }: { data: Location }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onLocationClick(data.id)}
      className="text-blue-600 hover:text-blue-800"
    >
      <Eye className="w-4 h-4" />
    </Button>
  );

  const columnDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', width: 80, sortable: true },
    { field: 'primary_name', headerName: 'NAME', width: 150, sortable: true },
    { field: 'location_name', headerName: 'LOCATION NAME', width: 200, sortable: true },
    { field: 'location_address', headerName: 'ADDRESS', width: 300, sortable: true },
    { field: 'location_pincode', headerName: 'PINCODE', width: 120, sortable: true },
    {
      field: 'action',
      headerName: 'ACTION',
      width: 100,
      cellRenderer: ActionCellRenderer,
      sortable: false,
      filter: false,
    },
  ];

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

  const onGridReady = (params: GridReadyEvent) => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
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
  };

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-yellow-500" />
            Locations
          </CardTitle>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search locations..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-64"
              />
            </div>
            <Select value={recordCount.toString()} onValueChange={(value) => setRecordCount(Number(value))}>
              <SelectTrigger className="w-32">
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
      <CardContent>
        <div className="ag-theme-alpine" style={{ height: 500, width: '100%' }}>
          <AgGridReact
            rowData={locations}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            loading={loading}
            onGridReady={onGridReady}
            animateRows={true}
            rowSelection="single"
            suppressCellFocus={true}
            rowHeight={50}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationsTable;
