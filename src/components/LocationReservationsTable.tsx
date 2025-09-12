import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardApi, StandardReservation, AdhocReservation } from '@/services/dashboardApi';
import { Eye } from 'lucide-react';
import NoDataIllustration from '@/components/ui/no-data-illustration';

interface LocationReservationsTableProps {
  locationId: number;
  onStandardReservationClick?: (reservationId: number) => void;
  onAdhocReservationClick?: (reservationId: number) => void;
}

const LocationReservationsTable: React.FC<LocationReservationsTableProps> = ({ 
  locationId,
  onStandardReservationClick,
  onAdhocReservationClick 
}) => {
  const { accessToken } = useAuth();
  const [isStandardMode, setIsStandardMode] = useState(true);
  const [standardReservations, setStandardReservations] = useState<StandardReservation[]>([]);
  const [adhocReservations, setAdhocReservations] = useState<AdhocReservation[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStandardReservations = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const data = await dashboardApi.getLocationStandardReservations(accessToken, locationId);
      setStandardReservations(data);
    } catch (error) {
      console.error('Error fetching location standard reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdhocReservations = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const data = await dashboardApi.getLocationAdhocReservations(accessToken, locationId);
      setAdhocReservations(data);
    } catch (error) {
      console.error('Error fetching location adhoc reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isStandardMode) {
      fetchStandardReservations();
    } else {
      fetchAdhocReservations();
    }
  }, [isStandardMode, accessToken, locationId]);

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
      className="h-8 px-2"
    >
      <Eye className="h-4 w-4" />
    </Button>
  );

  const standardColumnDefs: ColDef[] = [
    { 
      headerName: 'ID', 
      field: 'id',
      width: 80,
      cellClass: 'vertical-center',
      filter: 'agTextColumnFilter',
      filterParams: {
        suppressAndOrCondition: true,
        suppressFilterButton: true,
      },
    },
    { 
      headerName: 'USER NAME', 
      field: 'drop_by_name',
      flex: 1,
      cellClass: 'vertical-center',
      filter: 'agTextColumnFilter',
      filterParams: {
        suppressAndOrCondition: true,
        suppressFilterButton: true,
      },
    },
    { 
      headerName: 'LOCATION NAME', 
      field: 'location_name',
      flex: 1,
      cellClass: 'vertical-center',
      filter: 'agTextColumnFilter',
      filterParams: {
        suppressAndOrCondition: true,
        suppressFilterButton: true,
      },
    },
    { 
      headerName: 'CREATED BY', 
      field: 'created_by_name',
      flex: 1,
      cellClass: 'vertical-center',
      filter: 'agTextColumnFilter',
      filterParams: {
        suppressAndOrCondition: true,
        suppressFilterButton: true,
      },
    },
    { 
      headerName: 'STATUS', 
      field: 'status',
      width: 120,
      cellClass: 'vertical-center',
      filter: 'agTextColumnFilter',
      filterParams: {
        suppressAndOrCondition: true,
        suppressFilterButton: true,
      },
    },
    { 
      headerName: 'CREATED AT', 
      field: 'created_at',
      width: 150,
      cellClass: 'vertical-center',
      filter: 'agDateColumnFilter',
      filterParams: {
        suppressAndOrCondition: true,
        suppressFilterButton: true,
      },
    },
    {
      headerName: 'ACTION',
      width: 100,
      cellRenderer: (params: any) => <ActionCellRenderer data={params.data} isStandard={true} />,
      cellClass: 'vertical-center',
      filter: false,
      sortable: false,
    }
  ];

  const adhocColumnDefs: ColDef[] = [
    { 
      headerName: 'ID', 
      field: 'id',
      width: 80,
      cellClass: 'vertical-center',
      filter: 'agTextColumnFilter',
      filterParams: {
        suppressAndOrCondition: true,
        suppressFilterButton: true,
      },
    },
    { 
      headerName: 'POD ID', 
      field: 'pod_name',
      width: 120,
      cellClass: 'vertical-center',
      filter: 'agTextColumnFilter',
      filterParams: {
        suppressAndOrCondition: true,
        suppressFilterButton: true,
      },
    },
    { 
      headerName: 'USER PHONE', 
      field: 'user_phone',
      width: 130,
      cellClass: 'vertical-center',
      filter: 'agTextColumnFilter',
      filterParams: {
        suppressAndOrCondition: true,
        suppressFilterButton: true,
      },
    },
    { 
      headerName: 'DROP TIME', 
      field: 'drop_time',
      flex: 1,
      cellClass: 'vertical-center',
      filter: 'agDateColumnFilter',
      filterParams: {
        suppressAndOrCondition: true,
        suppressFilterButton: true,
      },
    },
    { 
      headerName: 'PICKUP TIME', 
      field: 'pickup_time',
      flex: 1,
      cellClass: 'vertical-center',
      filter: 'agDateColumnFilter',
      filterParams: {
        suppressAndOrCondition: true,
        suppressFilterButton: true,
      },
    },
    { 
      headerName: 'RTO PICKUP TIME', 
      field: 'rto_picktime',
      flex: 1,
      cellClass: 'vertical-center',
      filter: 'agDateColumnFilter',
      filterParams: {
        suppressAndOrCondition: true,
        suppressFilterButton: true,
      },
    },
    { 
      headerName: 'STATUS', 
      field: 'reservation_status',
      width: 120,
      cellClass: 'vertical-center',
      filter: 'agTextColumnFilter',
      filterParams: {
        suppressAndOrCondition: true,
        suppressFilterButton: true,
      },
    },
    {
      headerName: 'ACTION',
      width: 100,
      cellRenderer: (params: any) => <ActionCellRenderer data={params.data} isStandard={false} />,
      cellClass: 'vertical-center',
      filter: false,
      sortable: false,
    }
  ];

  const defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

  const currentData = isStandardMode ? standardReservations : adhocReservations;
  const hasData = currentData && currentData.length > 0;

  return (
    <Card className="bg-white shadow-sm rounded-xl border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 pt-8 px-8">
        <CardTitle className="text-xl font-semibold text-gray-900">
          Reservations
        </CardTitle>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${isStandardMode ? 'text-gray-900' : 'text-gray-500'}`}>
              Standard
            </span>
            <Switch
              checked={!isStandardMode}
              onCheckedChange={(checked) => setIsStandardMode(!checked)}
              className="data-[state=checked]:bg-accent"
            />
            <span className={`text-sm font-medium ${!isStandardMode ? 'text-gray-900' : 'text-gray-500'}`}>
              Adhoc
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-8 px-8">
        {hasData ? (
          <div className="space-y-4">
            {currentData.map((reservation, index) => (
              <Card key={reservation.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  {isStandardMode ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">ID</span>
                        <p className="text-sm font-medium text-gray-900">{reservation.id}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">User Name</span>
                        <p className="text-sm font-medium text-gray-900">{reservation.drop_by_name || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Location</span>
                        <p className="text-sm font-medium text-gray-900">{reservation.location_name || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Created By</span>
                        <p className="text-sm font-medium text-gray-900">{reservation.created_by_name || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Status</span>
                        <p className="text-sm font-medium text-gray-900">
                          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                            reservation.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                            reservation.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {reservation.status || 'N/A'}
                          </span>
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Created At</span>
                        <p className="text-sm font-medium text-gray-900">{reservation.created_at || 'N/A'}</p>
                      </div>
                      <div className="flex items-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onStandardReservationClick?.(reservation.id)}
                          className="h-8 px-3 text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">ID</span>
                        <p className="text-sm font-medium text-gray-900">{reservation.id}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Pod ID</span>
                        <p className="text-sm font-medium text-gray-900">{reservation.pod_name || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">User Phone</span>
                        <p className="text-sm font-medium text-gray-900">{reservation.user_phone || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Drop Time</span>
                        <p className="text-sm font-medium text-gray-900">{reservation.drop_time || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Pickup Time</span>
                        <p className="text-sm font-medium text-gray-900">{reservation.pickup_time || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">RTO Pickup</span>
                        <p className="text-sm font-medium text-gray-900">{reservation.rto_picktime || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Status</span>
                        <p className="text-sm font-medium text-gray-900">
                          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                            reservation.reservation_status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                            reservation.reservation_status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {reservation.reservation_status || 'N/A'}
                          </span>
                        </p>
                      </div>
                      <div className="flex items-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onAdhocReservationClick?.(reservation.id)}
                          className="h-8 px-3 text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <NoDataIllustration
            title="No reservations found"
            description={`No ${isStandardMode ? 'standard' : 'adhoc'} reservations found for this location.`}
            icon="inbox"
          />
        )}
      </CardContent>
    </Card>
  );
};

export default LocationReservationsTable;
