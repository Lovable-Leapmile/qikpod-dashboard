
import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardApi, StandardReservation, AdhocReservation } from '@/services/dashboardApi';
import { ExternalLink } from 'lucide-react';

interface ReservationsTableProps {
  onStandardReservationClick?: (reservationId: number) => void;
  onAdhocReservationClick?: (reservationId: number) => void;
}

const ReservationsTable: React.FC<ReservationsTableProps> = ({ 
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
      const data = await dashboardApi.getStandardReservations(accessToken);
      setStandardReservations(data);
    } catch (error) {
      console.error('Error fetching standard reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdhocReservations = async () => {
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
  };

  useEffect(() => {
    if (isStandardMode) {
      fetchStandardReservations();
    } else {
      fetchAdhocReservations();
    }
  }, [isStandardMode, accessToken]);

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
      <ExternalLink className="h-4 w-4" />
    </Button>
  );

  const standardColumnDefs: ColDef[] = [
    { 
      headerName: 'ID', 
      field: 'id',
      width: 80,
      cellClass: 'vertical-center'
    },
    { 
      headerName: 'USER NAME', 
      field: 'drop_by_name',
      flex: 1,
      cellClass: 'vertical-center'
    },
    { 
      headerName: 'LOCATION NAME', 
      field: 'location_name',
      flex: 1,
      cellClass: 'vertical-center'
    },
    { 
      headerName: 'CREATED BY', 
      field: 'created_by_name',
      flex: 1,
      cellClass: 'vertical-center'
    },
    { 
      headerName: 'STATUS', 
      field: 'status',
      width: 120,
      cellClass: 'vertical-center'
    },
    { 
      headerName: 'CREATED AT', 
      field: 'created_at',
      width: 150,
      cellClass: 'vertical-center'
    },
    {
      headerName: 'ACTION',
      width: 100,
      cellRenderer: (params: any) => <ActionCellRenderer data={params.data} isStandard={true} />,
      cellClass: 'vertical-center'
    }
  ];

  const adhocColumnDefs: ColDef[] = [
    { 
      headerName: 'ID', 
      field: 'id',
      width: 80,
      cellClass: 'vertical-center'
    },
    { 
      headerName: 'POD ID', 
      field: 'pod_name',
      width: 120,
      cellClass: 'vertical-center'
    },
    { 
      headerName: 'USER PHONE', 
      field: 'user_phone',
      width: 130,
      cellClass: 'vertical-center'
    },
    { 
      headerName: 'DROP TIME', 
      field: 'drop_time',
      flex: 1,
      cellClass: 'vertical-center'
    },
    { 
      headerName: 'PICKUP TIME', 
      field: 'pickup_time',
      flex: 1,
      cellClass: 'vertical-center'
    },
    { 
      headerName: 'RTO PICKUP TIME', 
      field: 'rto_picktime',
      flex: 1,
      cellClass: 'vertical-center'
    },
    { 
      headerName: 'STATUS', 
      field: 'reservation_status',
      width: 120,
      cellClass: 'vertical-center'
    },
    {
      headerName: 'ACTION',
      width: 100,
      cellRenderer: (params: any) => <ActionCellRenderer data={params.data} isStandard={false} />,
      cellClass: 'vertical-center'
    }
  ];

  const defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

  return (
    <Card className="bg-white shadow-sm rounded-xl border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-semibold text-gray-900">
          Reservations
        </CardTitle>
        <div className="flex items-center space-x-2">
          <span className={`text-sm ${isStandardMode ? 'font-medium' : 'text-gray-500'}`}>
            Standard Mode
          </span>
          <Toggle
            pressed={!isStandardMode}
            onPressedChange={(pressed) => setIsStandardMode(!pressed)}
            className="data-[state=on]:bg-blue-600"
          />
          <span className={`text-sm ${!isStandardMode ? 'font-medium' : 'text-gray-500'}`}>
            Adhoc Mode
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="ag-theme-alpine" style={{ height: '500px', width: '100%' }}>
          <AgGridReact
            rowData={isStandardMode ? standardReservations : adhocReservations}
            columnDefs={isStandardMode ? standardColumnDefs : adhocColumnDefs}
            defaultColDef={defaultColDef}
            pagination={true}
            paginationPageSize={25}
            domLayout="normal"
            loading={loading}
            suppressRowClickSelection={true}
            rowSelection="single"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ReservationsTable;
