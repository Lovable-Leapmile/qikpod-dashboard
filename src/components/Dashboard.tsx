"use client"; // Ensure this is at the top of the file

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import {
  MapPin,
  Package,
  Users,
  Calendar,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// AG Grid imports
import { AgGridReact } from 'ag-grid-react';
// Use AllCommunityModules (plural) which is typically the correct export for all modules
import { ModuleRegistry, AllCommunityModules } from 'ag-grid-community';
import type { ColDef, ICellRendererParams, ValueGetterParams } from 'ag-grid-community';

// AG Grid CSS
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Alpine theme CSS (as per your import)

// Register AG Grid modules
// AllCommunityModules is an array of all community modules.
ModuleRegistry.registerModules(AllCommunityModules);

// Define the data type for locations
type LocationData = {
  id: number;
  name: string;
  address: string;
  pincode: string; // Kept as string
};

// Custom Cell Renderer for the Action Button
// It's good practice to type params with ICellRendererParams
const ActionButtonRenderer = (params: ICellRendererParams<LocationData>) => {
  const handleActionClick = () => {
    console.log("Settings clicked for location ID:", params.data?.id);
    // Implement action logic here, e.g., open a modal, navigate, etc.
    // You have access to the full row data via params.data
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-gray-400 hover:text-gray-600"
      onClick={handleActionClick}
    >
      <Settings className="w-4 h-4" />
    </Button>
  );
};


const Dashboard = () => {
  const { user, logout } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setShowLogoutDialog(false);
  };

  // Assuming these are defined elsewhere or you'll add them
  const navigationItems = [
    { name: 'Dashboard', icon: Calendar, active: true },
    { name: 'Operations', icon: Settings },
    { name: 'Users & Network', icon: Users },
    { name: 'System & Finance', icon: Package },
    { name: 'Support', icon: HelpCircle },
  ];

  const statsData = [
    { title: 'LOCATIONS', value: '459', icon: MapPin },
    { title: 'PODS', value: '573', icon: Package },
    { title: 'USERS', value: '11041', icon: Users },
    { title: 'RESERVATIONS', value: '40195', icon: Calendar },
  ];

  // Sample locationsData, memoized for performance
  const locationsData = useMemo<LocationData[]>(() => [
    { id: 491, name: 'SV Paradies Koramangala', address: '#9, 1st 3rd Cross, Opposite to Indian Oil, 80 ft Road, Koramangala 1st block near wipro park', pincode: '560095' },
    { id: 492, name: 'Greenwood Regency HSR', address: 'Plot 15, 27th Main Rd, Sector 2, HSR Layout, Bengaluru', pincode: '560102' },
    { id: 493, name: 'Lakeview Apartments Bellandur', address: '45 Lake Rd, Bellandur, Bengaluru, Near Central Mall', pincode: '560103' },
    { id: 494, name: 'Mountain Vista Whitefield', address: '789 Hilltop Dr, Whitefield, Hope Farm Junction, Bengaluru', pincode: '560066' },
    { id: 495, name: 'Ocean Breeze Indiranagar', address: '10 Beach Ave, 100 Feet Rd, Indiranagar, Bengaluru', pincode: '560038' },
  ], []);

  // AG Grid column definitions with proper typing
  const columnDefs = useMemo<ColDef<LocationData>[]>(() => [
    {
      headerName: 'ID',
      field: 'id', // Direct key of LocationData
      width: 100,
    },
    {
      headerName: 'NAME',
      field: 'name',
      width: 250, // Increased width
      filter: 'agTextColumnFilter', // Example of specific filter
    },
    {
      headerName: 'ADDRESS',
      field: 'address',
      flex: 1, // Takes remaining width
      minWidth: 300, // Minimum width for address
      wrapText: true, // Enable text wrapping for long addresses
      autoHeight: true, // Adjust row height to fit wrapped text
      tooltipField: 'address', // Shows full address on hover
    },
    {
      headerName: 'PINCODE',
      field: 'pincode',
      width: 120,
    },
    {
      headerName: 'ACTION',
      width: 100,
      cellRenderer: ActionButtonRenderer, // Use the custom React component
      sortable: false, // Actions are typically not sortable
      filter: false,   // Or filterable
      pinned: 'right', // Pin column to the right
      cellClass: 'flex items-center justify-center', // Tailwind for centering
    }
  ], []);

  // AG Grid default column properties
  const defaultColDef = useMemo<ColDef<LocationData>>(() => ({
    resizable: true,
    sortable: true,
    filter: true, // Enable basic filtering on all columns by default
    // floatingFilter: true, // Optionally enable floating filters
  }), []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-yellow-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-xl font-bold">QikPod</span>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navigationItems.map((item) => (
                  <button
                    key={item.name}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      item.active
                        ? 'bg-yellow-600 text-white'
                        : 'text-yellow-100 hover:bg-yellow-600 hover:text-white'
                    }`}
                  >
                    <item.icon className="inline-block w-4 h-4 mr-2" />
                    {item.name}
                  </button>
                ))}
                <Button
                  onClick={() => setShowLogoutDialog(true)}
                  variant="ghost"
                  className="text-yellow-100 hover:bg-yellow-600 hover:text-white"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
            <div className="md:hidden">
              <Button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-yellow-600"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </div>
        {isMobileMenuOpen && (
          <div className="md:hidden bg-yellow-600">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navigationItems.map((item) => (
                <button
                  key={item.name}
                  className={`w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    item.active
                      ? 'bg-yellow-700 text-white'
                      : 'text-yellow-100 hover:bg-yellow-700 hover:text-white'
                  }`}
                >
                  <item.icon className="inline-block w-4 h-4 mr-2" />
                  {item.name}
                </button>
              ))}
              <Button
                onClick={() => setShowLogoutDialog(true)}
                variant="ghost"
                className="w-full text-left text-yellow-100 hover:bg-yellow-700 hover:text-white justify-start"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <Calendar className="w-4 h-4 mr-2" />
            Dashboard
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          {user && (
            <p className="text-gray-600 mt-1">Welcome back, {user.user_name}!</p>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsData.map((stat, index) => (
            <Card key={index} className="bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Locations Table with AG Grid */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="ag-theme-alpine" // Using Alpine theme
              style={{ height: 500, width: '100%' }} // Ensure grid has dimensions
            >
              <AgGridReact<LocationData> // Specify the row data type
                rowData={locationsData}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                pagination={true}
                paginationPageSize={10}
                paginationPageSizeSelector={[10, 20, 50, 100]} // Options for page size
                // domLayout='autoHeight' // Consider this if you want grid height to fit content. Can impact performance.
                enableCellTextSelection={true} // Allows text selection in cells
                // ensureDomOrder={true} // Retained from your code, useful for some testing/accessibility
              />
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to logout?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowLogoutDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleLogout}
              className="bg-yellow-500 hover:bg-yellow-600"
            >
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;