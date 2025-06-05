
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
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

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

  const locationsData = [
    { id: 491, name: 'SV Paradies', address: '#9, 1st 3rd Cross, Opposite to Indian Oil, 80 ft Road,...', pincode: '560095' },
    { id: 491, name: 'SV Paradies', address: '#9, 1st 3rd Cross, Opposite to Indian Oil, 80 ft Road,...', pincode: '560095' },
    { id: 491, name: 'SV Paradies', address: '#9, 1st 3rd Cross, Opposite to Indian Oil, 80 ft Road,...', pincode: '560095' },
    { id: 491, name: 'SV Paradies', address: '#9, 1st 3rd Cross, Opposite to Indian Oil, 80 ft Road,...', pincode: '560095' },
    { id: 491, name: 'SV Paradies', address: '#9, 1st 3rd Cross, Opposite to Indian Oil, 80 ft Road,...', pincode: '560095' },
  ];

  // AG Grid column definitions
  const columnDefs = useMemo(() => [
    { 
      field: 'id', 
      headerName: 'ID',
      width: 100,
      sortable: true,
      filter: true
    },
    { 
      field: 'name', 
      headerName: 'NAME',
      width: 150,
      sortable: true,
      filter: true
    },
    { 
      field: 'address', 
      headerName: 'ADDRESS',
      flex: 1,
      sortable: true,
      filter: true,
      tooltipField: 'address'
    },
    { 
      field: 'pincode', 
      headerName: 'PINCODE',
      width: 120,
      sortable: true,
      filter: true
    },
    {
      headerName: 'ACTION',
      width: 100,
      cellRenderer: () => (
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
          <Settings className="w-4 h-4" />
        </Button>
      ),
      sortable: false,
      filter: false
    }
  ], []);

  // AG Grid default column properties
  const defaultColDef = useMemo(() => ({
    resizable: true,
    sortable: true,
    filter: true,
  }), []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-yellow-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-xl font-bold">QikPod</span>
              </div>
            </div>

            {/* Desktop Navigation */}
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

            {/* Mobile menu button */}
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

        {/* Mobile Navigation */}
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
            <div className="ag-theme-alpine" style={{ height: 400, width: '100%' }}>
              <AgGridReact
                rowData={locationsData}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                pagination={true}
                paginationPageSize={10}
                domLayout="normal"
                suppressHorizontalScroll={false}
                enableCellTextSelection={true}
                ensureDomOrder={true}
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
