import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AgGridReact } from "ag-grid-react";
import { ColDef, GridApi } from "ag-grid-community";
import { useAuth } from "@/contexts/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Layout from "@/components/Layout";

interface EmailDetailRecord {
  id: number;
  email_vendor: string | null;
  email_to_address: string;
  email_reference_id: string | null;
  email_delivery_status: string;
  email_num_retries: number;
  email_max_retries: number;
  updated_at: string;
  created_at: string;
  email_from_address: string;
  email_subject: string;
}

const EmailDetailsPage: React.FC = () => {
  const { recordId } = useParams<{ recordId: string }>();
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [emailDetailData, setEmailDetailData] = useState<EmailDetailRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailGridApi, setDetailGridApi] = useState<GridApi | null>(null);
  const [searchText, setSearchText] = useState("");

  const fetchEmailDetails = useCallback(async () => {
    if (!accessToken || !recordId) return;

    try {
      setLoading(true);
      const response = await fetch(
        `https://productionv36.qikpod.com/notifications/notifications/email/?record_id=${recordId}&order_by_field=updated_at&order_by_type=DESC`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setEmailDetailData(data.records || []);
      } else {
        toast.error("Failed to fetch Email details");
      }
    } catch (error) {
      console.error("Email details fetch error:", error);
      toast.error("Error fetching Email details");
    } finally {
      setLoading(false);
    }
  }, [accessToken, recordId]);

  const refreshData = useCallback(async () => {
    await fetchEmailDetails();
    toast.success("Data refreshed successfully");
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
      detailGridApi.setGridOption("quickFilterText", value);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "-";
      return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    } catch {
      return "-";
    }
  };

  const emailDetailColumnDefs: ColDef[] = [
    {
      headerName: "Vendor Name",
      field: "email_vendor",
      flex: 1,
      sortable: true,
      filter: true,
      cellRenderer: (params: any) => params.value || "-",
    },
    {
      headerName: "E-Mail",
      field: "email_to_address",
      flex: 1,
      sortable: true,
      filter: true,
    },
    {
      headerName: "Notification ID",
      field: "email_reference_id",
      flex: 1,
      sortable: true,
      filter: true,
      cellRenderer: (params: any) => params.value || "-",
    },
    {
      headerName: "App ID",
      field: "id",
      flex: 1,
      sortable: true,
      filter: true,
    },
    {
      headerName: "Last Updated",
      field: "updated_at",
      flex: 1,
      sortable: true,
      filter: true,
      cellRenderer: (params: any) => formatDate(params.value),
    },
    {
      headerName: "Status",
      field: "email_delivery_status",
      flex: 1,
      sortable: true,
      filter: true,
      cellRenderer: (params: any) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            params.value === "delivered" || params.value === "success"
              ? "bg-green-100 text-green-800"
              : params.value === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
          }`}
        >
          {params.value || "-"}
        </span>
      ),
    },
    {
      headerName: "No of Tries",
      field: "email_num_retries",
      width: 120,
      sortable: true,
      filter: true,
    },
    {
      headerName: "Balance Left",
      width: 120,
      sortable: true,
      filter: true,
      cellRenderer: (params: any) => {
        const maxRetries = params.data?.email_max_retries || 0;
        const numRetries = params.data?.email_num_retries || 0;
        return maxRetries - numRetries;
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
    domLayout: "autoHeight" as const,
    rowHeight: 50,
    headerHeight: 50,
    suppressCellFocus: true,
    suppressRowClickSelection: true,
    rowSelection: "multiple" as const,
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
          <div className="text-sm text-gray-900">{record.email_vendor || "-"}</div>

          <div className="text-sm font-medium text-gray-500">E-Mail</div>
          <div className="text-sm text-gray-900">{record.email_to_address}</div>

          <div className="text-sm font-medium text-gray-500">Notification ID</div>
          <div className="text-sm text-gray-900">{record.email_reference_id || "-"}</div>

          <div className="text-sm font-medium text-gray-500">App ID</div>
          <div className="text-sm text-gray-900">{record.id}</div>

          <div className="text-sm font-medium text-gray-500">Last Updated</div>
          <div className="text-sm text-gray-900">{formatDate(record.updated_at)}</div>

          <div className="text-sm font-medium text-gray-500">Status</div>
          <div className="text-sm">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                record.email_delivery_status === "delivered" || record.email_delivery_status === "success"
                  ? "bg-green-100 text-green-800"
                  : record.email_delivery_status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
              }`}
            >
              {record.email_delivery_status || "-"}
            </span>
          </div>

          <div className="text-sm font-medium text-gray-500">No of Tries</div>
          <div className="text-sm text-gray-900">{record.email_num_retries}</div>

          <div className="text-sm font-medium text-gray-500">Balance Left</div>
          <div className="text-sm text-gray-900">
            {(record.email_max_retries || 0) - (record.email_num_retries || 0)}
          </div>
        </div>
      </div>
    ));
  };

  // Summary info card for first email record
  const renderSummaryCard = () => {
    if (emailDetailData.length === 0) return null;

    const record = emailDetailData[0];
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 mb-6">
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <h2 className="text-base font-semibold text-gray-900">Email Summary</h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-500">Status</div>
              <div className="text-sm text-gray-900 mt-1">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    record.email_delivery_status === "delivered" || record.email_delivery_status === "success"
                      ? "bg-green-100 text-green-800"
                      : record.email_delivery_status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {record.email_delivery_status || "-"}
                </span>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">To Address</div>
              <div className="text-sm text-gray-900 mt-1">{record.email_to_address}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">From Address</div>
              <div className="text-sm text-gray-900 mt-1">{record.email_from_address}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Subject</div>
              <div className="text-sm text-gray-900 mt-1">{record.email_subject}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout title="E Mail Info" breadcrumb="Notifications › Email Details">
      <div className="space-y-6">
        {/* Back Navigation - Moved outside the header card */}
        <Button
          onClick={() => navigate("/notification")}
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
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Summary Card */}
        {renderSummaryCard()}

        {/* Email Details Table - Desktop and Mobile Views */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <h2 className="text-base font-semibold text-gray-900">Email Info Table</h2>
          </div>

          {/* Desktop View */}
          <div className="hidden md:block ag-theme-alpine" style={{ width: "100%", height: "400px" }}>
            <AgGridReact
              rowData={emailDetailData}
              columnDefs={emailDetailColumnDefs}
              defaultColDef={defaultColDef}
              gridOptions={{
                ...gridOptions,
                headerHeight: 45,
                rowHeight: 48,
                paginationPageSize: 15,
                domLayout: "normal",
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
