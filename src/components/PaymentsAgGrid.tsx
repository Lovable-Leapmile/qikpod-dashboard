import React, { useState, useEffect, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import '@/styles/ag-grid.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RefreshCw, Plus, Search, MoreVertical } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import CreatePaymentPopup from '@/components/CreatePaymentPopup';

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
  const gridRef = useRef<AgGridReact>(null);
  const [rowData, setRowData] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [showCreatePayment, setShowCreatePayment] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchPayments = async () => {
    if (!accessToken) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        'https://stagingv3.leapmile.com/payments/payments/?order_by_field=updated_at&order_by_type=DESC&num_records=50',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
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
  };

  useEffect(() => {
    fetchPayments();
  }, [accessToken]);

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(fetchPayments, 2 * 60 * 1000); // 2 minutes
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
  }, [autoRefresh]);

  const columnDefs = [
    {
      headerName: 'Reservation ID',
      field: 'payment_client_reference_id',
      sortable: true,
      filter: true,
      width: 200,
    },
    {
      headerName: 'User ID',
      field: 'user_id',
      sortable: true,
      filter: true,
      width: 120,
    },
    {
      headerName: 'Amount',
      field: 'payment_amount',
      sortable: true,
      filter: true,
      width: 120,
      valueFormatter: (params: any) => `₹${params.value}`,
    },
    {
      headerName: 'Date and Time',
      field: 'created_at',
      sortable: true,
      filter: true,
      width: 180,
      valueFormatter: (params: any) => {
        return new Date(params.value).toLocaleString();
      },
    },
    {
      headerName: 'Status',
      field: 'payment_status',
      sortable: true,
      filter: true,
      width: 120,
      cellRenderer: (params: any) => {
        const status = params.value;
        const statusClasses = {
          paid: 'bg-green-100 text-green-800',
          pending: 'bg-yellow-100 text-yellow-800',
          cancelled: 'bg-red-100 text-red-800',
          inactive: 'bg-gray-100 text-gray-800',
        };
        
        return `<span class="px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800'}">${status}</span>`;
      },
    },
    {
      headerName: 'Action',
      field: 'action',
      width: 80,
      cellRenderer: () => {
        return '<button class="p-1 hover:bg-gray-100 rounded"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg></button>';
      },
    },
  ];

  const getFilteredData = () => {
    let filtered = rowData;

    if (searchTerm) {
      filtered = filtered.filter(row => 
        row.id.toString().includes(searchTerm) ||
        row.payment_reference_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.user_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(row => row.payment_status === statusFilter);
    }

    return filtered;
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-foreground">Payments Center</h1>
          
          <div className="flex items-center gap-2">
            <Checkbox
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={(checked) => setAutoRefresh(checked === true)}
            />
            <label htmlFor="auto-refresh" className="text-sm text-muted-foreground">
              Auto Refresh
            </label>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchPayments}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <Button onClick={() => setShowCreatePayment(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Payment
        </Button>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* AG Grid Table */}
      <div className="ag-theme-alpine h-[600px] w-full">
        <AgGridReact
          ref={gridRef}
          rowData={getFilteredData()}
          columnDefs={columnDefs}
          defaultColDef={{
            resizable: true,
            sortable: true,
            filter: false,
          }}
          pagination={true}
          paginationPageSize={20}
          loading={loading}
          suppressRowHoverHighlight={false}
          suppressCellFocus={true}
        />
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