import React, { useState, useMemo, useRef, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridApi } from 'ag-grid-community';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Search, Plus, Eye, Users, RefreshCw } from 'lucide-react';
import { User } from '@/services/dashboardApi';
import AddUserPopup from './AddUserPopup';
import UserCard from './UserCard';
import NoDataIllustration from '@/components/ui/no-data-illustration';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import '@/styles/ag-grid.css';
interface UsersAgGridProps {
  users: User[];
  loading: boolean;
  onBack: () => void;
  onUserClick: (userId: number) => void;
  onRefreshUsers: () => void;
}
const ActionCellRenderer: React.FC<{
  data: User;
  onUserClick: (userId: number) => void;
}> = ({
  data,
  onUserClick
}) => <div className="flex items-center justify-center h-full">
    <Button variant="ghost" size="sm" onClick={e => {
    e.stopPropagation();
    onUserClick(data.id);
  }} className="h-8 w-8 p-0 transition-colors bg-gray-100 text-gray-600 hover:text-gray-800 hover:bg-[#FDDC4E] hover:text-black" title="View User Details">
      <Eye className="h-4 w-4" />
    </Button>
  </div>;
const DateCellRenderer: React.FC<{
  value: string;
}> = ({
  value
}) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };
  return <span>{formatDate(value)}</span>;
};
const UsersAgGrid: React.FC<UsersAgGridProps> = ({
  users,
  loading,
  onBack,
  onUserClick,
  onRefreshUsers
}) => {
  const gridRef = useRef<AgGridReact>(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pageSize, setPageSize] = useState(25);
  const [showAddUserPopup, setShowAddUserPopup] = useState(false);
  const columnDefs: ColDef[] = [{
    field: 'id',
    headerName: 'ID',
    sortable: true,
    filter: true,
    flex: 1,
    minWidth: 100,
    cellClass: 'font-medium text-center'
  }, {
    field: 'user_name',
    headerName: 'Name',
    sortable: true,
    filter: true,
    flex: 2,
    minWidth: 180,
    cellClass: 'font-medium'
  }, {
    field: 'user_type',
    headerName: 'Type',
    sortable: true,
    filter: true,
    flex: 1,
    minWidth: 120,
    cellClass: 'text-muted-foreground'
  }, {
    field: 'user_phone',
    headerName: 'Phone',
    sortable: true,
    filter: true,
    flex: 1.5,
    minWidth: 150,
    cellClass: 'text-muted-foreground'
  }, {
    field: 'user_email',
    headerName: 'Email',
    sortable: true,
    filter: true,
    flex: 2,
    minWidth: 200,
    cellClass: 'text-muted-foreground',
    tooltipField: 'user_email'
  }, {
    field: 'user_flatno',
    headerName: 'Flat No',
    sortable: true,
    filter: true,
    flex: 1,
    minWidth: 100,
    cellClass: 'text-muted-foreground text-center'
  }, {
    headerName: 'Action',
    field: 'action',
    width: 80,
    cellRenderer: (params: any) => <ActionCellRenderer data={params.data} onUserClick={onUserClick} />,
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
  const refreshData = useCallback(() => {
    onRefreshUsers();
  }, [onRefreshUsers]);
  const handleAddUserSuccess = () => {
    onRefreshUsers();
    setShowAddUserPopup(false);
  };
  const hasData = users.length > 0;

  // Filter users based on search query for mobile view
  const filteredUsers = useMemo(() => {
    if (!globalFilter) return users;
    const searchTerm = globalFilter.toLowerCase();
    return users.filter(user => user.user_name?.toLowerCase().includes(searchTerm) || user.user_type?.toLowerCase().includes(searchTerm) || user.user_phone?.toLowerCase().includes(searchTerm) || user.user_email?.toLowerCase().includes(searchTerm) || user.user_flatno?.toLowerCase().includes(searchTerm) || user.id?.toString().includes(searchTerm));
  }, [users, globalFilter]);
  return <div className="w-full h-full flex flex-col animate-fade-in px-4">
      {/* Top Navigation Row */}
      <div className="flex flex-row items-center justify-between gap-4 w-full mb-4 sm:mb-6">
        

        <Button onClick={() => setShowAddUserPopup(true)} className="bg-[#FDDC4E] hover:bg-yellow-400 text-black flex items-center space-x-2 h-9 px-3">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add User</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {/* Users Card Section - Compact */}
      <div className="border border-gray-200 rounded-lg lg:rounded-xl bg-white overflow-hidden shadow-sm mb-4 sm:mb-6">
        <div className="p-3 border-b border-gray-200 bg-gray-100 py-[12px]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
            <div className="flex items-center space-x-2">
              <Users className="h-3.5 w-3.5 text-gray-900" />
              <h2 className="text-sm font-semibold text-gray-900">Users</h2>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
              {/* Search */}
              <div className="relative w-full sm:min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                <Input placeholder="Search..." value={globalFilter} onChange={e => handleGlobalFilter(e.target.value)} className="pl-10 text-xs h-8 w-full px-[32px]" />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                {/* Page Size Selector - Hidden on mobile */}
                <div className="hidden sm:flex items-center space-x-1">
                  <Select value={pageSize.toString()} onValueChange={value => setPageSize(Number(value))}>
                    <SelectTrigger className="w-16 text-xs h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-xs text-gray-600">/page</span>
                </div>

                <Button variant="outline" size="sm" onClick={refreshData} className="h-8 px-2 text-xs">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Refresh</span>
                  <span className="sm:hidden">Refresh</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 w-full">
        {loading ? <div className="flex items-center justify-center h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div> : hasData ? <>
            {/* Desktop view - AG Grid */}
            <div className="hidden md:block">
              <div className="ag-theme-alpine h-[calc(100vh-200px)] sm:h-[calc(100vh-280px)] w-full rounded-lg lg:rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                <AgGridReact ref={gridRef} rowData={users} columnDefs={columnDefs} defaultColDef={{
              resizable: true,
              sortable: true,
              filter: true,
              cellClass: 'flex items-center'
            }} pagination={true} paginationPageSize={pageSize} loading={loading} suppressRowHoverHighlight={false} suppressCellFocus={true} animateRows={true} rowBuffer={10} enableCellTextSelection={true} onGridReady={onGridReady} rowHeight={36} headerHeight={38} suppressColumnVirtualisation={true} rowSelection="single" suppressRowClickSelection={true} quickFilterText={globalFilter} />
              </div>
            </div>

            {/* Mobile view - Cards */}
            <div className="block md:hidden">
              <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pb-4">
                {filteredUsers.map(user => <Card key={user.id} className="bg-white shadow-sm rounded-lg border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">ID: {user.id}</div>
                          <div className="text-lg font-semibold mt-1">{user.user_name}</div>
                          <div className="text-sm text-muted-foreground mt-1">{user.user_type}</div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={e => {
                    e.stopPropagation();
                    onUserClick(user.id);
                  }} className="h-8 w-8 p-0 transition-colors bg-gray-100 text-gray-600 hover:text-gray-800 hover:bg-[#FDDC4E] hover:text-black">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">Phone:</span> {user.user_phone || 'N/A'}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">Email:</span> {user.user_email || 'N/A'}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">Flat No:</span> {user.user_flatno || 'N/A'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>)}
              </div>
            </div>
          </> : <NoDataIllustration title="No users found" description={users.length === 0 ? "No users data available." : "No matching users found."} icon="inbox" />}
      </div>

      {/* Add User Popup */}
      <AddUserPopup open={showAddUserPopup} onOpenChange={setShowAddUserPopup} onSuccess={handleAddUserSuccess} />
    </div>;
};
export default UsersAgGrid;