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
          <div 
            className="ag-theme-alpine rounded-xl overflow-hidden border border-gray-200" 
            style={{ height: '400px', width: '100%' }}
          >
            <AgGridReact
              rowData={currentData}
              columnDefs={isStandardMode ? standardColumnDefs : adhocColumnDefs}
              defaultColDef={defaultColDef}
              pagination={true}
              paginationPageSize={20}
              domLayout="normal"
              loading={loading}
              suppressRowClickSelection={true}
              rowSelection="single"
              suppressMenuHide={true}
              suppressColumnVirtualisation={true}
              headerHeight={60}
              rowHeight={55}
            />
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
