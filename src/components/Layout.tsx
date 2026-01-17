import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import MobileHeader from "./MobileHeader";
import MobileSidebar from "./MobileSidebar";
import SupportPopup from "./SupportPopup";

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  breadcrumb: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title, breadcrumb }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showSupportPopup, setShowSupportPopup] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setShowLogoutDialog(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      {/* Desktop & Tablet Layout - Header on top, Sidebar below */}
      <div className="hidden md:flex flex-col min-h-screen">
        {/* Fixed Desktop Header with Logo - matching sidebar color */}
        <header className="h-14 bg-amber-100 border-amber-200 border-b flex items-center justify-between px-6 sticky top-0 z-50">
          <div className="flex items-center">
            <div className="cursor-pointer" onClick={() => navigate('/dashboard')}>
              <img 
                src="https://leapmile-website.blr1.cdn.digitaloceanspaces.com/Qikpod/Images/q70.png" 
                alt="QikPod Logo" 
                className="h-6 w-auto" 
              />
            </div>
            <h1 className="text-xl font-bold text-gray-900 ml-4">QikPod Portal</h1>
          </div>
          {/* Welcome message on the right */}
          <div className="text-sm font-medium text-black">
            Welcome, {user?.user_name || 'User'}
          </div>
        </header>

        {/* Content area with sidebar */}
        <div className="flex flex-1">
          {/* Fixed Sidebar below header */}
          <AppSidebar setShowLogoutDialog={setShowLogoutDialog} setShowSupportPopup={setShowSupportPopup} />

          {/* Main Content */}
          <main className="flex-1 p-4 overflow-auto">{children}</main>
        </div>
      </div>

      {/* Mobile Layout - Header + Content */}
      <div className="md:hidden">
        {/* Mobile Header */}
        <MobileHeader isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

        {/* Mobile Sidebar */}
        <MobileSidebar
              isOpen={isMobileMenuOpen}
              onClose={() => setIsMobileMenuOpen(false)}
          //onClose={() => setIsMobileMenuOpen(false)}
          setShowLogoutDialog={setShowLogoutDialog}
          setShowSupportPopup={setShowSupportPopup}
        />

        {/* Main Content with top padding for fixed header */}
        <main className="pt-14 pb-4 px-4">{children}</main>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>Are you sure you want to logout?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleLogout} className="bg-amber-100 hover:bg-amber-200 text-black">
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Support Popup */}
      <SupportPopup isOpen={showSupportPopup} onClose={() => setShowSupportPopup(false)} />
    </div>
  );
};

export default Layout;
