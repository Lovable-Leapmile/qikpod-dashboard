import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { MapPin, Package, Users, Calendar, Settings, HelpCircle, LogOut, Menu, X, Activity, ChevronDown, UserPlus, Bell, CreditCard, FileText, Map } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { dashboardApi } from '@/services/dashboardApi';
import LocationsTable from './LocationsTable';
import PodsTable from './PodsTable';
import LocationDetail from './LocationDetail';
import PodDetail from './PodDetail';
import Reservations from './Reservations';
import ReservationDetail from './ReservationDetail';
import AdhocReservationDetail from './AdhocReservationDetail';
import UsersNetworkSection from './UsersNetworkSection';
import SupportPopup from './SupportPopup';
type ViewType = 'dashboard' | 'locations' | 'pods' | 'reservations' | 'locationDetail' | 'podDetail' | 'reservationDetail' | 'adhocReservationDetail' | 'usersNetwork';
const Dashboard = () => {
  const {
    user,
    logout,
    accessToken
  } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showSupportPopup, setShowSupportPopup] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [selectedPodId, setSelectedPodId] = useState<number | null>(null);
  const [selectedReservationId, setSelectedReservationId] = useState<number | null>(null);
  const [dashboardStats, setDashboardStats] = useState({
    locations: 0,
    pods: 0,
    users: 0,
    reservations: 0
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
      const [locations, pods, users, reservations] = await Promise.all([dashboardApi.getLocationsCount(accessToken), dashboardApi.getPodsCount(accessToken), dashboardApi.getUsersCount(accessToken), dashboardApi.getReservationsCount(accessToken)]);
      setDashboardStats({
        locations,
        pods,
        users,
        reservations
      });
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
    setIsMobileMenuOpen(false);
  };
  const navigationItems = [{
    name: 'Dashboard',
    icon: Activity,
    active: currentView === 'dashboard',
    onClick: () => handleNavigationClick('dashboard')
  }, {
    name: 'Operations',
    icon: Settings,
    active: currentView === 'locations' || currentView === 'pods' || currentView === 'reservations',
    isDropdown: true,
    items: [{
      name: 'Locations',
      icon: MapPin,
      onClick: () => handleNavigationClick('locations')
    }, {
      name: 'Pods',
      icon: Package,
      onClick: () => handleNavigationClick('pods')
    }, {
      name: 'Reservations',
      icon: Calendar,
      onClick: () => handleNavigationClick('reservations')
    }]
  }, {
    name: 'Users & Network',
    icon: Users,
    active: currentView === 'usersNetwork',
    isDropdown: true,
    items: [{
      name: 'Users',
      icon: Users,
      onClick: () => handleNavigationClick('usersNetwork')
    }, {
      name: 'Partner',
      icon: UserPlus,
      onClick: () => window.location.href = '/partner'
    }, {
      name: 'Notification',
      icon: Bell,
      onClick: () => {} // TODO: Implement notification functionality
    }]
  }, {
    name: 'System & Finance',
    icon: Settings,
    isDropdown: true,
    items: [{
      name: 'Payments',
      icon: CreditCard,
      onClick: () => {} // TODO: Implement payments functionality
    }, {
      name: 'Logs',
      icon: FileText,
      onClick: () => {} // TODO: Implement logs functionality
    }, {
      name: 'FE Map',
      icon: Map,
      onClick: () => {} // TODO: Implement FE Map functionality
    }]
  }, {
    name: 'Support',
    icon: HelpCircle,
    onClick: () => setShowSupportPopup(true)
  }];
  const statsData = [{
    title: 'LOCATIONS',
    value: dashboardStats.locations.toString(),
    icon: MapPin
  }, {
    title: 'PODS',
    value: dashboardStats.pods.toString(),
    icon: Package
  }, {
    title: 'USERS',
    value: dashboardStats.users.toString(),
    icon: Users
  }, {
    title: 'RESERVATIONS',
    value: dashboardStats.reservations.toString(),
    icon: Calendar
  }];
  const handleLocationClick = (locationId: number) => {
    setSelectedLocationId(locationId);
    setCurrentView('locationDetail');
  };
  const handlePodClick = (podId: number) => {
    setSelectedPodId(podId);
    setCurrentView('podDetail');
  };
  const handleStandardReservationClick = (reservationId: number) => {
    setSelectedReservationId(reservationId);
    setCurrentView('reservationDetail');
  };
  const handleAdhocReservationClick = (reservationId: number) => {
    setSelectedReservationId(reservationId);
    setCurrentView('adhocReservationDetail');
  };
  const handleBackToLocations = () => {
    setCurrentView('locations');
    setSelectedLocationId(null);
  };
  const handleBackToPods = () => {
    setCurrentView('pods');
    setSelectedPodId(null);
  };
  const handleBackToReservations = () => {
    setCurrentView('reservations');
    setSelectedReservationId(null);
  };
  const handleBackToOperations = () => {
    setCurrentView('dashboard');
  };
  const renderCurrentView = () => {
    switch (currentView) {
      case 'locations':
        return <LocationsTable onLocationClick={handleLocationClick} />;
      case 'pods':
        return <PodsTable onPodClick={handlePodClick} />;
      case 'reservations':
        return <Reservations onBack={handleBackToOperations} onStandardReservationClick={handleStandardReservationClick} onAdhocReservationClick={handleAdhocReservationClick} />;
      case 'usersNetwork':
        return <UsersNetworkSection onBack={handleBackToOperations} />;
      case 'locationDetail':
        return selectedLocationId ? <LocationDetail locationId={selectedLocationId} onBack={handleBackToLocations} /> : null;
      case 'podDetail':
        return selectedPodId ? <PodDetail podId={selectedPodId} onBack={handleBackToPods} /> : null;
      case 'reservationDetail':
        return selectedReservationId ? <ReservationDetail reservationId={selectedReservationId} onBack={handleBackToReservations} /> : null;
      case 'adhocReservationDetail':
        return selectedReservationId ? <AdhocReservationDetail reservationId={selectedReservationId} onBack={handleBackToReservations} /> : null;
      default:
        return <div className="space-y-4">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsData.map((stat, index) => <Card key={index} className="bg-white shadow-sm hover:shadow-md transition-shadow rounded-xl border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className="h-4 w-4 text-gray-800" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">
                      {statsLoading ? '...' : stat.value}
                    </div>
                  </CardContent>
                </Card>)}
            </div>

            {/* Tables on Dashboard */}
            <div className="space-y-6">
              <LocationsTable onLocationClick={handleLocationClick} />
              <PodsTable onPodClick={handlePodClick} />
            </div>
          </div>;
    }
  };
  return <div className="min-h-screen bg-gray-50 w-full">
      {/* Fixed Top Navigation */}
      <nav className="bg-[#FDDC4E] fixed top-0 left-0 right-0 z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <img src="https://leapmile-website.blr1.cdn.digitaloceanspaces.com/Qikpod/Images/q70.png" alt="QikPod Logo" className="h-7 w-auto" />
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navigationItems.map(item => item.isDropdown ? <DropdownMenu key={item.name}>
                      <DropdownMenuTrigger asChild>
                        <button className={`h-10 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${item.active ? 'bg-yellow-400 text-black' : 'text-black hover:bg-yellow-400 hover:text-black'}`}>
                          <item.icon className="inline-block w-4 h-4 mr-2" />
                          {item.name}
                          <ChevronDown className="w-4 h-4 ml-1" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
                        {item.items?.map(subItem => <DropdownMenuItem key={subItem.name} onClick={subItem.onClick} className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer">
                            <subItem.icon className="w-4 h-4 mr-2" />
                            {subItem.name}
                          </DropdownMenuItem>)}
                      </DropdownMenuContent>
                    </DropdownMenu> : <button key={item.name} onClick={item.onClick} className={`h-10 px-3 py-2 rounded-md text-sm font-medium transition-colors ${item.active ? 'bg-yellow-400 text-black' : 'text-black hover:bg-yellow-400 hover:text-black'}`}>
                      <item.icon className="inline-block w-4 h-4 mr-2" />
                      {item.name}
                    </button>)}
                <Button onClick={() => setShowLogoutDialog(true)} variant="ghost" className="h-10 text-black hover:text-black bg-gray-50">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} variant="ghost" size="sm" className="text-black hover:bg-yellow-400">
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && <div className="md:hidden bg-yellow-400">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navigationItems.map(item => item.isDropdown ? <div key={item.name} className="space-y-1">
                    <div className="px-3 py-2 text-base font-medium text-black">
                      <item.icon className="inline-block w-4 h-4 mr-2" />
                      {item.name}
                    </div>
                    {item.items?.map(subItem => <button key={subItem.name} onClick={subItem.onClick} className="w-full text-left px-6 py-2 text-sm text-black hover:bg-yellow-500">
                        <subItem.icon className="inline-block w-4 h-4 mr-2" />
                        {subItem.name}
                      </button>)}
                  </div> : <button key={item.name} onClick={item.onClick} className={`w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${item.active ? 'bg-yellow-500 text-black' : 'text-black hover:bg-yellow-500 hover:text-black'}`}>
                    <item.icon className="inline-block w-4 h-4 mr-2" />
                    {item.name}
                  </button>)}
              <Button onClick={() => {
            setShowLogoutDialog(true);
            setIsMobileMenuOpen(false);
          }} variant="ghost" className="w-full text-left text-black hover:bg-yellow-500 hover:text-black justify-start">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>}
      </nav>

      {/* Main Content with top padding for fixed header */}
      <main className="w-full py-6 px-4 sm:px-6 lg:px-8 pt-24">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <Activity className="w-4 h-4 mr-2" />
            {currentView === 'dashboard' && 'Dashboard'}
            {currentView === 'locations' && 'Operations / Locations Management'}
            {currentView === 'pods' && 'Operations / Pods Management'}
            {currentView === 'reservations' && 'Operations / Reservations Management'}
            {currentView === 'usersNetwork' && 'Users & Network / Users Management'}
            {currentView === 'locationDetail' && 'Operations / Location Details'}
            {currentView === 'podDetail' && 'Operations / Pod Details'}
            {currentView === 'reservationDetail' && 'Operations / Reservation Details'}
            {currentView === 'adhocReservationDetail' && 'Operations / Adhoc Reservation Details'}
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {currentView === 'dashboard' && 'Dashboard'}
            {currentView === 'locations' && 'Locations'}
            {currentView === 'pods' && 'Pods'}
            {currentView === 'reservations' && 'Reservations'}
            {currentView === 'usersNetwork' && 'Users'}
            {currentView === 'locationDetail' && 'Location Details'}
            {currentView === 'podDetail' && 'Pod Details'}
            {currentView === 'reservationDetail' && 'Reservation Details'}
            {currentView === 'adhocReservationDetail' && 'Adhoc Reservation Details'}
          </h1>
          {user && currentView === 'dashboard' && <p className="text-gray-600 mt-1">Welcome back, {user.user_name}!</p>}
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
            <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleLogout} className="bg-[#FDDC4E] hover:bg-yellow-400 text-black">
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Support Popup */}
      <SupportPopup isOpen={showSupportPopup} onClose={() => setShowSupportPopup(false)} />
    </div>;
};
export default Dashboard;
