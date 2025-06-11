
import React, { useState, useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridApi } from 'ag-grid-community';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Search, Plus, Eye, Users, MapPin } from 'lucide-react';
import { User } from '@/services/dashboardApi';
import AddUserPopup from './AddUserPopup';
import UserCard from './UserCard';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

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
}> = ({ data, onUserClick }) => (
  <div className="flex items-center justify-center h-full">
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={() => onUserClick(data.id)} 
      className="h-8 w-8 p-0 transition-colors bg-gray-100 text-gray-800"
    >
      <Eye className="h-4 w-4" />
    </Button>
  </div>
);

const DateCellRenderer: React.FC<{ value: string }> = ({ value }) => {
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
  const [searchText, setSearchText] = useState('');
  const [pageSize, setPageSize] = useState(25);
  const [showAddUserPopup, setShowAddUserPopup] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const columnDefs: ColDef[] = useMemo(() => [
    {
      headerName: 'NAME',
      field: 'user_name',
      sortable: true,
      filter: 'agTextColumnFilter',
      filterParams: {
        suppressAndOrCondition: true,
        suppressFilterButton: true
      },
      flex: 1,
      minWidth: 150,
      cellStyle: { fontWeight: '500' }
    },
    {
      headerName: 'TYPE',
      field: 'user_type',
      sortable: true,
      filter: 'agTextColumnFilter',
      filterParams: {
        suppressAndOrCondition: true,
        suppressFilterButton: true
      },
      flex: 1,
      minWidth: 120
    },
    {
      headerName: 'PHONE',
      field: 'user_phone',
      sortable: true,
      filter: 'agTextColumnFilter',
      filterParams: {
        suppressAndOrCondition: true,
        suppressFilterButton: true
      },
      flex: 1,
      minWidth: 130
    },
    {
      headerName: 'EMAIL',
      field: 'user_email',
      sortable: true,
      filter: 'agTextColumnFilter',
      filterParams: {
        suppressAndOrCondition: true,
        suppressFilterButton: true
      },
      flex: 1.5,
      minWidth: 200
    },
    {
      headerName: 'FLAT NO',
      field: 'user_flatno',
      sortable: true,
      filter: 'agTextColumnFilter',
      filterParams: {
        suppressAndOrCondition: true,
        suppressFilterButton: true
      },
      flex: 0.8,
      minWidth: 100
    },
    {
      headerName: 'CREATED BY',
      field: 'created_at',
      sortable: true,
      filter: 'agDateColumnFilter',
      filterParams: {
        suppressAndOrCondition: true,
        suppressFilterButton: true
      },
      flex: 1,
      minWidth: 130,
      cellRenderer: DateCellRenderer
    },
    {
      headerName: 'ACTION',
      field: 'action',
      sortable: false,
      filter: false,
      width: 80,
      pinned: 'right',
      cellRenderer: (params: any) => <ActionCellRenderer data={params.data} onUserClick={onUserClick} />
    }
  ], [onUserClick]);

  const defaultColDef = useMemo(() => ({
    resizable: true,
    sortable: true,
    filter: true
  }), []);

  const onGridReady = (params: any) => {
    params.api.sizeColumnsToFit();
  };

  const onQuickFilterChanged = () => {
    if (gridRef.current?.api) {
      gridRef.current.api.setGridOption('quickFilterText', searchText);
    }
  };

  React.useEffect(() => {
    onQuickFilterChanged();
  }, [searchText]);

  const handleAddUserSuccess = () => {
    onRefreshUsers();
    setShowAddUserPopup(false);
  };

  // Filter users for mobile cards
  const filteredUsers = users.filter(user => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    return (
      user.user_name?.toLowerCase().includes(searchLower) ||
      user.user_email?.toLowerCase().includes(searchLower) ||
      user.user_phone?.toLowerCase().includes(searchLower) ||
      user.user_type?.toLowerCase().includes(searchLower) ||
      user.user_flatno?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <Button onClick={onBack} variant="outline" className="flex items-center space-x-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Button>
        
        <div className="flex items-center justify-center min-h-96">
          <div className="text-lg text-gray-500">Loading users...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button onClick={onBack} variant="outline" className="flex items-center space-x-2">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </Button>

      {/* Add User Button */}
      <div className="flex justify-end">
        <Button 
          onClick={() => setShowAddUserPopup(true)} 
          className="bg-[#FDDC4E] hover:bg-yellow-400 text-black flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add User</span>
        </Button>
      </div>

      {/* Mobile Cards or Desktop Table Container */}
      {isMobile ? (
        <div className="space-y-3">
          {/* Mobile Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              placeholder="Search users..." 
              value={searchText} 
              onChange={(e) => setSearchText(e.target.value)} 
              className="pl-10" 
            />
          </div>
          
          {filteredUsers.length > 0 ? (
            <div className="max-h-[70vh] overflow-y-auto px-1">
              {filteredUsers.map((user) => (
                <UserCard key={user.id} user={user} onUserClick={onUserClick} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No users found</p>
            </div>
          )}
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
          {/* Table Title and Controls */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Users</h2>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input 
                    placeholder="Search users..." 
                    value={searchText} 
                    onChange={(e) => setSearchText(e.target.value)} 
                    className="pl-10 w-64" 
                  />
                </div>
                
                {/* Page Size Selector */}
                <div className="flex items-center space-x-2">
                  <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
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
                  <span className="text-sm text-gray-600">records</span>
                </div>
              </div>
            </div>
          </div>

          {/* AG Grid Table */}
          <div className="ag-theme-alpine w-full" style={{ height: '600px' }}>
            <AgGridReact
              ref={gridRef}
              rowData={users}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              pagination={true}
              paginationPageSize={pageSize}
              onGridReady={onGridReady}
              suppressMovableColumns={false}
              animateRows={true}
              rowSelection="single"
              suppressRowClickSelection={true}
              headerHeight={50}
              rowHeight={60}
              suppressHorizontalScroll={false}
              domLayout="normal"
              suppressMenuHide={true}
              suppressColumnVirtualisation={true}
            />
          </div>
        </div>
      )}

      {/* Add User Popup */}
      <AddUserPopup 
        open={showAddUserPopup} 
        onOpenChange={setShowAddUserPopup} 
        onSuccess={handleAddUserSuccess} 
      />
    </div>
  );
};

export default UsersAgGrid;
