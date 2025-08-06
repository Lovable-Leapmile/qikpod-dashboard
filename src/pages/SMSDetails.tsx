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

interface SMSDetailRecord {
  id: number;
  sms_vendor: string;
  sms_to_phone_number: string;
  updated_at: string;
  status: string;
  sms_num_retries: number;
  sms_balance: number;
}

interface SMSAttemptRecord {
  id: number;
  attempt_timestamp: string;
  status: string;
  error_message?: string;
  vendor_response?: string;
}

const SMSDetailsPage: React.FC = () => {
  const { recordId } = useParams<{ recordId: string }>();
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [smsDetailData, setSmsDetailData] = useState<SMSDetailRecord[]>([]);
  const [smsAttemptData, setSmsAttemptData] = useState<SMSAttemptRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailGridApi, setDetailGridApi] = useState<GridApi | null>(null);
  const [attemptGridApi, setAttemptGridApi] = useState<GridApi | null>(null);
  const [searchText, setSearchText] = useState('');

  const fetchSMSDetails = useCallback(async () => {
    if (!accessToken || !recordId) return;
    
    try {
      // Fetch SMS Info details using the provided API URL
      const smsResponse = await fetch(
        `https://stagingv3.leapmile.com/notifications/notifications/sms/?record_id=${recordId}&order_by_field=updated_at&order_by_type=DESC`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
          },
        }
      );
      
      if (smsResponse.ok) {
        const smsData = await smsResponse.json();
        setSmsDetailData(smsData.records || []); // Use records array from API response
      } else {
        toast.error('Failed to fetch SMS details');
      }

      // Fetch SMS Attempts
      const attemptsResponse = await fetch(
        `https://stagingv3.leapmile.com/notifications/notifications/sms/${recordId}/attempts/`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
          },
        }
      );
      
      if (attemptsResponse.ok) {
        const attemptsData = await attemptsResponse.json();
        setSmsAttemptData(attemptsData.records || []);
      } else {
        toast.error('Failed to fetch SMS attempts');
      }
    } catch (error) {
      console.error('SMS details fetch error:', error);
      toast.error('Error fetching SMS details');
    }
  }, [accessToken, recordId]);

  const refreshData = useCallback(async () => {
    setLoading(true);
    await fetchSMSDetails();
    setLoading(false);
    toast.success('Data refreshed successfully');
  }, [fetchSMSDetails]);

  useEffect(() => {
    if (recordId) {
      refreshData();
    }
  }, [refreshData, recordId]);

  const onSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchText(value);
    
    if (detailGridApi) {
      detailGridApi.setGridOption('quickFilterText', value);
    }
    if (attemptGridApi) {
      attemptGridApi.setGridOption('quickFilterText', value);
    }
  };

  const smsDetailColumnDefs: ColDef[] = [
    {
      headerName: 'Vendor Name',
      field: 'sms_vendor',
      flex: 1,
      sortable: true,
      filter: true,
    },
    {
      headerName: 'Mobile No',
      field: 'sms_to_phone_number',
      flex: 1,
      sortable: true,
      filter: true,
    },
    {
      headerName: 'Last Updated',
      field: 'updated_at',
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
      headerName: 'No. of Tries',
      field: 'sms_num_retries',
      width: 120,
      sortable: true,
      filter: true,
    },
    {
      headerName: 'Balance Left',
      field: 'sms_balance',
      width: 120,
      sortable: true,
      filter: true,
    },
  ];

  const smsAttemptColumnDefs: ColDef[] = [
    {
      headerName: 'ID',
      field: 'id',
      width: 80,
      sortable: true,
      filter: true,
    },
    {
      headerName: 'Attempt Timestamp',
      field: 'attempt_timestamp',
      flex: 2,
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
      headerName: 'Error',
      field: 'error_message',
      flex: 2,
      sortable: true,
      filter: true,
      cellRenderer: (params: any) => {
        return params.value || 'No error';
      },
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
    domLayout: 'normal' as const,
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

  return (
    <Layout title="SMS Info" breadcrumb="Notifications › SMS Details">
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => navigate('/notification')}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">SMS Info</h1>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
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
              className="w-full sm:w-auto"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* SMS Info Table - Reduced Height */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <h2 className="text-base font-semibold text-gray-900">SMS Info Table</h2>
          </div>
          <div className="ag-theme-alpine h-64" style={{ width: '100%' }}>
            <AgGridReact
              rowData={smsDetailData}
              columnDefs={smsDetailColumnDefs}
              defaultColDef={defaultColDef}
              gridOptions={{
                ...gridOptions,
                headerHeight: 45,
                rowHeight: 48,
                paginationPageSize: 10,
                domLayout: 'normal' as const,
              }}
              onGridReady={(params) => setDetailGridApi(params.api)}
              suppressMenuHide={true}
              enableRangeSelection={true}
            />
          </div>
        </div>

        {/* SMS Attempts Table - Reduced Height */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <h2 className="text-base font-semibold text-gray-900">SMS Attempts Table</h2>
          </div>
          <div className="ag-theme-alpine h-80" style={{ width: '100%' }}>
            <AgGridReact
              rowData={smsAttemptData}
              columnDefs={smsAttemptColumnDefs}
              defaultColDef={defaultColDef}
              gridOptions={{
                ...gridOptions,
                headerHeight: 45,
                rowHeight: 48,
                paginationPageSize: 15,
                domLayout: 'normal' as const,
              }}
              onGridReady={(params) => setAttemptGridApi(params.api)}
              suppressMenuHide={true}
              enableRangeSelection={true}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SMSDetailsPage;