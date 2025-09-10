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
import { ArrowLeft, RefreshCw, Plus, Search, Eye, Filter, Download } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
// Temporarily remove the import until the component is fixed
// import CreatePaymentPopup from '@/components/CreatePaymentPopup';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

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
      const response = await fetch(`https://stagingv3.leapmile.com/payments/payments/?order_by_field=updated_at&order_by_type=DESC&num_records=${pageSize}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });
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
      inactive: 'status-inactive'
    };
    return <span className={cn('status-badge', statusClasses[status as keyof typeof statusClasses] || 'status-inactive')}>
        {status}
      </span>;
  };

  const ActionRenderer = (params: any) => {
    const handleViewDetails = () => {
      const paymentId = params.data.id || params.data.payment_reference_id;
      navigate(`/payments/${paymentId}`);
    };

    return <div className="flex items-center justify-center h-full">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleViewDetails}
          className="h-8 w-8 p-0 transition-colors bg-gray-100 text-gray-600 hover:text-gray-800 hover:bg-[#FDDC4E] hover:text-black"
          title="View Payment Details"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>;
  };

  const AmountRenderer = (params: any) => {
    return <span className="font-semibold text-foreground">
        ₹{parseFloat(params.value).toLocaleString('en-IN', {
        minimumFractionDigits: 2
      })}
      </span>;
  };

  const DateRenderer = (params: any) => {
    const date = new Date(params.value);
    return <div className="text-sm">
        {date.toLocaleDateString('en-IN')} {date.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit'
        })}
      </div>;
  };

  const columnDefs: ColDef[] = [{
    headerName: 'Reservation ID',
    field: 'payment_client_reference_id',
    sortable: true,
    filter: true,
    flex: 3,
    minWidth: 400,
    cellClass: 'font-medium'
  }, {
    headerName: 'User ID',
    field: 'user_id',
    sortable: true,
    filter: true,
    flex: 0.8,
    minWidth: 40,
    cellClass: 'text-muted-foreground'
  }, {
    headerName: 'Amount',
    field: 'payment_amount',
    sortable: true,
    filter: true,
    flex: 0.8,
    minWidth: 40,
    cellRenderer: AmountRenderer
  }, {
    headerName: 'Date & Time',
    field: 'created_at',
    sortable: true,
    filter: true,
    flex: 1.2,
    minWidth: 50,
    cellRenderer: DateRenderer
  }, {
    headerName: 'Status',
    field: 'payment_status',
    sortable: true,
    filter: true,
    flex: 0.8,
    minWidth: 40,
    cellRenderer: StatusRenderer
  }, {
    headerName: 'Action',
    field: 'action',
    width: 80,
    cellRenderer: ActionRenderer,
    sortable: false,
    filter: false,
    resizable: false,
    cellClass: ['flex', 'items-center', 'justify-center']
  }];

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
      filtered = filtered.filter(row => row.payment_status === statusFilter);
    }
    return filtered;
  }, [rowData, statusFilter]);

  const exportData = () => {
    if (gridRef.current?.api) {
      gridRef.current.api.exportDataAsCsv({
        fileName: `payments-${new Date().toISOString().split('T')[0]}.csv`
      });
    }
  };

  const hasData = rowData.length > 0;

  return (
    <div className="w-full h-full flex flex-col animate-fade-in">
      {/* Back and Create Payment Buttons - Outside the card */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
          size="sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>

        <Button onClick={() => setShowCreatePayment(true)} className="bg-[#FDDC4E] hover:bg-yellow-400 text-black">
          <Plus className="h-4 w-4 mr-2" />
          Create Payment
        </Button>
      </div>

      {/* Header Section - Updated to be more compact like logs page */}
      <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm mb-6">
        {/* Table Title and Controls */}
        <div className="p-4 border-b border-gray-200 bg-gray-100">
          {/* Single line for all controls on desktop */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full lg:w-auto">
              <h2 className="text-lg font-semibold text-gray-900 whitespace-nowrap">Payments</h2>

              {/* Auto Refresh Checkbox */}
              <div className="hidden sm:flex items-center gap-2">
                <Checkbox
                  id="auto-refresh-payments"
                  checked={autoRefresh}
                  onCheckedChange={checked => setAutoRefresh(checked === true)}
                  className="h-4 w-4 data-[state=checked]:bg-[#FDDC4E] data-[state=checked]:text-black border-gray-300"
                />
                <label htmlFor="auto-refresh-payments" className="text-sm text-muted-foreground font-medium whitespace-nowrap">
                  Auto Refresh (2m)
                </label>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={fetchPayments} disabled={loading}>
                  <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
                </Button>

                <Button variant="outline" size="sm" onClick={exportData}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Desktop layout */}
            <div className="hidden lg:flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
              {/* Status Filter */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
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

              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search payments..."
                  value={globalFilter}
                  onChange={e => handleGlobalFilter(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>

              {/* Page Size Selector */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 whitespace-nowrap">Show:</span>
                <Select
                  value={pageSize.toString()}
                  onValueChange={value => setPageSize(Number(value))}
                >
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
                <span className="text-sm text-gray-600 whitespace-nowrap">per page</span>
              </div>
            </div>

            {/* Tablet layout - Filters and pagination in single line */}
            <div className="hidden md:flex lg:hidden w-full">
              <div className="flex items-center justify-between w-full gap-4">
                {/* Status Filter and Search */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Status" />
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

                  <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search payments..."
                      value={globalFilter}
                      onChange={e => handleGlobalFilter(e.target.value)}
                      className="pl-10 w-full"
                    />
                  </div>
                </div>

                {/* Page Size Selector */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 whitespace-nowrap">Show:</span>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={value => setPageSize(Number(value))}
                  >
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
                </div>
              </div>
            </div>

            {/* Mobile layout */}
            <div className="md:hidden w-full space-y-3">
              {/* Search */}
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search payments..."
                  value={globalFilter}
                  onChange={e => handleGlobalFilter(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>

              {/* Status Filter and Page Size in single line */}
              <div className="flex items-center justify-between w-full gap-2">
                {/* Status Filter */}
                <div className="flex items-center gap-2 flex-1">
                  <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full max-w-[140px]">
                      <SelectValue placeholder="Status" />
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
                  <span className="text-sm text-gray-600 whitespace-nowrap">Show:</span>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={value => setPageSize(Number(value))}
                  >
                    <SelectTrigger className="w-16">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Auto Refresh for mobile */}
              <div className="flex sm:hidden items-center gap-2">
                <Checkbox
                  id="auto-refresh-payments-mobile"
                  checked={autoRefresh}
                  onCheckedChange={checked => setAutoRefresh(checked === true)}
                  className="h-4 w-4 data-[state=checked]:bg-[#FDDC4E] data-[state=checked]:text-black border-gray-300"
                />
                <label htmlFor="auto-refresh-payments-mobile" className="text-sm text-muted-foreground font-medium whitespace-nowrap">
                  Auto Refresh (2m)
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 w-full">
        {loading ? (
          <div className="flex items-center justify-center h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : hasData ? (
          <>
            {/* Desktop view - AG Grid */}
            <div className="hidden md:block">
              <div className="ag-theme-alpine h-[calc(100vh-200px)] w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                <AgGridReact
                  ref={gridRef}
                  rowData={getFilteredData()}
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
                />
              </div>
            </div>

            {/* Mobile view - Cards */}
            <div className="block md:hidden">
              <div className="space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto">
                {getFilteredData().map((payment) => (
                  <Card key={payment.id} className="bg-white shadow-sm rounded-xl border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="text-lg font-semibold">{payment.payment_client_reference_id}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/payments/${payment.id || payment.payment_reference_id}`)}
                          className="h-8 w-8 p-0 transition-colors bg-gray-100 text-gray-600 hover:text-gray-800 hover:bg-[#FDDC4E] hover:text-black"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {/* User ID and Amount in single line */}
                        <div className="flex justify-between items-center">
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">User ID:</span> {payment.user_id}
                          </div>
                          <div className="text-sm font-semibold">
                            ₹{parseFloat(payment.payment_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </div>
                        </div>

                        {/* Status and Date in single line */}
                        <div className="flex justify-between items-center">
                          <div className="text-sm">
                            <span className={cn('px-2 py-1 rounded-full text-xs font-medium', {
                              'bg-green-100 text-green-800': payment.payment_status === 'paid',
                              'bg-yellow-100 text-yellow-800': payment.payment_status === 'pending',
                              'bg-red-100 text-red-800': payment.payment_status === 'cancelled' || payment.payment_status === 'inactive'
                            })}>
                              {payment.payment_status}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(payment.created_at).toLocaleDateString('en-IN')}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-[200px]">
            <div className="text-gray-500 text-center">
              <p>No payment data available</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Payment Modal */}
      {/* <CreatePaymentPopup isOpen={showCreatePayment} onClose={() => setShowCreatePayment(false)} onSuccess={fetchPayments} /> */}
    </div>
  );
};

export default PaymentsAgGrid;