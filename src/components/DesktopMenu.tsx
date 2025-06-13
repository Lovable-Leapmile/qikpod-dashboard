
import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LogOut, ChevronDown } from 'lucide-react';
import { NavigationItem } from './NavigationItems';

interface DesktopMenuProps {
  navigationItems: NavigationItem[];
  setShowLogoutDialog: (show: boolean) => void;
}

const DesktopMenu: React.FC<DesktopMenuProps> = ({ navigationItems, setShowLogoutDialog }) => {
  return (
    <div className="hidden md:block">
      <div className="ml-10 flex items-baseline space-x-4">
        {navigationItems.map(item =>
          item.isDropdown ? (
            <DropdownMenu key={item.name}>
              <DropdownMenuTrigger asChild>
                <button className={`h-10 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${item.active ? 'bg-yellow-400 text-black' : 'text-black hover:bg-yellow-400 hover:text-black'}`}>
                  <item.icon className="inline-block w-4 h-4 mr-2" />
                  {item.name}
                  <ChevronDown className="w-4 h-4 ml-1" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
                {item.items?.map(subItem => (
                  <DropdownMenuItem key={subItem.name} onClick={subItem.onClick} className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer">
                    <subItem.icon className="w-4 h-4 mr-2" />
                    {subItem.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              key={item.name}
              onClick={item.onClick}
              className={`h-10 px-3 py-2 rounded-md text-sm font-medium transition-colors ${item.active ? 'bg-yellow-400 text-black' : 'text-black hover:bg-yellow-400 hover:text-black'}`}
            >
              <item.icon className="inline-block w-4 h-4 mr-2" />
              {item.name}
            </button>
          )
        )}
        <Button
          onClick={() => setShowLogoutDialog(true)}
          variant="ghost"
          className="h-10 text-black hover:text-black bg-gray-50"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default DesktopMenu;
