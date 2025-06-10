
import React, { useState, useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridApi } from 'ag-grid-community';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Search, Plus, Eye, Users } from 'lucide-react';
import { User } from '@/services/dashboardApi';
import AddUserPopup from './AddUserPopup';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

interface UsersAgGridProps {
  users: User[];
  loading: boolean;
  onBack: () => void;
  onUserClick: (userId: number) => void;
  onRefreshUsers: () => void;
}

const ActionCellRenderer: React.FC<{ data: User; onUserClick: (userId: number) => void }> = ({ data, onUserClick }) => (
  <div className="flex items-center justify-center h-full">
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onUserClick(data.id)}
      className="h-8 w-8 p-0 hover:bg-[#FDDC4E]/20 hover:text-gray-900 transition-colors"
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
  onRefreshUsers,
}) => {
  const gridRef = useRef<AgGridReact>(null);
  const [searchText, setSearchText] = useState('');
  const [pageSize, setPageSize] = useState(25);
  const [showAddUserPopup, setShowAddUserPopup] = useState(false);

  const columnDefs: ColDef[] = useMemo(() => [
    {
      headerName: 'NAME',
      field: 'user_name',
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 150,
      cellStyle: { fontWeight: '500' }
    },
    {
      headerName: 'TYPE',
      field: 'user_type',
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 120
    },
    {
      headerName: 'PHONE',
      field: 'user_phone',
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 130
    },
    {
      headerName: 'EMAIL',
      field: 'user_email',
      sortable: true,
      filter: true,
      flex: 1.5,
      minWidth: 200
    },
    {
      headerName: 'FLAT NO',
      field: 'user_flatno',
      sortable: true,
      filter: true,
      flex: 0.8,
      minWidth: 100
    },
    {
      headerName: 'CREATED BY',
      field: 'created_at',
      sortable: true,
      filter: true,
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
      cellRenderer: (params: any) => (
        <ActionCellRenderer data={params.data} onUserClick={onUserClick} />
      )
    }
  ], [onUserClick]);

  const defaultColDef = useMemo(() => ({
    resizable: true,
    sortable: true,
    filter: true,
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

  if (loading) {
    return (
      <div className="space-y-6">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex items-center space-x-2"
        >
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
      {/* Sticky Back Button */}
      <Button
        onClick={onBack}
        variant="outline"
        className="flex items-center space-x-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </Button>

      {/* Table Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <Users className="w-6 h-6 text-gray-700" />
          <h2 className="text-2xl font-bold text-gray-900">Users</h2>
        </div>
        <Button
          onClick={() => setShowAddUserPopup(true)}
          className="bg-[#FDDC4E] hover:bg-yellow-400 text-black flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add User</span>
        </Button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search users..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Show:</span>
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
          <span className="text-sm text-gray-600">per page</span>
        </div>
      </div>

      {/* AG Grid Table */}
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
        <div 
          className="ag-theme-alpine" 
          style={{ height: '600px', width: '100%' }}
        >
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
          />
        </div>
      </div>

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
