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
  const { logout } = useAuth();
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
      {/* Desktop & Tablet Layout - Sidebar + Content */}
      <div className="hidden md:flex min-h-screen">
        {/* Fixed Desktop Sidebar */}
        <div className="fixed left-0 top-0 h-screen z-40">
          <AppSidebar setShowLogoutDialog={setShowLogoutDialog} setShowSupportPopup={setShowSupportPopup} />
        </div>

        {/* Main Content with left margin for fixed sidebar */}
        <div className="ml-56 flex-1 flex flex-col min-h-screen">
          {/* Desktop Header */}
          <header className="h-14 bg-amber-100 border-amber-200 border-b  flex items-center px-6 sticky top-0 z-30">
            <h1 className="text-xl font-bold text-gray-900">QikPod Portal</h1>
          </header>

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
            <Button onClick={handleLogout} className="bg-[#FDDC4E] hover:bg-yellow-400 text-black">
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
