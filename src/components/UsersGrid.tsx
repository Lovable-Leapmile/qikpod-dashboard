
import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridApi } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { Button } from '@/components/ui/button';
import { User } from '@/services/dashboardApi';

interface UsersGridProps {
  users: User[];
  loading: boolean;
  searchText: string;
  pageSize: number;
  onUserClick: (userId: number) => void;
}

const UsersGrid: React.FC<UsersGridProps> = ({
  users,
  loading,
  searchText,
  pageSize,
  onUserClick,
}) => {
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
      headerName: 'CREATED DATE',
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
          onClick={() => onUserClick(params.data.id)}
          className="h-8 text-xs"
        >
          View Details
        </Button>
      ),
    },
  ];

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

  return (
    <div className="ag-theme-alpine" style={{ height: '600px', width: '100%' }}>
      <AgGridReact
        columnDefs={columnDefs}
        rowData={users}
        pagination={true}
        paginationPageSize={pageSize}
        paginationPageSizeSelector={[10, 25, 50, 100]}
        suppressHorizontalScroll={false}
        onGridReady={onGridReady}
        loading={loading}
        animateRows={true}
        rowSelection={{ mode: 'singleRow' }}
        suppressRowClickSelection={true}
        quickFilterText={searchText}
        defaultColDef={{
          sortable: true,
          resizable: true,
          filter: true,
        }}
      />
    </div>
  );
};

export default UsersGrid;
