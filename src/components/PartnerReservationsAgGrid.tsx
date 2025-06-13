import React, { useState, useEffect, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { ColDef } from 'ag-grid-community';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download } from 'lucide-react';
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
  const columnDefs: ColDef[] = useMemo(() => [{
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
  }], []);
  const fetchPartnerReservations = async (reservationType: string = 'FK_Delivery') => {
    try {
      setLoading(true);
      const response = await fetch(`https://robotmanagerv1test.qikpod.com:8989/get_partner_reservation/?reservation_type=${reservationType}`, {
        headers: {
          'accept': 'application/json',
          'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE3NTc1Njg1Mzd9.00FEXZbI7rsMGvJR2R8Z89zd-A69nuQmFYwJvUd7Ttw'
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
    // Check if the JSON list is null or empty
    if (!Array.isArray(jsonDataList) || jsonDataList.length === 0) {
      console.log("JSON list is null or empty.");
      return;
    }

    // Extract headers from the first object
    const headers = Object.keys(jsonDataList[0]);
    let csvData = headers.join(",") + "\n";

    // Loop through the objects and add their values
    jsonDataList.forEach(json => {
      const values = headers.map(header => json[header] !== null && json[header] !== undefined ? json[header].toString() : "");
      csvData += values.join(",") + "\n";
    });

    // Generate a formatted timestamp (yyyyMMdd_HHmmss)
    const now = new Date();
    const pad = (n: number) => n < 10 ? "0" + n : n;
    const formattedDateTime = now.getFullYear().toString() + pad(now.getMonth() + 1) + pad(now.getDate()) + "_" + pad(now.getHours()) + pad(now.getMinutes()) + pad(now.getSeconds());
    const fileName = `QikPod_${formattedDateTime}.csv`;

    // Create a Blob and download the file
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
  return <div className="bg-white rounded-xl shadow-sm border border-gray-200 m-6">
      <div className="p-6 border-b border-gray-200 bg-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Partner Reservations</h2>
          <div className="flex items-center gap-4">
            <Select value={selectedFilter} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-48">
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
            <Button onClick={handleDownloadCSV} className="flex items-center gap-2" variant="outline">
              <Download className="w-4 h-4" />
              Download CSV
            </Button>
          </div>
        </div>
      </div>
      
      <div className="ag-theme-alpine" style={{
      height: '600px',
      width: '100%'
    }}>
        <AgGridReact rowData={filteredData} columnDefs={columnDefs} gridOptions={gridOptions} loading={loading} animateRows={true} headerHeight={50} rowHeight={50} />
      </div>
    </div>;
};
export default PartnerReservationsAgGrid;