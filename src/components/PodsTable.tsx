
import React, { useState, useEffect, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridReadyEvent } from 'ag-grid-community';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Search, Eye } from 'lucide-react';
import { dashboardApi, Pod } from '@/services/dashboardApi';
import { useAuth } from '@/contexts/AuthContext';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

interface PodsTableProps {
  onPodClick: (id: number) => void;
}

const PodsTable: React.FC<PodsTableProps> = ({ onPodClick }) => {
  const { accessToken } = useAuth();
  const [pods, setPods] = useState<Pod[]>([]);
  const [loading, setLoading] = useState(true);
  const [recordCount, setRecordCount] = useState(25);
  const [searchText, setSearchText] = useState('');

  const ActionCellRenderer = ({ data }: { data: Pod }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onPodClick(data.id)}
      className="text-blue-600 hover:text-blue-800"
    >
      <Eye className="w-4 h-4" />
    </Button>
  );

  const StatusCellRenderer = ({ value }: { value: string }) => (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
      value === 'active' ? 'bg-green-100 text-green-800' : 
      value === 'inactive' ? 'bg-red-100 text-red-800' : 
      'bg-gray-100 text-gray-800'
    }`}>
      {value}
    </span>
  );

  const PowerStatusCellRenderer = ({ value }: { value: string }) => (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
      value === 'ON' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
      {value}
    </span>
  );

  const columnDefs: ColDef[] = [
    { field: 'id', headerName: 'POD ID', width: 100, sortable: true },
    { field: 'pod_name', headerName: 'POD NAME', width: 150, sortable: true },
    { 
      field: 'pod_power_status', 
      headerName: 'POWER STATUS', 
      width: 130, 
      sortable: true,
      cellRenderer: PowerStatusCellRenderer
    },
    { 
      field: 'status', 
      headerName: 'STATUS', 
      width: 120, 
      sortable: true,
      cellRenderer: StatusCellRenderer
    },
    { field: 'pod_health', headerName: 'HEALTH', width: 120, sortable: true },
    { field: 'pod_numtotaldoors', headerName: 'TOTAL DOORS', width: 130, sortable: true },
    { field: 'location_name', headerName: 'LOCATION NAME', width: 200, sortable: true },
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
      const data = await dashboardApi.getPods(accessToken, recordCount);
      setPods(data);
    } catch (error) {
      console.error('Error fetching pods:', error);
    } finally {
      setLoading(false);
    }
  }, [accessToken, recordCount]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onGridReady = (params: GridReadyEvent) => {
    params.api.sizeColumnsToFit();
  };

  const onQuickFilterChanged = () => {
    if (gridRef.current?.api) {
      gridRef.current.api.setQuickFilter(searchText);
    }
  };

  const gridRef = React.useRef<AgGridReact>(null);

  useEffect(() => {
    onQuickFilterChanged();
  }, [searchText]);

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
            <Package className="w-5 h-5 mr-2 text-yellow-500" />
            Pods
          </CardTitle>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search pods..."
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
            ref={gridRef}
            rowData={pods}
            columnDefs={columnDefs}
            loading={loading}
            onGridReady={onGridReady}
            animateRows={true}
            rowSelection="single"
            suppressCellFocus={true}
            enableColResize={true}
            enableSorting={true}
            enableFilter={true}
            rowHeight={50}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PodsTable;
