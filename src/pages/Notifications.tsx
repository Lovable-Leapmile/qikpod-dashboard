import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridApi } from 'ag-grid-community';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Layout from '@/components/Layout';

interface SMSRecord {
  id: number;
  sms_to_phone_number: string;
  sms_vendor: string;
  sms_delivery_status: string;
  sms_num_retries: number;
}

interface EmailRecord {
  id: number;
  email_to_address: string;
  email_vendor: string;
  email_delivery_status: string;
  email_num_retries: number;
}

const ActionButtonRenderer = ({ data, refresh }: { data: any; refresh: () => void }) => (
  <div className="flex gap-2">
    <Button 
      size="sm" 
      variant="outline" 
      onClick={() => {
        // Retry action
        toast.info(`Retrying ${data.id}`);
        refresh();
      }}
      className="text-xs"
    >
      Retry
    </Button>
    <Button 
      size="sm" 
      variant="ghost" 
      onClick={() => {
        // Details action
        toast.info(`Viewing details for ${data.id}`);
      }}
      className="text-xs"
    >
      Details
    </Button>
  </div>
);

const NotificationsPage: React.FC = () => {
  const { accessToken } = useAuth();
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [smsData, setSmsData] = useState<SMSRecord[]>([]);
  const [emailData, setEmailData] = useState<EmailRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [smsGridApi, setSmsGridApi] = useState<GridApi | null>(null);
  const [emailGridApi, setEmailGridApi] = useState<GridApi | null>(null);
  const [searchText, setSearchText] = useState('');
  
  // Settings state
  const [selectedVendor, setSelectedVendor] = useState('');
  const [enableSMS, setEnableSMS] = useState(true);
  const [enableEmail, setEnableEmail] = useState(true);
  const [blacklist, setBlacklist] = useState('');

  const fetchSMSData = useCallback(async () => {
    if (!accessToken) return;
    
    try {
      const response = await fetch(
        'https://stagingv3.leapmile.com/notifications/notifications/sms/?order_by_field=updated_at&order_by_type=DESC',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setSmsData(data.records || []);
      } else {
        toast.error('Failed to fetch SMS data');
      }
    } catch (error) {
      console.error('SMS fetch error:', error);
      toast.error('Error fetching SMS data');
    }
  }, [accessToken]);

  const fetchEmailData = useCallback(async () => {
    if (!accessToken) return;
    
    try {
      const response = await fetch(
        'https://stagingv3.leapmile.com/notifications/notifications/email/?order_by_field=updated_at&order_by_type=DESC',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setEmailData(data.records || []);
      } else {
        toast.error('Failed to fetch Email data');
      }
    } catch (error) {
      console.error('Email fetch error:', error);
      toast.error('Error fetching Email data');
    }
  }, [accessToken]);

  const refreshData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchSMSData(), fetchEmailData()]);
    setLoading(false);
    toast.success('Data refreshed successfully');
  }, [fetchSMSData, fetchEmailData]);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(refreshData, 2 * 60 * 1000); // 2 minutes
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshData]);

  // Initial data load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Global search functionality
  const onSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchText(value);
    
    if (smsGridApi) {
      smsGridApi.setGridOption('quickFilterText', value);
    }
    if (emailGridApi) {
      emailGridApi.setGridOption('quickFilterText', value);
    }
  };

  const smsColumnDefs: ColDef[] = [
    {
      headerName: 'ID',
      field: 'id',
      width: 80,
      sortable: true,
      filter: true,
    },
    {
      headerName: 'Mobile Number',
      field: 'sms_to_phone_number',
      flex: 1,
      sortable: true,
      filter: true,
    },
    {
      headerName: 'Vendor',
      field: 'sms_vendor',
      flex: 1,
      sortable: true,
      filter: true,
    },
    {
      headerName: 'Status',
      field: 'sms_delivery_status',
      flex: 1,
      sortable: true,
      filter: true,
      cellRenderer: (params: any) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          params.value === 'delivered' ? 'bg-green-100 text-green-800' :
          params.value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {params.value}
        </span>
      ),
    },
    {
      headerName: 'No of Tries',
      field: 'sms_num_retries',
      width: 120,
      sortable: true,
      filter: true,
    },
    {
      headerName: 'Action',
      width: 150,
      cellRenderer: (params: any) => <ActionButtonRenderer data={params.data} refresh={refreshData} />,
      sortable: false,
      filter: false,
    },
  ];

  const emailColumnDefs: ColDef[] = [
    {
      headerName: 'ID',
      field: 'id',
      width: 80,
      sortable: true,
      filter: true,
    },
    {
      headerName: 'Email ID',
      field: 'email_to_address',
      flex: 1,
      sortable: true,
      filter: true,
    },
    {
      headerName: 'Vendor',
      field: 'email_vendor',
      flex: 1,
      sortable: true,
      filter: true,
    },
    {
      headerName: 'Status',
      field: 'email_delivery_status',
      flex: 1,
      sortable: true,
      filter: true,
      cellRenderer: (params: any) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          params.value === 'delivered' ? 'bg-green-100 text-green-800' :
          params.value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {params.value}
        </span>
      ),
    },
    {
      headerName: 'No of Tries',
      field: 'email_num_retries',
      width: 120,
      sortable: true,
      filter: true,
    },
    {
      headerName: 'Action',
      width: 150,
      cellRenderer: (params: any) => <ActionButtonRenderer data={params.data} refresh={refreshData} />,
      sortable: false,
      filter: false,
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

  const handleSendSMS = () => {
    toast.info('Sending SMS...');
  };

  const handleSendEmail = () => {
    toast.info('Sending Email...');
  };

  return (
    <Layout title="Notification Centre" breadcrumb="Notifications">
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="auto-refresh" 
                checked={autoRefresh}
                onCheckedChange={(checked) => setAutoRefresh(checked as boolean)}
              />
              <Label htmlFor="auto-refresh" className="text-sm font-medium">
                Auto Refresh (2 min)
              </Label>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search all tables..."
              value={searchText}
              onChange={onSearchChange}
              className="w-64"
            />
            <Button 
              onClick={refreshData} 
              disabled={loading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button 
              onClick={() => setShowSettings(true)}
              variant="outline"
              size="sm"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* SMS Details Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">SMS Details</h2>
          </div>
           <div className="ag-theme-alpine h-96 border border-gray-200 rounded-xl overflow-hidden" style={{ width: '100%' }}>
             <AgGridReact
               rowData={smsData}
               columnDefs={smsColumnDefs}
               defaultColDef={defaultColDef}
               pagination={true}
               paginationPageSize={25}
               headerHeight={60}
               rowHeight={55}
               suppressCellFocus={true}
               suppressRowClickSelection={true}
               onGridReady={(params) => setSmsGridApi(params.api)}
               suppressMenuHide={true}
               enableRangeSelection={true}
             />
          </div>
        </div>

        {/* Email Details Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Email Details</h2>
          </div>
           <div className="ag-theme-alpine h-96 border border-gray-200 rounded-xl overflow-hidden" style={{ width: '100%' }}>
             <AgGridReact
               rowData={emailData}
               columnDefs={emailColumnDefs}
               defaultColDef={defaultColDef}
               pagination={true}
               paginationPageSize={25}
               headerHeight={60}
               rowHeight={55}
               suppressCellFocus={true}
               suppressRowClickSelection={true}
               onGridReady={(params) => setEmailGridApi(params.api)}
               suppressMenuHide={true}
               enableRangeSelection={true}
             />
          </div>
        </div>

        {/* Settings Modal */}
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Notification Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Vendor List Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="vendor">Vendor List</Label>
                <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="twilio">Twilio</SelectItem>
                    <SelectItem value="sendgrid">SendGrid</SelectItem>
                    <SelectItem value="aws-ses">AWS SES</SelectItem>
                    <SelectItem value="mailgun">Mailgun</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button onClick={handleSendSMS} className="flex-1">
                  Send SMS
                </Button>
                <Button onClick={handleSendEmail} className="flex-1">
                  Send Email
                </Button>
              </div>

              {/* Toggle Switches */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enable-sms">Enable SMS</Label>
                  <Switch
                    id="enable-sms"
                    checked={enableSMS}
                    onCheckedChange={setEnableSMS}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enable-email">Enable Email</Label>
                  <Switch
                    id="enable-email"
                    checked={enableEmail}
                    onCheckedChange={setEnableEmail}
                  />
                </div>
              </div>

              {/* Blacklist */}
              <div className="space-y-2">
                <Label htmlFor="blacklist">Blacklist</Label>
                <Textarea
                  id="blacklist"
                  placeholder="Enter phone numbers or email addresses (one per line)"
                  value={blacklist}
                  onChange={(e) => setBlacklist(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default NotificationsPage;