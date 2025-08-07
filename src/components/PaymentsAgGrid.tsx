import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridApi } from 'ag-grid-community';
import { useNavigate } from 'react-router-dom';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import '@/styles/ag-grid.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Plus, Search, Eye, Filter, Download, CreditCard } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import CreatePaymentPopup from '@/components/CreatePaymentPopup';
import { cn } from '@/lib/utils';

interface PaymentData {
  id: number;
  payment_reference_id: string;
  user_id: string;
  payment_amount: string;
  created_at: string;
  payment_status: string;
  payment_client_reference_id: string;
  payment_client_awbno: string;
}

const PaymentsAgGrid = () => {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const gridRef = useRef<AgGridReact>(null);
  const [rowData, setRowData] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [showCreatePayment, setShowCreatePayment] = useState(false);
  const [pageSize, setPageSize] = useState(25);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchPayments = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const response = await fetch(
        `https://stagingv3.leapmile.com/payments/payments/?order_by_field=updated_at&order_by_type=DESC&num_records=${pageSize}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setRowData(data.records || []);
      } else {
        console.error('Failed to fetch payments:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  }, [accessToken, pageSize]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(fetchPayments, 2 * 60 * 1000);
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
  }, [autoRefresh, fetchPayments]);

  const StatusRenderer = (params: any) => {
    const status = params.value;
    const statusClasses = {
      paid: 'status-paid',
      pending: 'status-pending',
      cancelled: 'status-cancelled',
      inactive: 'status-inactive',
    };
    return (
      <span
        className={cn(
          'status-badge',
          statusClasses[status as keyof typeof statusClasses] || 'status-inactive'
        )}
      >
        {status}
      </span>
    );
  };

  const ActionRenderer = (params: any) => {
    const handleViewDetails = () => {
      const paymentId = params.data.id || params.data.payment_reference_id;
      navigate(`/payments/${paymentId}`);
    };

    return (
      <div className="flex items-center justify-center h-full">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleViewDetails}
          className="h-8 w-8 p-0 transition-colors bg-gray-100 text-gray-600 hover:text-gray-800 hover:bg-[#FDDC4E] hover:text-black"
          title="View Payment Details"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  const AmountRenderer = (params: any) => {
    return (
      <span className="font-semibold text-foreground">
        ₹{parseFloat(params.value).toLocaleString('en-IN', {
          minimumFractionDigits: 2,
        })}
      </span>
    );
  };

  const DateRenderer = (params: any) => {
    const date = new Date(params.value);
    return (
      <div className="text-sm">
        <div className="font-medium">{date.toLocaleDateString('en-IN')}</div>
        <div className="text-muted-foreground">
          {date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    );
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'Reservation ID',
      field: 'payment_client_reference_id',
      sortable: true,
      filter: true,
      flex: 2,
      minWidth: 200,
      cellClass: 'font-medium',
    },
    {
      headerName: 'User ID',
      field: 'user_id',
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 120,
      cellClass: 'text-muted-foreground',
    },
    {
      headerName: 'Amount',
      field: 'payment_amount',
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 120,
      cellRenderer: AmountRenderer,
    },
    {
      headerName: 'Date & Time',
      field: 'created_at',
      sortable: true,
      filter: true,
      flex: 1.5,
      minWidth: 160,
      cellRenderer: DateRenderer,
    },
    {
      headerName: 'Status',
      field: 'payment_status',
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 120,
      cellRenderer: StatusRenderer,
    },
    {
      headerName: 'Action',
      field: 'action',
      width: 80,
      cellRenderer: ActionRenderer,
      sortable: false,
      filter: false,
      resizable: false,
    },
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

  const getFilteredData = useCallback(() => {
    let filtered = rowData;
    if (statusFilter !== 'all') {
      filtered = filtered.filter((row) => row.payment_status === statusFilter);
    }
    return filtered;
  }, [rowData, statusFilter]);

  const exportData = () => {
    if (gridRef.current?.api) {
      gridRef.current.api.exportDataAsCsv({
        fileName: `payments-${new Date().toISOString().split('T')[0]}.csv`,
      });
    }
  };

  return (
    <div className="w-full h-full flex flex-col animate-fade-in px-2 sm:px-4 lg:px-6 gap-4 pb-8">
      {/* Header Card */}
      <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">Payments</h2>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="auto-refresh"
                  checked={autoRefresh}
                  onCheckedChange={(checked) => setAutoRefresh(checked === true)}
                />
                <label
                  htmlFor="auto-refresh"
                  className="text-xs sm:text-sm text-muted-foreground font-medium"
                >
                  <span className="hidden sm:inline">Auto Refresh (2m)</span>
                  <span className="sm:hidden">Auto (2m)</span>
                </label>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={fetchPayments}
                disabled={loading}
              >
                <RefreshCw
                  className={cn(
                    'h-3 w-3 sm:h-4 sm:w-4',
                    loading && 'animate-spin'
                  )}
                />
                <span className="hidden md:inline ml-1">Refresh</span>
              </Button>

              <Button variant="outline" size="sm" onClick={exportData}>
                <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Export</span>
              </Button>

              <Button
                onClick={() => setShowCreatePayment(true)}
                className="bg-[#FDDC4E] hover:bg-yellow-400 text-black text-xs sm:text-sm"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Create Payment</span>
                <span className="xs:hidden">Create</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="p-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
              <Input
                placeholder="Search payments..."
                value={globalFilter}
                onChange={(e) => handleGlobalFilter(e.target.value)}
                className="pl-8 sm:pl-10 text-sm"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px] text-sm">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Page Size Selector */}
            <div className="flex items-center space-x-2">
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => setPageSize(Number(value))}
              >
                <SelectTrigger className="w-16 sm:w-20 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs sm:text-sm text-gray-600">records</span>
            </div>
          </div>
        </div>
      </div>

      {/* AG Grid Table */}
      <div className="flex-1 w-full min-h-[400px]">
        <div className="ag-theme-alpine h-full w-full rounded-lg overflow-hidden border border-gray-200 shadow-sm">
          <AgGridReact
            ref={gridRef}
            rowData={getFilteredData()}
            columnDefs={columnDefs}
            defaultColDef={{
              resizable: true,
              sortable: true,
              filter: true,
              cellClass: 'flex items-center',
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
            rowHeight={52}
            headerHeight={50}
            suppressColumnVirtualisation={true}
            rowSelection="single"
            suppressRowClickSelection={true}
          />
        </div>
      </div>

      {/* Create Payment Modal */}
      <CreatePaymentPopup
        isOpen={showCreatePayment}
        onClose={() => setShowCreatePayment(false)}
        onSuccess={fetchPayments}
      />
    </div>
  );
};

export default PaymentsAgGrid;