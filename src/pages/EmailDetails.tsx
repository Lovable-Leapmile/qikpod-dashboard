import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridApi } from 'ag-grid-community';
import { useAuth } from '@/contexts/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Layout from '@/components/Layout';

interface EmailDetailRecord {
  id: number;
  vendor_name: string;
  email: string;
  notification_id: string;
  app_id: string;
  last_updated: string;
  status: string;
  no_of_tries: number;
  balance_left: number;
}

const EmailDetailsPage: React.FC = () => {
  const { recordId } = useParams<{ recordId: string }>();
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [emailDetailData, setEmailDetailData] = useState<EmailDetailRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailGridApi, setDetailGridApi] = useState<GridApi | null>(null);
  const [searchText, setSearchText] = useState('');

  const fetchEmailDetails = useCallback(async () => {
    if (!accessToken || !recordId) return;
    
    try {
      setLoading(true);
      const response = await fetch(
        `https://stagingv3.leapmile.com/notifications/notifications/email/?record_id=${recordId}&order_by_field=updated_at&order_by_type=DESC`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setEmailDetailData(data.records || []);
      } else {
        toast.error('Failed to fetch Email details');
      }
    } catch (error) {
      console.error('Email details fetch error:', error);
      toast.error('Error fetching Email details');
    } finally {
      setLoading(false);
    }
  }, [accessToken, recordId]);

  const refreshData = useCallback(async () => {
    await fetchEmailDetails();
    toast.success('Data refreshed successfully');
  }, [fetchEmailDetails]);

  useEffect(() => {
    if (recordId) {
      fetchEmailDetails();
    }
  }, [fetchEmailDetails, recordId]);

  const onSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchText(value);

    if (detailGridApi) {
      detailGridApi.setGridOption('quickFilterText', value);
    }
  };

  const emailDetailColumnDefs: ColDef[] = [
    {
      headerName: 'Vendor Name',
      field: 'vendor_name',
      flex: 1,
      sortable: true,
      filter: true,
    },
    {
      headerName: 'E-Mail',
      field: 'email',
      flex: 1,
      sortable: true,
      filter: true,
    },
    {
      headerName: 'Notification ID',
      field: 'notification_id',
      flex: 1,
      sortable: true,
      filter: true,
    },
    {
      headerName: 'App ID',
      field: 'app_id',
      flex: 1,
      sortable: true,
      filter: true,
    },
    {
      headerName: 'Last Updated',
      field: 'last_updated',
      flex: 1,
      sortable: true,
      filter: true,
      cellRenderer: (params: any) => {
        if (params.value) {
          return new Date(params.value).toLocaleString();
        }
        return '';
      },
    },
    {
      headerName: 'Status',
      field: 'status',
      flex: 1,
      sortable: true,
      filter: true,
      cellRenderer: (params: any) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          params.value === 'delivered' || params.value === 'success' ? 'bg-green-100 text-green-800' :
          params.value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {params.value}
        </span>
      ),
    },
    {
      headerName: 'No of Tries',
      field: 'no_of_tries',
      width: 120,
      sortable: true,
      filter: true,
    },
    {
      headerName: 'Balance Left',
      field: 'balance_left',
      width: 120,
      sortable: true,
      filter: true,
    },
  ];

  const defaultColDef = {
    resizable: true,
    sortable: true,
    filter: true,
  };

  const gridOptions = {
    pagination: true,
    paginationPageSize: 25,
    paginationPageSizeSelector: [10, 25, 50],
    domLayout: 'autoHeight' as const,
    rowHeight: 50,
    headerHeight: 50,
    suppressCellFocus: true,
    suppressRowClickSelection: true,
    rowSelection: 'multiple' as const,
    enableColResize: true,
    enableSorting: true,
    enableFilter: true,
    floatingFilter: false,
  };

  // Mobile card view for Email details
  const renderEmailDetailCards = () => {
    return emailDetailData.map((record) => (
      <div key={record.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="text-sm font-medium text-gray-500">Vendor Name</div>
          <div className="text-sm text-gray-900">{record.vendor_name}</div>

          <div className="text-sm font-medium text-gray-500">E-Mail</div>
          <div className="text-sm text-gray-900">{record.email}</div>

          <div className="text-sm font-medium text-gray-500">Notification ID</div>
          <div className="text-sm text-gray-900">{record.notification_id}</div>

          <div className="text-sm font-medium text-gray-500">App ID</div>
          <div className="text-sm text-gray-900">{record.app_id}</div>

          <div className="text-sm font-medium text-gray-500">Last Updated</div>
          <div className="text-sm text-gray-900">{new Date(record.last_updated).toLocaleString()}</div>

          <div className="text-sm font-medium text-gray-500">Status</div>
          <div className="text-sm">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              record.status === 'delivered' || record.status === 'success' ? 'bg-green-100 text-green-800' :
              record.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {record.status}
            </span>
          </div>

          <div className="text-sm font-medium text-gray-500">No of Tries</div>
          <div className="text-sm text-gray-900">{record.no_of_tries}</div>

          <div className="text-sm font-medium text-gray-500">Balance Left</div>
          <div className="text-sm text-gray-900">{record.balance_left}</div>
        </div>
      </div>
    ));
  };

  return (
    <Layout title="E Mail Info" breadcrumb="Notifications › Email Details">
      <div className="space-y-6">
        {/* Back Navigation - Moved outside the header card */}
        <Button
          onClick={() => navigate('/notification')}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm">
          <h1 className="text-xl font-semibold text-gray-900">E Mail Info</h1>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Input
              placeholder="Search all columns..."
              value={searchText}
              onChange={onSearchChange}
              className="w-full sm:w-64"
            />
            <Button
              onClick={refreshData}
              disabled={loading}
              variant="outline"
              size="sm"
              className="h-10 w-10 p-0 flex items-center justify-center"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Email Details Table - Desktop and Mobile Views */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <h2 className="text-base font-semibold text-gray-900">Email Info Table</h2>
          </div>

          {/* Desktop View */}
          <div className="hidden md:block ag-theme-alpine" style={{ width: '100%', height: '400px' }}>
            <AgGridReact
              rowData={emailDetailData}
              columnDefs={emailDetailColumnDefs}
              defaultColDef={defaultColDef}
              gridOptions={{
                ...gridOptions,
                headerHeight: 45,
                rowHeight: 48,
                paginationPageSize: 15,
                domLayout: 'normal',
              }}
              onGridReady={(params) => setDetailGridApi(params.api)}
              suppressMenuHide={true}
              enableRangeSelection={true}
            />
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden p-4">
            {emailDetailData.length > 0 ? (
              renderEmailDetailCards()
            ) : (
              <div className="text-center py-4 text-gray-500">No email details available</div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EmailDetailsPage;