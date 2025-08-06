import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridApi } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import '@/styles/ag-grid.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Search, Eye } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardApi, StandardReservation, AdhocReservation } from '@/services/dashboardApi';
import { cn } from '@/lib/utils';
import NoDataIllustration from '@/components/ui/no-data-illustration';

interface ReservationsTableProps {
  onStandardReservationClick?: (reservationId: number) => void;
  onAdhocReservationClick?: (reservationId: number) => void;
}

const ReservationsTable: React.FC<ReservationsTableProps> = ({
  onStandardReservationClick,
  onAdhocReservationClick
}) => {
  const { accessToken } = useAuth();
  const gridRef = useRef<AgGridReact>(null);
  const [isStandardMode, setIsStandardMode] = useState(true);
  const [standardReservations, setStandardReservations] = useState<StandardReservation[]>([]);
  const [adhocReservations, setAdhocReservations] = useState<AdhocReservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStandardReservations = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const data = await dashboardApi.getStandardReservations(accessToken);
      setStandardReservations(data);
    } catch (error) {
      console.error('Error fetching standard reservations:', error);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  const fetchAdhocReservations = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const data = await dashboardApi.getAdhocReservations(accessToken);
      setAdhocReservations(data);
    } catch (error) {
      console.error('Error fetching adhoc reservations:', error);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (isStandardMode) {
      fetchStandardReservations();
    } else {
      fetchAdhocReservations();
    }
  }, [isStandardMode, accessToken, fetchStandardReservations, fetchAdhocReservations]);

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        if (isStandardMode) {
          fetchStandardReservations();
        } else {
          fetchAdhocReservations();
        }
      }, 2 * 60 * 1000);
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
  }, [autoRefresh, isStandardMode, fetchStandardReservations, fetchAdhocReservations]);

  const ActionCellRenderer = ({ data, isStandard }: { data: any; isStandard: boolean }) => (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={() => {
        if (isStandard && onStandardReservationClick) {
          onStandardReservationClick(data.id);
        } else if (!isStandard && onAdhocReservationClick) {
          onAdhocReservationClick(data.id);
        }
      }} 
      className="text-gray-800 bg-gray-100 hover:bg-gray-200"
    >
      <Eye className="h-4 w-4" />
    </Button>
  );

  const DateRenderer = (params: any) => {
    const date = new Date(params.value);
    return (
      <div className="text-sm">
        <div className="font-medium">{date.toLocaleDateString('en-IN')}</div>
        <div className="text-muted-foreground">
          {date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })}
        </div>
      </div>
    );
  };

  const standardColumnDefs: ColDef[] = [
    {
      headerName: 'ID',
      field: 'id',
      width: 80,
      cellClass: 'font-medium text-center'
    },
    {
      headerName: 'User Name',
      field: 'drop_by_name',
      flex: 1,
      minWidth: 150,
      cellClass: 'font-medium'
    },
    {
      headerName: 'Location',
      field: 'location_name',
      flex: 1,
      minWidth: 150,
      cellClass: 'text-muted-foreground'
    },
    {
      headerName: 'Created By',
      field: 'created_by_name',
      flex: 1,
      minWidth: 150,
      cellClass: 'text-muted-foreground'
    },
    {
      headerName: 'Status',
      field: 'status',
      width: 120,
      cellClass: 'font-medium'
    },
    {
      headerName: 'Created At',
      field: 'created_at',
      width: 160,
      cellRenderer: DateRenderer
    },
    {
      headerName: 'Action',
      width: 100,
      cellRenderer: (params: any) => <ActionCellRenderer data={params.data} isStandard={true} />,
      cellClass: 'flex items-center justify-center'
    }
  ];

  const adhocColumnDefs: ColDef[] = [
    {
      headerName: 'ID',
      field: 'id',
      width: 80,
      cellClass: 'font-medium text-center'
    },
    {
      headerName: 'Pod ID',
      field: 'pod_name',
      width: 120,
      cellClass: 'font-medium'
    },
    {
      headerName: 'User Phone',
      field: 'user_phone',
      width: 130,
      cellClass: 'text-muted-foreground'
    },
    {
      headerName: 'Drop Time',
      field: 'drop_time',
      flex: 1,
      minWidth: 150,
      cellRenderer: DateRenderer
    },
    {
      headerName: 'Pickup Time',
      field: 'pickup_time',
      flex: 1,
      minWidth: 150,
      cellRenderer: DateRenderer
    },
    {
      headerName: 'RTO Pickup',
      field: 'rto_picktime',
      flex: 1,
      minWidth: 150,
      cellRenderer: DateRenderer
    },
    {
      headerName: 'Status',
      field: 'reservation_status',
      width: 120,
      cellClass: 'font-medium'
    },
    {
      headerName: 'Action',
      width: 100,
      cellRenderer: (params: any) => <ActionCellRenderer data={params.data} isStandard={false} />,
      cellClass: 'flex items-center justify-center'
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
    if (isStandardMode) {
      fetchStandardReservations();
    } else {
      fetchAdhocReservations();
    }
  }, [isStandardMode, fetchStandardReservations, fetchAdhocReservations]);

  const currentData = isStandardMode ? standardReservations : adhocReservations;
  const hasData = currentData && currentData.length > 0;

  return (
    <div className="w-full h-full flex flex-col animate-fade-in">
      {/* Header Section */}
      <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm mb-6">
        <div className="p-4 border-b border-gray-200 bg-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <h2 className="text-lg font-semibold text-gray-900">Reservations</h2>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="auto-refresh-reservations" 
                  checked={autoRefresh} 
                  onCheckedChange={checked => setAutoRefresh(checked === true)} 
                />
                <label htmlFor="auto-refresh-reservations" className="text-sm text-muted-foreground font-medium">
                  Auto Refresh (2m)
                </label>
              </div>

              <Button variant="outline" size="sm" onClick={refreshData} disabled={loading}>
                <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Search reservations..." 
                value={globalFilter} 
                onChange={e => handleGlobalFilter(e.target.value)} 
                className="pl-10" 
              />
            </div>
            
            {/* Mode Switch */}
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${isStandardMode ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                Standard
              </span>
              <Switch 
                checked={!isStandardMode} 
                onCheckedChange={checked => setIsStandardMode(!checked)} 
                className="data-[state=checked]:bg-accent" 
              />
              <span className={`text-sm ${!isStandardMode ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                Adhoc
              </span>
            </div>

            {/* Page Size Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Show:</span>
              <Select value="25" onValueChange={() => {}}>
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
              <span className="text-sm text-gray-600">per page</span>
            </div>
          </div>
        </div>
      </div>

      {/* AG Grid Table */}
      <div className="flex-1 w-full">
        {hasData ? (
          <>
            {/* Desktop view - AG Grid */}
            <div className="hidden md:block">
              <div className="ag-theme-alpine h-[calc(100vh-280px)] w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                <AgGridReact 
                  ref={gridRef}
                  rowData={currentData} 
                  columnDefs={isStandardMode ? standardColumnDefs : adhocColumnDefs} 
                  defaultColDef={{
                    resizable: true,
                    sortable: true,
                    filter: true,
                    cellClass: 'flex items-center'
                  }}
                  pagination={true} 
                  paginationPageSize={25} 
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
                />
              </div>
            </div>

            {/* Mobile view - Cards */}
            <div className="block md:hidden">
              <div className="space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto">
                {isStandardMode ? (
                  standardReservations.map((reservation) => (
                    <Card key={reservation.id} className="bg-white shadow-sm rounded-xl border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">ID: {reservation.id}</div>
                            <div className="text-sm text-gray-600 mt-1">{reservation.drop_by_name}</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onStandardReservationClick?.(reservation.id)}
                            className="text-gray-800 bg-gray-100 hover:bg-gray-200"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">Location:</span> {reservation.location_name}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">Created By:</span> {reservation.created_by_name}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">Status:</span> {reservation.status}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">Created At:</span> {new Date(reservation.created_at).toLocaleString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  adhocReservations.map((reservation) => (
                    <Card key={reservation.id} className="bg-white shadow-sm rounded-xl border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">ID: {reservation.id}</div>
                            <div className="text-sm text-gray-600 mt-1">Pod: {reservation.pod_name}</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onAdhocReservationClick?.(reservation.id)}
                            className="text-gray-800 bg-gray-100 hover:bg-gray-200"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">User Phone:</span> {reservation.user_phone}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">Drop Time:</span> {new Date(reservation.drop_time).toLocaleString()}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">Pickup Time:</span> {new Date(reservation.pickup_time).toLocaleString()}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">RTO Pickup:</span> {new Date(reservation.rto_picktime).toLocaleString()}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">Status:</span> {reservation.reservation_status}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </>
        ) : (
          <NoDataIllustration
            title="No reservations found"
            description={`No ${isStandardMode ? 'standard' : 'adhoc'} reservations found.`}
            icon="inbox"
          />
        )}
      </div>
    </div>
  );
};

export default ReservationsTable;