import React, { useState, useEffect, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { ColDef } from 'ag-grid-community';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

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
  const [rowData, setRowData] = useState<PartnerReservation[]>([]);
  const [filteredData, setFilteredData] = useState<PartnerReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const columnDefs: ColDef[] = useMemo(() => [
    {
      headerName: 'TYPE',
      field: 'reservation_type',
      flex: 1,
      minWidth: 120
    }, {
      headerName: 'AWB NO',
      field: 'reservation_awbno',
      flex: 1,
      minWidth: 150
    }, {
      headerName: 'STATUS',
      field: 'reservation_status',
      flex: 1,
      minWidth: 120
    }, {
      headerName: 'CREATED NAME',
      field: 'created_by_name',
      flex: 1,
      minWidth: 150
    }, {
      headerName: 'CREATED PHONE',
      field: 'created_by_phone',
      flex: 1,
      minWidth: 150
    }, {
      headerName: 'DELIVERY NAME',
      field: 'drop_by_name',
      flex: 1,
      minWidth: 150
    }, {
      headerName: 'DELIVERY PHONE',
      field: 'drop_by_phone',
      flex: 1,
      minWidth: 150
    }, {
      headerName: 'PICKUP NAME',
      field: 'pickup_by_name',
      flex: 1,
      minWidth: 150
    }, {
      headerName: 'PICKUP PHONE',
      field: 'pickup_by_phone',
      flex: 1,
      minWidth: 150
    }, {
      headerName: 'PAYMENT MODE',
      field: 'payment_mode',
      flex: 1,
      minWidth: 120
    }, {
      headerName: 'PAYMENT AMOUNT',
      field: 'payment_amount',
      flex: 1,
      minWidth: 140,
      valueFormatter: params => params.value ? `₹${params.value}` : '-'
    }, {
      headerName: 'PAYMENT STATUS',
      field: 'payment_status',
      flex: 1,
      minWidth: 140
    }
  ], []);

  const fetchPartnerReservations = async (reservationType: string = 'FK_Delivery') => {
    try {
      setLoading(true);
      const response = await fetch(`https://stagingv3.leapmile.com/podcore/get_partner_reservation/?reservation_type=${reservationType}`, {
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

  const gridOptions = {
    defaultColDef: {
      sortable: true,
      filter: true,
      resizable: true
    },
    suppressRowClickSelection: true,
    suppressCellSelection: true
  };

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

  return (
    <div className="mx-6 my-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 bg-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <h2 className="text-lg font-semibold text-gray-900">Partner Reservations</h2>
            </div>
            
            <div className="flex items-center gap-3">
              <Button onClick={handleDownloadCSV} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex items-center space-x-4">
            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Select value={selectedFilter} onValueChange={handleFilterChange}>
                <SelectTrigger className="w-[180px]">
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
        
        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <div className="ag-theme-alpine rounded-b-xl overflow-hidden" style={{
            height: '600px',
            width: '100%'
          }}>
            <AgGridReact 
              rowData={filteredData} 
              columnDefs={columnDefs} 
              gridOptions={{...gridOptions, headerHeight: 45, rowHeight: 48, suppressRowClickSelection: true, rowSelection: 'single'}}
              loading={loading} 
              animateRows={true} 
            />
          </div>
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
    </div>
  );
};

export default PartnerReservationsAgGrid;
