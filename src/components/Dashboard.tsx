"use client"; // Required for AG Grid and other client-side hooks

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
import { ModuleRegistry, AllCommunityModules } from 'ag-grid-community'; // Ensure you have ag-grid-community installed

import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS
import 'ag-grid-community/styles/ag-theme-quartz.css'; // Theme CSS

// Register AG Grid modules
// If AllCommunityModules is not found, try:
// import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
// ModuleRegistry.registerModules([ClientSideRowModelModule]);
// Or install and import from '@ag-grid-community/all-modules'
ModuleRegistry.registerModules(AllCommunityModules || []); // Use AllCommunityModules or an empty array as a fallback

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setShowLogoutDialog(false);
  };

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

  // Data for AG Grid
  const locationsData = useMemo(() => [
    { id: 491, name: 'SV Paradies', address: '#9, 1st 3rd Cross, Opposite to Indian Oil, 80 ft Road, Koramangala 1st block near wipro park', pincode: 560095 },
    { id: 492, name: 'Greenwood Regency', address: '123 Main St, Anytown, CA, USA', pincode: 90210 },
    { id: 493, name: 'Lakeview Apartments', address: '45 Lake Rd, Lakeside, FL, USA', pincode: 33301 },
    { id: 494, name: 'Mountain Vista', address: '789 Hilltop Dr, Mountainview, CO, USA', pincode: 80401 },
    { id: 495, name: 'Ocean Breeze Condos', address: '10 Beach Ave, Seaside, NJ, USA', pincode: 08751 },
  ], []);

  // Custom Cell Renderer for the Action Button
  const ActionCellRenderer = (props) => {
    const handleActionClick = () => {
      console.log("Settings clicked for location:", props.data);
      // Implement action logic here, e.g., open a modal with location details
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

  // Column Definitions for AG Grid
  const columnDefs = useMemo(() => [
    { headerName: 'ID', field: 'id', width: 100, sortable: true, filter: true },
    { headerName: 'NAME', field: 'name', flex: 1, sortable: true, filter: true, minWidth: 150 },
    { 
      headerName: 'ADDRESS', 
      field: 'address', 
      flex: 2, 
      sortable: true, 
      filter: true, 
      minWidth: 250,
      tooltipField: 'address', // Show full address on hover
      // wrapText: true, // Uncomment if you want text to wrap
      // autoHeight: true, // Uncomment if you want row height to adjust to wrapped text
    },
    { headerName: 'PINCODE', field: 'pincode', width: 120, sortable: true, filter: true },
    { 
      headerName: 'ACTION', 
      cellRenderer: ActionCellRenderer, 
      width: 100, 
      sortable: false, 
      filter: false,
      cellClass: 'flex items-center justify-center' // Center the button
    },
  ], []);

  // Default Column Definitions
  const defaultColDef = useMemo(() => ({
    resizable: true,
    // Add other default properties here if needed
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

        {/* AG Grid Locations Table */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">Locations</CardTitle>
          </CardHeader>
          <CardContent>
            {/* AG Grid Component */}
            <div 
              className="ag-theme-quartz" // Apply AG Grid theme
              style={{ height: '500px', width: '100%' }} // Set dimensions for the grid
            >
              <AgGridReact
                rowData={locationsData}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                pagination={true} // Enable pagination
                paginationPageSize={10} // Set number of rows per page
                paginationPageSizeSelector={[10, 20, 50, 100]} // Options for page size
                // domLayout='autoHeight' // Uncomment if you want grid to fit content height (can impact performance with many rows)
              />
            </div>
          </CardContent>
        </Card>
      </main>

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