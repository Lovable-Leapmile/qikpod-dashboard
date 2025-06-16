import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LogOut, Menu, X, ChevronDown } from 'lucide-react';
import { NavigationItem } from './NavigationItems';
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
  return <nav className="bg-[#FDDC4E] fixed top-0 left-0 right-0 z-50">
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
      {isMobileMenuOpen && <div className="md:hidden bg-zinc-100">
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
    </nav>;
};
export default DashboardNavigation;