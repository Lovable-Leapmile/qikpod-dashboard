import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Menu, X, ChevronDown, User } from 'lucide-react';
import { NavigationItem } from './NavigationItems';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardNavigationProps {
  navigationItems: NavigationItem[];
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  setShowLogoutDialog: (show: boolean) => void;
}

const DashboardNavigation: React.FC<DashboardNavigationProps> = ({
  navigationItems,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  setShowLogoutDialog
}) => {
  const { user } = useAuth();
  
  const handleLogoClick = () => {
    window.location.reload();
  };

  return (
    <nav className="bg-[#FDDC4E] fixed top-0 left-0 right-0 z-50 border-b border-yellow-300">
      <div className="w-full px-3 sm:px-4 lg:px-6">
        <div className="flex justify-between items-center h-12">
          {/* Logo */}
          <div className="flex items-center">
            <div 
              className="flex-shrink-0 cursor-pointer" 
              onClick={handleLogoClick}
            >
              <img 
                src="https://leapmile-website.blr1.cdn.digitaloceanspaces.com/Qikpod/Images/q70.png" 
                alt="QikPod Logo" 
                className="h-5 w-auto" 
              />
            </div>
          </div>

          {/* Desktop Navigation - Only show on large screens */}
          <div className="hidden lg:block">
            <div className="ml-6 flex items-center space-x-2">
              {navigationItems.map(item => item.isDropdown ? <DropdownMenu key={item.name}>
                    <DropdownMenuTrigger asChild>
                      <button className={`h-8 px-2 py-1 rounded-md text-xs font-medium transition-colors flex items-center ${item.active ? 'bg-yellow-400 text-black' : 'text-black hover:bg-yellow-400 hover:text-black'}`}>
                        <item.icon className="inline-block w-3 h-3 mr-1" />
                        {item.name}
                        <ChevronDown className="w-3 h-3 ml-1" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
                      {item.items?.map(subItem => <DropdownMenuItem key={subItem.name} onClick={subItem.onClick} className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer">
                          <subItem.icon className="w-4 h-4 mr-2" />
                          {subItem.name}
                        </DropdownMenuItem>)}
                    </DropdownMenuContent>
                  </DropdownMenu> : <button key={item.name} onClick={item.onClick} className={`h-8 px-2 py-1 rounded-md text-xs font-medium transition-colors ${item.active ? 'bg-yellow-400 text-black' : 'text-black hover:bg-yellow-400 hover:text-black'}`}>
                    <item.icon className="inline-block w-3 h-3 mr-1" />
                    {item.name}
                  </button>)}
              
              {/* User Profile Section */}
              {user && (
                <div className="flex items-center space-x-2 ml-4">
                  <span className="text-xs text-black font-medium">Welcome {user.user_name}</span>
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-yellow-600 text-white text-xs">
                      <User className="h-3 w-3" />
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
              
              <Button onClick={() => setShowLogoutDialog(true)} variant="ghost" className="h-8 px-2 text-xs text-black hover:text-black bg-gray-50">
                <LogOut className="w-3 h-3 mr-1" />
                Logout
              </Button>
            </div>
          </div>

          {/* Mobile/Tablet menu button */}
          <div className="lg:hidden">
            <Button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} variant="ghost" size="sm" className="text-black hover:bg-yellow-400">
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Navigation */}
      {isMobileMenuOpen && <div className="lg:hidden bg-zinc-100">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigationItems.map(item => item.isDropdown ? <div key={item.name} className="space-y-1">
                  <div className="px-3 py-2 text-base font-medium text-black">
                    <item.icon className="inline-block w-4 h-4 mr-2" />
                    {item.name}
                  </div>
                  {item.items?.map(subItem => <button key={subItem.name} onClick={subItem.onClick} className="w-full text-left px-6 py-2 text-sm text-black hover:bg-[#fddc4e]">
                      <subItem.icon className="inline-block w-4 h-4 mr-2" />
                      {subItem.name}
                    </button>)}
                </div> : <button key={item.name} onClick={item.onClick} className={`w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${item.active ? 'bg-[#fddc4e] text-black' : 'text-black hover:bg-[#fddc4e] hover:text-black'}`}>
                  <item.icon className="inline-block w-4 h-4 mr-2" />
                  {item.name}
                </button>)}
            <Button onClick={() => {
          setShowLogoutDialog(true);
          setIsMobileMenuOpen(false);
        }} variant="ghost" className="w-full text-left text-black hover:bg-[#fddc4e] hover:text-black justify-start">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>}
    </nav>
  );
};

export default DashboardNavigation;
