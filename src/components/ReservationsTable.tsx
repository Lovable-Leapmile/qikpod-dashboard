
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

  const ActionCellRenderer = ({
    data,
    isStandard
  }: {
    data: any;
    isStandard: boolean;
  }) => <Button variant="ghost" size="sm" onClick={() => {
    if (isStandard && onStandardReservationClick) {
      onStandardReservationClick(data.id);
    } else if (!isStandard && onAdhocReservationClick) {
      onAdhocReservationClick(data.id);
    }
  }} className="text-gray-800 bg-gray-100">
      <Eye className="h-4 w-4" />
    </Button>;

  const standardColumnDefs: ColDef[] = [{
    headerName: 'ID',
    field: 'id',
    width: 80,
    cellClass: 'vertical-center'
  }, {
    headerName: 'USER NAME',
    field: 'drop_by_name',
    flex: 1,
    cellClass: 'vertical-center'
  }, {
    headerName: 'LOCATION NAME',
    field: 'location_name',
    flex: 1,
    cellClass: 'vertical-center'
  }, {
    headerName: 'CREATED BY',
    field: 'created_by_name',
    flex: 1,
    cellClass: 'vertical-center'
  }, {
    headerName: 'STATUS',
    field: 'status',
    width: 120,
    cellClass: 'vertical-center'
  }, {
    headerName: 'CREATED AT',
    field: 'created_at',
    width: 150,
    cellClass: 'vertical-center'
  }, {
    headerName: 'ACTION',
    width: 100,
    cellRenderer: (params: any) => <ActionCellRenderer data={params.data} isStandard={true} />,
    cellClass: 'vertical-center'
  }];

  const adhocColumnDefs: ColDef[] = [{
    headerName: 'ID',
    field: 'id',
    width: 80,
    cellClass: 'vertical-center'
  }, {
    headerName: 'POD ID',
    field: 'pod_name',
    width: 120,
    cellClass: 'vertical-center'
  }, {
    headerName: 'USER PHONE',
    field: 'user_phone',
    width: 130,
    cellClass: 'vertical-center'
  }, {
    headerName: 'DROP TIME',
    field: 'drop_time',
    flex: 1,
    cellClass: 'vertical-center'
  }, {
    headerName: 'PICKUP TIME',
    field: 'pickup_time',
    flex: 1,
    cellClass: 'vertical-center'
  }, {
    headerName: 'RTO PICKUP TIME',
    field: 'rto_picktime',
    flex: 1,
    cellClass: 'vertical-center'
  }, {
    headerName: 'STATUS',
    field: 'reservation_status',
    width: 120,
    cellClass: 'vertical-center'
  }, {
    headerName: 'ACTION',
    width: 100,
    cellRenderer: (params: any) => <ActionCellRenderer data={params.data} isStandard={false} />,
    cellClass: 'vertical-center'
  }];

  const defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true
  };

  const currentData = isStandardMode ? standardReservations : adhocReservations;
  const hasData = currentData && currentData.length > 0;

  const StandardReservationCard = ({ reservation }: { reservation: StandardReservation }) => (
    <Card className="mb-4 bg-white shadow-sm rounded-xl border-gray-200">
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
            className="text-gray-800 bg-gray-100"
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
            <span className="font-medium text-gray-700">Created At:</span> {reservation.created_at}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const AdhocReservationCard = ({ reservation }: { reservation: AdhocReservation }) => (
    <Card className="mb-4 bg-white shadow-sm rounded-xl border-gray-200">
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
            className="text-gray-800 bg-gray-100"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2">
          <div className="text-sm">
            <span className="font-medium text-gray-700">User Phone:</span> {reservation.user_phone}
          </div>
          <div className="text-sm">
            <span className="font-medium text-gray-700">Drop Time:</span> {reservation.drop_time}
          </div>
          <div className="text-sm">
            <span className="font-medium text-gray-700">Pickup Time:</span> {reservation.pickup_time}
          </div>
          <div className="text-sm">
            <span className="font-medium text-gray-700">RTO Pickup:</span> {reservation.rto_picktime}
          </div>
          <div className="text-sm">
            <span className="font-medium text-gray-700">Status:</span> {reservation.reservation_status}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card className="bg-white shadow-sm rounded-xl border-gray-200">
      <CardHeader className="pb-4 pt-8 px-8">
        <CardTitle className="text-xl font-semibold text-gray-900">
          Reservations
        </CardTitle>
      </CardHeader>
      
      {/* Mode switch moved below header */}
      <div className="px-8 pb-6">
        <div className="flex items-center justify-center space-x-2">
          <span className={`text-sm font-medium ${isStandardMode ? 'text-gray-900' : 'text-gray-500'}`}>
            Standard Mode
          </span>
          <Switch 
            checked={!isStandardMode} 
            onCheckedChange={checked => setIsStandardMode(!checked)} 
            className="data-[state=checked]:bg-accent" 
          />
          <span className={`text-sm font-medium ${!isStandardMode ? 'text-gray-900' : 'text-gray-500'}`}>
            Adhoc Mode
          </span>
        </div>
      </div>

      <CardContent className="pb-8 px-8">
        {hasData ? (
          <>
            {/* Desktop view - AG Grid */}
            <div className="hidden md:block">
              <div className="ag-theme-alpine rounded-xl overflow-hidden border border-gray-200" style={{
                height: '500px',
                width: '100%'
              }}>
                <AgGridReact 
                  rowData={currentData} 
                  columnDefs={isStandardMode ? standardColumnDefs : adhocColumnDefs} 
                  defaultColDef={defaultColDef} 
                  pagination={true} 
                  paginationPageSize={25} 
                  domLayout="normal" 
                  loading={loading} 
                  suppressRowClickSelection={true} 
                  rowSelection="single" 
                  headerHeight={60} 
                  rowHeight={55} 
                />
              </div>
            </div>

            {/* Mobile view - Cards */}
            <div className="block md:hidden">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {isStandardMode ? (
                  standardReservations.map((reservation) => (
                    <StandardReservationCard key={reservation.id} reservation={reservation} />
                  ))
                ) : (
                  adhocReservations.map((reservation) => (
                    <AdhocReservationCard key={reservation.id} reservation={reservation} />
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
      </CardContent>
    </Card>
  );
};

export default ReservationsTable;
