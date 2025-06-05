
import React, { useState, useEffect } from 'react';
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
  X,
  Activity
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { dashboardApi } from '@/services/dashboardApi';
import LocationsTable from './LocationsTable';
import PodsTable from './PodsTable';
import LocationDetail from './LocationDetail';
import PodDetail from './PodDetail';

type ViewType = 'dashboard' | 'locations' | 'pods' | 'locationDetail' | 'podDetail';

const Dashboard = () => {
  const { user, logout, accessToken } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [selectedPodId, setSelectedPodId] = useState<number | null>(null);
  const [dashboardStats, setDashboardStats] = useState({
    locations: 0,
    pods: 0,
    users: 0,
    reservations: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const handleLogout = () => {
    logout();
    setShowLogoutDialog(false);
  };

  const fetchDashboardStats = async () => {
    if (!accessToken) return;
    
    setStatsLoading(true);
    try {
      // Use the count APIs directly to get proper counts from response body
      const [locations, pods, users, reservations] = await Promise.all([
        dashboardApi.getLocationsCount(accessToken),
        dashboardApi.getPodsCount(accessToken),
        dashboardApi.getUsersCount(accessToken),
        dashboardApi.getReservationsCount(accessToken),
      ]);
      
      setDashboardStats({ locations, pods, users, reservations });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, [accessToken]);

  const handleNavigationClick = (view: ViewType, onClick?: () => void) => {
    if (onClick) onClick();
    setCurrentView(view);
    // Close mobile menu after navigation
    setIsMobileMenuOpen(false);
  };

  const navigationItems = [
    { 
      name: 'Dashboard', 
      icon: Activity, 
      active: currentView === 'dashboard',
      onClick: () => handleNavigationClick('dashboard')
    },
    { 
      name: 'Locations', 
      icon: MapPin, 
      active: currentView === 'locations',
      onClick: () => handleNavigationClick('locations')
    },
    { 
      name: 'Pods', 
      icon: Package, 
      active: currentView === 'pods',
      onClick: () => handleNavigationClick('pods')
    },
    { name: 'Operations', icon: Settings },
    { name: 'Users & Network', icon: Users },
    { name: 'System & Finance', icon: HelpCircle },
    { name: 'Support', icon: HelpCircle },
  ];

  const statsData = [
    { title: 'LOCATIONS', value: dashboardStats.locations.toString(), icon: MapPin },
    { title: 'PODS', value: dashboardStats.pods.toString(), icon: Package },
    { title: 'USERS', value: dashboardStats.users.toString(), icon: Users },
    { title: 'RESERVATIONS', value: dashboardStats.reservations.toString(), icon: Calendar },
  ];

  const handleLocationClick = (locationId: number) => {
    setSelectedLocationId(locationId);
    setCurrentView('locationDetail');
  };

  const handlePodClick = (podId: number) => {
    setSelectedPodId(podId);
    setCurrentView('podDetail');
  };

  const handleBackToLocations = () => {
    setCurrentView('locations');
    setSelectedLocationId(null);
  };

  const handleBackToPods = () => {
    setCurrentView('pods');
    setSelectedPodId(null);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'locations':
        return <LocationsTable onLocationClick={handleLocationClick} />;
      case 'pods':
        return <PodsTable onPodClick={handlePodClick} />;
      case 'locationDetail':
        return selectedLocationId ? (
          <LocationDetail locationId={selectedLocationId} onBack={handleBackToLocations} />
        ) : null;
      case 'podDetail':
        return selectedPodId ? (
          <PodDetail podId={selectedPodId} onBack={handleBackToPods} />
        ) : null;
      default:
        return (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsData.map((stat, index) => (
                <Card key={index} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className="h-4 w-4 text-yellow-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">
                      {statsLoading ? '...' : stat.value}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Tables on Dashboard */}
            <div className="space-y-6">
              <LocationsTable onLocationClick={handleLocationClick} />
              <PodsTable onPodClick={handlePodClick} />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Top Navigation */}
      <nav className="bg-blue-600 text-white shadow-lg fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-xl font-bold text-white">QikPod</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navigationItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={item.onClick}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      item.active
                        ? 'bg-blue-700 text-white'
                        : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                    }`}
                  >
                    <item.icon className="inline-block w-4 h-4 mr-2" />
                    {item.name}
                  </button>
                ))}
                <Button
                  onClick={() => setShowLogoutDialog(true)}
                  variant="ghost"
                  className="text-blue-100 hover:bg-blue-700 hover:text-white"
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
                className="text-white hover:bg-blue-700"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-blue-700">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navigationItems.map((item) => (
                <button
                  key={item.name}
                  onClick={item.onClick}
                  className={`w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    item.active
                      ? 'bg-blue-800 text-white'
                      : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                  }`}
                >
                  <item.icon className="inline-block w-4 h-4 mr-2" />
                  {item.name}
                </button>
              ))}
              <Button
                onClick={() => {
                  setShowLogoutDialog(true);
                  setIsMobileMenuOpen(false);
                }}
                variant="ghost"
                className="w-full text-left text-blue-100 hover:bg-blue-800 hover:text-white justify-start"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content with top padding for fixed header */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 pt-24">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <Activity className="w-4 h-4 mr-2" />
            {currentView === 'dashboard' && 'Dashboard'}
            {currentView === 'locations' && 'Locations Management'}
            {currentView === 'pods' && 'Pods Management'}
            {currentView === 'locationDetail' && 'Location Details'}
            {currentView === 'podDetail' && 'Pod Details'}
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {currentView === 'dashboard' && 'Dashboard'}
            {currentView === 'locations' && 'Locations'}
            {currentView === 'pods' && 'Pods'}
            {currentView === 'locationDetail' && 'Location Details'}
            {currentView === 'podDetail' && 'Pod Details'}
          </h1>
          {user && currentView === 'dashboard' && (
            <p className="text-gray-600 mt-1">Welcome back, {user.user_name}!</p>
          )}
        </div>

        {/* Dynamic Content */}
        {renderCurrentView()}
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
