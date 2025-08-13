import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Settings, Search, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridApi } from 'ag-grid-community';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import NoDataIllustration from '@/components/ui/no-data-illustration';

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

const ActionButtonRenderer = ({ data, refresh }: { data: any; refresh: () => void }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center h-full gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          toast.info(`Retrying ${data.id}`);
          refresh();
        }}
        className="text-xs"
      >
        Retry
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          const type = data.sms_to_phone_number ? 'sms' : 'email';
          navigate(`/notification/${type}/${data.id}`);
        }}
        className="h-8 w-8 p-0 transition-colors bg-gray-100 text-gray-600 hover:text-gray-800"
      >
        <Eye className="h-4 w-4" />
      </Button>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
      status === 'delivered' ? 'bg-green-100 text-green-800' :
      status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
      'bg-red-100 text-red-800'
    }`}>
      {status}
    </span>
  );
};

const MobileNotificationCard = ({
  record,
  type
}: {
  record: SMSRecord | EmailRecord;
  type: 'sms' | 'email'
}) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="bg-white shadow-sm rounded-xl border-gray-200">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">ID: {record.id}</div>
            <div className="text-lg font-semibold mt-1">
              {type === 'sms'
                ? (record as SMSRecord).sms_to_phone_number
                : (record as EmailRecord).email_to_address}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={
              type === 'sms'
                ? (record as SMSRecord).sms_delivery_status
                : (record as EmailRecord).email_delivery_status
            } />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="h-8 w-8 p-0"
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {expanded && (
          <div className="mt-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Vendor:</span>
              <span className="text-sm font-medium">
                {type === 'sms'
                  ? (record as SMSRecord).sms_vendor
                  : (record as EmailRecord).email_vendor}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Tries:</span>
              <span className="text-sm font-medium">
                {type === 'sms'
                  ? (record as SMSRecord).sms_num_retries
                  : (record as EmailRecord).email_num_retries}
              </span>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  toast.info(`Retrying ${record.id}`);
                }}
                className="flex-1"
              >
                Retry
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigate(`/notification/${type}/${record.id}`);
                }}
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

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
  const [activeTab, setActiveTab] = useState<'sms' | 'email'>('sms');
  const [smsCollapsed, setSmsCollapsed] = useState(false);
  const [emailCollapsed, setEmailCollapsed] = useState(false);

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
      cellClass: 'font-medium text-center'
    },
    {
      headerName: 'Mobile Number',
      field: 'sms_to_phone_number',
      flex: 1,
      minWidth: 150,
      sortable: true,
      filter: true,
    },
    {
      headerName: 'Vendor',
      field: 'sms_vendor',
      flex: 1,
      minWidth: 120,
      sortable: true,
      filter: true,
    },
    {
      headerName: 'Status',
      field: 'sms_delivery_status',
      flex: 1,
      minWidth: 120,
      sortable: true,
      filter: true,
      cellRenderer: (params: any) => <StatusBadge status={params.value} />,
    },
    {
      headerName: 'No of Tries',
      field: 'sms_num_retries',
      width: 120,
      sortable: true,
      filter: true,
      cellClass: 'text-center'
    },
    {
      headerName: 'Action',
      width: 150,
      cellRenderer: (params: any) => <ActionButtonRenderer data={params.data} refresh={refreshData} />,
      sortable: false,
      filter: false,
      cellClass: ['flex', 'items-center', 'justify-center']
    },
  ];

  const emailColumnDefs: ColDef[] = [
    {
      headerName: 'ID',
      field: 'id',
      width: 80,
      sortable: true,
      filter: true,
      cellClass: 'font-medium text-center'
    },
    {
      headerName: 'Email ID',
      field: 'email_to_address',
      flex: 1,
      minWidth: 150,
      sortable: true,
      filter: true,
    },
    {
      headerName: 'Vendor',
      field: 'email_vendor',
      flex: 1,
      minWidth: 120,
      sortable: true,
      filter: true,
    },
    {
      headerName: 'Status',
      field: 'email_delivery_status',
      flex: 1,
      minWidth: 120,
      sortable: true,
      filter: true,
      cellRenderer: (params: any) => <StatusBadge status={params.value} />,
    },
    {
      headerName: 'No of Tries',
      field: 'email_num_retries',
      width: 120,
      sortable: true,
      filter: true,
      cellClass: 'text-center'
    },
    {
      headerName: 'Action',
      width: 150,
      cellRenderer: (params: any) => <ActionButtonRenderer data={params.data} refresh={refreshData} />,
      sortable: false,
      filter: false,
      cellClass: ['flex', 'items-center', 'justify-center']
    },
  ];

  const defaultColDef = {
    resizable: true,
    sortable: true,
    filter: true,
    cellClass: 'flex items-center'
  };

  const gridOptions = {
    pagination: true,
    paginationPageSize: 25,
    domLayout: 'autoHeight',
    suppressCellFocus: true,
    suppressRowClickSelection: true,
    rowSelection: 'single' as const,
    suppressMenuHide: true,
    rowHeight: 36,
    headerHeight: 38,
    animateRows: true,
  };

  const handleSendSMS = () => {
    toast.info('Sending SMS...');
  };

  const handleSendEmail = () => {
    toast.info('Sending Email...');
  };

  const hasSMSData = smsData.length > 0;
  const hasEmailData = emailData.length > 0;

  return (
    <Layout title="Notification Centre" breadcrumb="Notifications">
      <div className="w-full h-full flex flex-col animate-fade-in">
        {/* Header Section */}
        <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm mb-6">
          <div className="p-4 border-b border-gray-200 bg-gray-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* Title with Icon */}
              <div className="flex items-center space-x-3">
                <h2 className="text-lg font-semibold text-gray-900">Notification Centre</h2>
              </div>

              {/* Controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px] sm:min-w-[300px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search notifications..."
                    value={searchText}
                    onChange={onSearchChange}
                    className="pl-10"
                  />
                </div>

                {/* Page Size Selector and Buttons */}
                <div className="flex items-center space-x-2">
                  <div className="hidden sm:flex items-center space-x-2">
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
                  </div>
                  <Button
                    onClick={refreshData}
                    disabled={loading}
                    variant="outline"
                    size="sm"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline ml-1">Refresh</span>
                  </Button>
                  <Button
                    onClick={() => setShowSettings(true)}
                    variant="outline"
                    size="sm"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="hidden sm:inline ml-1">Settings</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Mobile Controls */}
            <div className="mt-3 sm:hidden flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="auto-refresh"
                  checked={autoRefresh}
                  onCheckedChange={(checked) => setAutoRefresh(checked as boolean)}
                />
                <Label htmlFor="auto-refresh" className="text-sm text-muted-foreground">
                  Auto Refresh
                </Label>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={activeTab === 'sms' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('sms')}
                >
                  SMS
                </Button>
                <Button
                  variant={activeTab === 'email' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('email')}
                >
                  Email
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 w-full space-y-6">
          {/* Desktop View - Both Tables */}
          <div className="hidden sm:block space-y-6">
            {/* SMS Details Table */}
            <Collapsible open={!smsCollapsed} onOpenChange={setSmsCollapsed}>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                <div className="p-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                  <h2 className="text-base font-semibold text-gray-900">SMS Details</h2>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      {smsCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  <div className="ag-theme-alpine w-full">
                    {hasSMSData ? (
                      <AgGridReact
                        rowData={smsData}
                        columnDefs={smsColumnDefs}
                        defaultColDef={defaultColDef}
                        gridOptions={gridOptions}
                        onGridReady={(params) => setSmsGridApi(params.api)}
                        quickFilterText={searchText}
                      />
                    ) : (
                      <div className="p-8 flex justify-center">
                        <NoDataIllustration
                          title="No SMS notifications"
                          description={loading ? "Loading..." : "No SMS data available."}
                          icon="message-square"
                        />
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Email Details Table */}
            <Collapsible open={!emailCollapsed} onOpenChange={setEmailCollapsed}>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                <div className="p-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                  <h2 className="text-base font-semibold text-gray-900">Email Details</h2>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      {emailCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  <div className="ag-theme-alpine w-full">
                    {hasEmailData ? (
                      <AgGridReact
                        rowData={emailData}
                        columnDefs={emailColumnDefs}
                        defaultColDef={defaultColDef}
                        gridOptions={gridOptions}
                        onGridReady={(params) => setEmailGridApi(params.api)}
                        quickFilterText={searchText}
                      />
                    ) : (
                      <div className="p-8 flex justify-center">
                        <NoDataIllustration
                          title="No Email notifications"
                          description={loading ? "Loading..." : "No Email data available."}
                          icon="mail"
                        />
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          </div>

          {/* Mobile View - Tabbed Interface */}
          <div className="sm:hidden space-y-4">
            {activeTab === 'sms' ? (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold px-2">SMS Notifications</h3>
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : hasSMSData ? (
                  <div className="space-y-3">
                    {smsData.map((record) => (
                      <MobileNotificationCard key={record.id} record={record} type="sms" />
                    ))}
                  </div>
                ) : (
                  <NoDataIllustration
                    title="No SMS notifications"
                    description={loading ? "Loading..." : "No SMS data available."}
                    icon="message-square"
                  />
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold px-2">Email Notifications</h3>
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : hasEmailData ? (
                  <div className="space-y-3">
                    {emailData.map((record) => (
                      <MobileNotificationCard key={record.id} record={record} type="email" />
                    ))}
                  </div>
                ) : (
                  <NoDataIllustration
                    title="No Email notifications"
                    description={loading ? "Loading..." : "No Email data available."}
                    icon="mail"
                  />
                )}
              </div>
            )}
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