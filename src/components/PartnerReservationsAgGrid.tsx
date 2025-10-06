import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridApi } from 'ag-grid-community';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Download, RefreshCw, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import NoDataIllustration from '@/components/ui/no-data-illustration';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

interface PartnerReservation {
  reservation_type: string;
  reservation_awbno: string;
  reservation_status: string;
  created_by_name: string;
  created_by_phone: string;
  drop_by_name: string;
  drop_by_phone: string;
  pickup_by_name: string;
  pickup_by_phone: string;
  payment_mode: string;
  payment_amount: number | null;
  payment_status: string;
}

const PartnerReservationsAgGrid: React.FC = () => {
  const gridRef = useRef<AgGridReact>(null);
  const [rowData, setRowData] = useState<PartnerReservation[]>([]);
  const [filteredData, setFilteredData] = useState<PartnerReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [globalFilter, setGlobalFilter] = useState('');
  const [pageSize, setPageSize] = useState(25);

  const columnDefs: ColDef[] = useMemo(() => [
    {
      headerName: 'TYPE',
      field: 'reservation_type',
      flex: 1,
      minWidth: 120,
      cellClass: 'font-medium text-center'
    }, {
      headerName: 'AWB NO',
      field: 'reservation_awbno',
      flex: 1,
      minWidth: 150,
      cellClass: 'font-medium'
    }, {
      headerName: 'STATUS',
      field: 'reservation_status',
      flex: 1,
      minWidth: 120,
      cellClass: 'text-muted-foreground'
    }, {
      headerName: 'CREATED NAME',
      field: 'created_by_name',
      flex: 1,
      minWidth: 150,
      cellClass: 'text-muted-foreground'
    }, {
      headerName: 'CREATED PHONE',
      field: 'created_by_phone',
      flex: 1,
      minWidth: 150,
      cellClass: 'text-muted-foreground'
    }, {
      headerName: 'DELIVERY NAME',
      field: 'drop_by_name',
      flex: 1,
      minWidth: 150,
      cellClass: 'text-muted-foreground'
    }, {
      headerName: 'DELIVERY PHONE',
      field: 'drop_by_phone',
      flex: 1,
      minWidth: 150,
      cellClass: 'text-muted-foreground'
    }, {
      headerName: 'PICKUP NAME',
      field: 'pickup_by_name',
      flex: 1,
      minWidth: 150,
      cellClass: 'text-muted-foreground'
    }, {
      headerName: 'PICKUP PHONE',
      field: 'pickup_by_phone',
      flex: 1,
      minWidth: 150,
      cellClass: 'text-muted-foreground'
    }, {
      headerName: 'PAYMENT MODE',
      field: 'payment_mode',
      flex: 1,
      minWidth: 120,
      cellClass: 'text-muted-foreground'
    }, {
      headerName: 'PAYMENT AMOUNT',
      field: 'payment_amount',
      flex: 1,
      minWidth: 140,
      valueFormatter: params => params.value ? `₹${params.value}` : '-',
      cellClass: 'text-muted-foreground'
    }, {
      headerName: 'PAYMENT STATUS',
      field: 'payment_status',
      flex: 1,
      minWidth: 140,
      cellClass: 'text-muted-foreground'
    }
  ], []);

  const fetchPartnerReservations = async (reservationType: string = 'FK_Delivery') => {
    try {
      setLoading(true);
      const response = await fetch(`http://productionv36.qikpod.com:8989/get_partner_reservation/?reservation_type=${reservationType}`, {
        headers: {
          'accept': 'application/json',
          'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhY2wiOiJhZG1pbiIsImV4cCI6MTkwMDczNDA0MH0.pHhmwwEsMIO-5nyxOvw4G2ntQ7-H2A6hyFdQSci8OCY'
        }
      });
      if (response.ok) {
        const data = await response.json();
        const reservations = data.records || [];
        setRowData(reservations);
        setFilteredData(reservations);
      } else {
        console.error('Failed to fetch partner reservations');
        setRowData([]);
        setFilteredData([]);
      }
    } catch (error) {
      console.error('Error fetching partner reservations:', error);
      setRowData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartnerReservations();
  }, []);

  const handleFilterChange = (value: string) => {
    setSelectedFilter(value);
    if (value === 'all') {
      setFilteredData(rowData);
    } else {
      const filtered = rowData.filter(item => item.reservation_status?.toLowerCase().includes(value.toLowerCase()));
      setFilteredData(filtered);
    }
  };

  const downloadCSV = (jsonDataList: PartnerReservation[]) => {
    if (!Array.isArray(jsonDataList) || jsonDataList.length === 0) {
      console.log("JSON list is null or empty.");
      return;
    }
    const headers = Object.keys(jsonDataList[0]);
    let csvData = headers.join(",") + "\n";
    jsonDataList.forEach(json => {
      const values = headers.map(header => json[header] !== null && json[header] !== undefined ? json[header].toString() : "");
      csvData += values.join(",") + "\n";
    });
    const now = new Date();
    const pad = (n: number) => n < 10 ? "0" + n : n;
    const formattedDateTime = now.getFullYear().toString() + pad(now.getMonth() + 1) + pad(now.getDate()) + "_" + pad(now.getHours()) + pad(now.getMinutes()) + pad(now.getSeconds());
    const fileName = `QikPod_${formattedDateTime}.csv`;
    const blob = new Blob([csvData], {
      type: 'text/csv;charset=utf-8;'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadCSV = () => {
    downloadCSV(filteredData);
  };

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
    fetchPartnerReservations();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'droppending':
      case 'pickuppending':
      case 'rtopending':
        return 'text-orange-600 bg-orange-50';
      case 'pickupcompleted':
      case 'rtocompleted':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const hasData = filteredData.length > 0;

  return (
    <div className="w-full h-full flex flex-col animate-fade-in">
      {/* Header Section - Restructured to match Locations table */}
      <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm mb-6">
        <div className="p-4 border-b border-gray-200 bg-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Title */}
            <div className="flex items-center space-x-3">
              <h2 className="text-lg font-semibold text-gray-900">Partner Reservations</h2>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
              {/* Search */}
              <div className="relative w-full sm:flex-1 sm:min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search reservations..."
                  value={globalFilter}
                  onChange={(e) => handleGlobalFilter(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>

              {/* Status Filter and Page Size Selector - Mobile optimized */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <Select value={selectedFilter} onValueChange={handleFilterChange}>
                  <SelectTrigger className="w-full sm:w-[140px] h-9">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Reservations</SelectItem>
                    <SelectItem value="droppending">Drop Pending</SelectItem>
                    <SelectItem value="pickuppending">Pickup Pending</SelectItem>
                    <SelectItem value="rtopending">RTO Pending</SelectItem>
                    <SelectItem value="pickupcompleted">Pickup Completed</SelectItem>
                    <SelectItem value="rtocompleted">RTO Completed</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2">
                  <Select value={pageSize.toString()} onValueChange={value => setPageSize(Number(value))}>
                    <SelectTrigger className="w-full sm:w-16 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex gap-2">
                    <Button onClick={handleDownloadCSV} variant="outline" size="sm" className="h-9 px-2 flex-1 sm:flex-initial">
                      <Download className="h-4 w-4 sm:mr-1" />
                      <span className="hidden sm:inline">Export</span>
                    </Button>

                    <Button variant="outline" size="sm" onClick={refreshData} className="h-9 px-2 flex-1 sm:flex-initial">
                      <RefreshCw className="h-4 w-4 sm:mr-1" />
                      <span className="hidden sm:inline">Refresh</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AG Grid Table */}
      <div className="flex-1 w-full">
        {loading ? (
          <div className="flex items-center justify-center h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : hasData ? (
          <div className="ag-theme-alpine h-[calc(100vh-200px)] w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            <AgGridReact
              ref={gridRef}
              rowData={filteredData}
              columnDefs={columnDefs}
              defaultColDef={{
                resizable: true,
                sortable: true,
                filter: true,
                cellClass: 'flex items-center'
              }}
              pagination={true}
              paginationPageSize={pageSize}
              loading={loading}
              suppressRowHoverHighlight={false}
              suppressCellFocus={true}
              animateRows={true}
              rowBuffer={10}
              enableCellTextSelection={true}
              onGridReady={onGridReady}
              rowHeight={36}
              headerHeight={38}
              suppressColumnVirtualisation={true}
              rowSelection="single"
              suppressRowClickSelection={true}
              quickFilterText={globalFilter}
            />
          </div>
        ) : (
          <NoDataIllustration
            title="No reservations found"
            description={rowData.length === 0 ? "No reservation data available." : "No matching reservations found."}
            icon="inbox"
          />
        )}
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden p-4 space-y-4 max-h-[600px] overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-gray-500">No reservations found</div>
          </div>
        ) : (
          filteredData.map((reservation, index) => (
            <Card key={index} className="rounded-xl border border-gray-200 shadow-sm">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-gray-900">{reservation.reservation_awbno}</div>
                    <div className="text-sm text-gray-600">{reservation.reservation_type}</div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.reservation_status)}`}>
                    {reservation.reservation_status}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Created By</div>
                    <div className="text-sm text-gray-900">{reservation.created_by_name}</div>
                    <div className="text-sm text-gray-600">{reservation.created_by_phone}</div>
                  </div>

                  {reservation.drop_by_name && (
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Delivery</div>
                      <div className="text-sm text-gray-900">{reservation.drop_by_name}</div>
                      <div className="text-sm text-gray-600">{reservation.drop_by_phone}</div>
                    </div>
                  )}

                  {reservation.pickup_by_name && (
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pickup</div>
                      <div className="text-sm text-gray-900">{reservation.pickup_by_name}</div>
                      <div className="text-sm text-gray-600">{reservation.pickup_by_phone}</div>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Payment</div>
                      <div className="text-sm text-gray-900">{reservation.payment_mode}</div>
                      <div className="text-sm text-gray-600">{reservation.payment_status}</div>
                    </div>
                    {reservation.payment_amount && (
                      <div className="text-lg font-semibold text-gray-900">
                        ₹{reservation.payment_amount}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default PartnerReservationsAgGrid;