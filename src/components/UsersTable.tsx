
import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridApi } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users as UsersIcon, Plus, Search, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardApi, User } from '@/services/dashboardApi';
import { useToast } from '@/hooks/use-toast';
import AddUserPopup from './AddUserPopup';

interface UsersTableProps {
  onBack: () => void;
}

const UsersTable: React.FC<UsersTableProps> = ({ onBack }) => {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [pageSize, setPageSize] = useState(25);
  const [showAddUserPopup, setShowAddUserPopup] = useState(false);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);

  const columnDefs: ColDef[] = [
    {
      headerName: 'NAME',
      field: 'user_name',
      sortable: true,
      filter: true,
      resizable: true,
      cellClass: 'vertical-center',
      flex: 1,
      minWidth: 150,
    },
    {
      headerName: 'TYPE',
      field: 'user_type',
      sortable: true,
      filter: true,
      resizable: true,
      cellClass: 'vertical-center',
      flex: 1,
      minWidth: 120,
    },
    {
      headerName: 'PHONE',
      field: 'user_phone',
      sortable: true,
      filter: true,
      resizable: true,
      cellClass: 'vertical-center',
      flex: 1,
      minWidth: 140,
    },
    {
      headerName: 'EMAIL',
      field: 'user_email',
      sortable: true,
      filter: true,
      resizable: true,
      cellClass: 'vertical-center',
      flex: 1,
      minWidth: 200,
    },
    {
      headerName: 'FLAT NO',
      field: 'user_flatno',
      sortable: true,
      filter: true,
      resizable: true,
      cellClass: 'vertical-center',
      flex: 1,
      minWidth: 100,
    },
    {
      headerName: 'CREATED BY',
      field: 'created_at',
      sortable: true,
      filter: true,
      resizable: true,
      cellClass: 'vertical-center',
      flex: 1,
      minWidth: 150,
      valueFormatter: (params) => {
        if (params.value) {
          return new Date(params.value).toLocaleDateString();
        }
        return '';
      },
    },
    {
      headerName: 'ACTION',
      field: 'action',
      sortable: false,
      filter: false,
      resizable: false,
      cellClass: 'vertical-center',
      width: 120,
      cellRenderer: (params: any) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleUserClick(params.data.id)}
          className="h-8 text-xs"
        >
          View Details
        </Button>
      ),
    },
  ];

  const fetchUsers = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const userData = await dashboardApi.getUsers(accessToken, 1000);
      setUsers(userData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [accessToken]);

  const handleUserClick = (userId: number) => {
    console.log('Navigate to user detail:', userId);
    // TODO: Implement user detail navigation
  };

  const onGridReady = (params: any) => {
    setGridApi(params.api);
  };

  const onQuickFilterChanged = () => {
    if (gridApi) {
      gridApi.setGridOption('quickFilterText', searchText);
    }
  };

  useEffect(() => {
    onQuickFilterChanged();
  }, [searchText, gridApi]);

  const handleAddUserSuccess = () => {
    fetchUsers();
    setShowAddUserPopup(false);
    toast({
      title: "Success",
      description: "User added successfully",
    });
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        onClick={onBack}
        variant="outline"
        className="flex items-center space-x-2 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </Button>

      {/* Header with title and Add User button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <UsersIcon className="w-6 h-6 text-gray-700" />
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

      {/* Search and page size controls */}
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
      <div className="ag-theme-alpine" style={{ height: '600px', width: '100%' }}>
        <AgGridReact
          columnDefs={columnDefs}
          rowData={users}
          pagination={true}
          paginationPageSize={pageSize}
          suppressHorizontalScroll={false}
          onGridReady={onGridReady}
          loading={loading}
          animateRows={true}
          rowSelection="single"
          suppressRowClickSelection={true}
          defaultColDef={{
            sortable: true,
            resizable: true,
            filter: true,
          }}
        />
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

export default UsersTable;
