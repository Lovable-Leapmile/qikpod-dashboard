import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridApi } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import '@/styles/ag-grid.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Plus, Search, MoreVertical, Filter, Download } from 'lucide-react';
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
  const {
    accessToken
  } = useAuth();
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
    return <button className="action-button" onClick={() => console.log('Action clicked', params.data)}>
        <MoreVertical size={16} />
      </button>;
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
        <div className="font-medium">{date.toLocaleDateString('en-IN')}</div>
        <div className="text-muted-foreground">{date.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit'
        })}</div>
      </div>;
  };
  const columnDefs: ColDef[] = [{
    headerName: 'Reservation ID',
    field: 'payment_client_reference_id',
    sortable: true,
    filter: true,
    flex: 2,
    minWidth: 200,
    cellClass: 'font-medium'
  }, {
    headerName: 'User ID',
    field: 'user_id',
    sortable: true,
    filter: true,
    flex: 1,
    minWidth: 120,
    cellClass: 'text-muted-foreground'
  }, {
    headerName: 'Amount',
    field: 'payment_amount',
    sortable: true,
    filter: true,
    flex: 1,
    minWidth: 120,
    cellRenderer: AmountRenderer
  }, {
    headerName: 'Date & Time',
    field: 'created_at',
    sortable: true,
    filter: true,
    flex: 1.5,
    minWidth: 160,
    cellRenderer: DateRenderer
  }, {
    headerName: 'Status',
    field: 'payment_status',
    sortable: true,
    filter: true,
    flex: 1,
    minWidth: 120,
    cellRenderer: StatusRenderer
  }, {
    headerName: 'Action',
    field: 'action',
    width: 80,
    cellRenderer: ActionRenderer,
    sortable: false,
    filter: false,
    resizable: false
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
  return <div className="w-full h-full flex flex-col animate-fade-in">
      {/* Enhanced Header Section */}
      <div className="flex flex-col space-y-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Checkbox id="auto-refresh" checked={autoRefresh} onCheckedChange={checked => setAutoRefresh(checked === true)} />
                <label htmlFor="auto-refresh" className="text-sm text-muted-foreground font-medium">
                  Auto Refresh (2m)
                </label>
              </div>

              <Button variant="outline" size="sm" onClick={fetchPayments} disabled={loading} className="hover:scale-105 transition-transform">
                <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={exportData} className="hover:scale-105 transition-transform">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            
            <Button onClick={() => setShowCreatePayment(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 transition-transform">
              <Plus className="h-4 w-4 mr-2" />
              Create Payment
            </Button>
          </div>
        </div>

        {/* Enhanced Filters Section */}
        <div className="flex flex-col lg:flex-row gap-4 p-6 bg-card rounded-xl border shadow-sm">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search across all columns..." value={globalFilter} onChange={e => handleGlobalFilter(e.target.value)} className="pl-10 bg-background border-border focus:border-primary transition-colors" />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] bg-background border-border focus:border-primary">
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

            <Select value={pageSize.toString()} onValueChange={value => setPageSize(Number(value))}>
              <SelectTrigger className="w-[120px] bg-background border-border focus:border-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 rows</SelectItem>
                <SelectItem value="25">25 rows</SelectItem>
                <SelectItem value="50">50 rows</SelectItem>
                <SelectItem value="100">100 rows</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Enhanced AG Grid Table */}
      <div className="flex-1 w-full">
        <div className="ag-theme-alpine h-[calc(100vh-320px)] w-full rounded-xl overflow-hidden shadow-lg">
          <AgGridReact ref={gridRef} rowData={getFilteredData()} columnDefs={columnDefs} defaultColDef={{
          resizable: true,
          sortable: true,
          filter: true,
          cellClass: 'flex items-center'
        }} pagination={true} paginationPageSize={pageSize} loading={loading} suppressRowHoverHighlight={false} suppressCellFocus={true} animateRows={true} rowBuffer={10} enableCellTextSelection={true} onGridReady={onGridReady} rowHeight={52} headerHeight={56} suppressColumnVirtualisation={true} rowSelection="multiple" suppressRowClickSelection={false} />
        </div>
      </div>

      {/* Create Payment Modal */}
      <CreatePaymentPopup isOpen={showCreatePayment} onClose={() => setShowCreatePayment(false)} onSuccess={fetchPayments} />
    </div>;
};
export default PaymentsAgGrid;