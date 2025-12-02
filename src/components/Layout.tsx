import React, { useState } from 'react';
import { Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardNavigation from './DashboardNavigation';
import SupportPopup from './SupportPopup';
import { ViewType, createNavigationItems } from './NavigationItems';
interface LayoutProps {
  children: React.ReactNode;
  title: string;
  breadcrumb: string;
}
const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  breadcrumb
}) => {
  const {
    user,
    logout
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showSupportPopup, setShowSupportPopup] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const getCurrentView = (): ViewType | 'dashboard' => {
    const path = location.pathname;
    switch (path) {
      case '/dashboard':
        return 'dashboard';
      case '/locations':
        return 'locations';
      case '/pods':
        return 'pods';
      case '/reservations':
        return 'reservations';
      case '/users':
        return 'usersNetwork';
      case '/partner':
        return 'partner';
      case '/notification':
        return 'notification';
      case '/payments':
        return 'payments';
      case '/logs':
        return 'logs';
      default:
        return 'dashboard';
    }
  };
  const handleLogout = () => {
    logout();
    setShowLogoutDialog(false);
    navigate('/');
  };
  const handleNavigationClick = (view: ViewType, onClick?: () => void) => {
    if (onClick) onClick();

    // Navigate to appropriate route
    switch (view) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'locations':
        navigate('/locations');
        break;
      case 'pods':
        navigate('/pods');
        break;
      case 'reservations':
        navigate('/reservations');
        break;
      case 'usersNetwork':
        navigate('/users');
        break;
      case 'partner':
        navigate('/partner');
        break;
      case 'notification':
        navigate('/notification');
        break;
      case 'payments':
        navigate('/payments');
        break;
      case 'logs':
        navigate('/logs');
        break;
    }
    setIsMobileMenuOpen(false);
  };
  const currentView = getCurrentView();
  const navigationItems = createNavigationItems(currentView, handleNavigationClick, setShowSupportPopup);
  return <div className="min-h-screen bg-gray-50 w-full">
      {/* Fixed Top Navigation */}
      <DashboardNavigation navigationItems={navigationItems} isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} setShowLogoutDialog={setShowLogoutDialog} />

      {/* Main Content with top padding for fixed header */}
      <main className="w-full py-3 pt-16 px-4">
        {/* Page Header - Only show for non-dashboard pages */}
        {currentView !== 'dashboard'}

        {/* Dynamic Content */}
        {children}
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
export default Layout;