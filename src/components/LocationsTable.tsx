import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef, GridApi } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "@/styles/ag-grid.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, MapPin, FileSpreadsheet, FileText, Eye, RefreshCw } from "lucide-react";
import { exportTableData, ExportFormat } from "@/lib/tableExport";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { dashboardApi, Location } from "@/services/dashboardApi";
import { useAuth } from "@/contexts/AuthContext";
import NoDataIllustration from "@/components/ui/no-data-illustration";
import ErrorBoundary from "@/components/ErrorBoundary";
import TableFilters, { FilterConfig, FilterState } from "@/components/filters/TableFilters";
import { useTableFilters } from "@/hooks/useTableFilters";
interface LocationsTableProps {
  onLocationClick: (id: number) => void;
  isDashboard?: boolean;
}
const LocationsTable: React.FC<LocationsTableProps> = ({ onLocationClick, isDashboard = false }) => {
  const { accessToken } = useAuth();
  const gridRef = useRef<AgGridReact>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(25);

  // Advanced filtering
  const { filters, setFilters, filteredData, resetFilters } = useTableFilters<Location>(locations, [
    "location_name",
    "location_address",
    "location_pincode",
    "id",
  ]);

  const filterConfig: FilterConfig = {
    searchPlaceholder: "Search by name, address, pincode...",
  };
  const fetchData = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const data = await dashboardApi.getLocations(accessToken, pageSize);
      setLocations(data || []);
    } catch (error) {
      console.error("Error fetching locations:", error);
      setLocations([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken, pageSize]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  const ActionRenderer = ({ data }: { data: Location }) => {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onLocationClick(data.id);
        }}
        className="h-8 w-8 p-0 transition-colors bg-gray-100 text-gray-600 hover:text-gray-800 hover:bg-[#FDDC4E] hover:text-black"
        title="View Location Details"
      >
        <Eye className="h-4 w-4" />
      </Button>
    );
  };
  const columnDefs: ColDef[] = [
    {
      field: "id",
      headerName: "ID",
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 80,
      cellClass: "font-medium text-center",
    },
    {
      field: "location_name",
      headerName: "Location",
      sortable: true,
      filter: true,
      flex: 2,
      minWidth: 150,
      cellClass: "text-muted-foreground",
    },
    {
      field: "location_address",
      headerName: "Address",
      sortable: true,
      filter: true,
      flex: 3,
      minWidth: 200,
      cellClass: "text-muted-foreground",
      tooltipField: "location_address",
    },
    {
      field: "location_pincode",
      headerName: "Pincode",
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 120,
      cellClass: "text-muted-foreground",
    },
    {
      headerName: "Action",
      flex: 1,
      minWidth: 100,
      cellRenderer: ActionRenderer,
      sortable: false,
      filter: false,
      resizable: false,
    },
  ];
  const onGridReady = (params: any) => {
    params.api.sizeColumnsToFit();
  };

  const refreshData = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = (format: ExportFormat) => {
    const exportColumns = columnDefs
      .filter((col) => col.field)
      .map((col) => ({
        field: col.field!,
        headerName: col.headerName!,
      }));

    exportTableData({
      data: filteredData,
      columns: exportColumns,
      filename: "locations",
      format,
    });
  };

  const hasData = filteredData.length > 0;

  return (
    <ErrorBoundary>
      <div className="w-full h-full flex flex-col animate-fade-in px-[4px]">
        {/* Header Section */}
        <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm mb-6">
          <div className="p-4 border-b border-gray-200 bg-gray-100">
            <div className="flex flex-col gap-4">
              {/* Title with Icon */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-700" />
                  <h2 className="text-lg font-semibold text-gray-900">Locations</h2>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-50">
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={refreshData}>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Refresh</span>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Export</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white">
                      <DropdownMenuItem onClick={() => handleExport("csv")}>
                        <FileText className="w-4 h-4 mr-2" />
                        Export as CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport("excel")}>
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Export as Excel
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport("pdf")}>
                        <FileText className="w-4 h-4 mr-2" />
                        Export as PDF
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Filters */}
              <TableFilters config={filterConfig} state={filters} onChange={setFilters} onReset={resetFilters} />
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 w-full">
          {loading ? (
            <div className="flex items-center justify-center h-[200px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : hasData ? (
            <>
              {/* Desktop view - AG Grid */}
              <div className="hidden md:block">
                <div
                  className={`ag-theme-alpine ${isDashboard ? "h-[400px]" : "h-[calc(100vh-220px)]"} w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm`}
                >
                  <AgGridReact
                    ref={gridRef}
                    rowData={filteredData}
                    columnDefs={columnDefs}
                    defaultColDef={{
                      resizable: true,
                      sortable: true,
                      filter: true,
                      cellClass: "flex items-center",
                    }}
                    pagination={true}
                    paginationPageSize={pageSize}
                    loading={loading}
                    suppressRowHoverHighlight={false}
                    suppressCellFocus={true}
                    animateRows={true}
                    rowBuffer={10}
                    enableCellTextSelection={true}
                    onGridReady={onGridReady}
                    rowHeight={36}
                    headerHeight={38}
                    suppressColumnVirtualisation={true}
                    rowSelection="single"
                    suppressRowClickSelection={true}
                  />
                </div>
              </div>

              {/* Mobile view - Cards */}
              <div className="block md:hidden">
                <div className="space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto">
                  {filteredData.map((location) => (
                    <Card key={location.id} className="bg-white shadow-sm rounded-xl border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">ID: {location.id}</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onLocationClick(location.id);
                            }}
                            className="h-8 w-8 p-0 transition-colors bg-gray-100 text-gray-600 hover:text-gray-800 hover:bg-[#FDDC4E] hover:text-black"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">Location:</span> {location.location_name}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">Address:</span> {location.location_address}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">Pincode:</span> {location.location_pincode}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <NoDataIllustration
              title="No locations found"
              description={locations.length === 0 ? "No locations data available." : "No matching locations found."}
              icon="map-pin"
            />
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};
export default LocationsTable;
