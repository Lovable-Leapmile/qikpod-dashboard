
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, LogOut } from 'lucide-react';
import { NavigationItem } from './NavigationItems';

interface MobileMenuProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  navigationItems: NavigationItem[];
  setShowLogoutDialog: (show: boolean) => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  navigationItems,
  setShowLogoutDialog
}) => {
  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden">
        <Button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          variant="ghost"
          size="sm"
          className="text-black hover:bg-yellow-400"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-yellow-400">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigationItems.map(item =>
              item.isDropdown ? (
                <div key={item.name} className="space-y-1">
                  <div className="px-3 py-2 text-base font-medium text-black">
                    <item.icon className="inline-block w-4 h-4 mr-2" />
                    {item.name}
                  </div>
                  {item.items?.map(subItem => (
                    <button
                      key={subItem.name}
                      onClick={subItem.onClick}
                      className="w-full text-left px-6 py-2 text-sm text-black hover:bg-yellow-500"
                    >
                      <subItem.icon className="inline-block w-4 h-4 mr-2" />
                      {subItem.name}
                    </button>
                  ))}
                </div>
              ) : (
                <button
                  key={item.name}
                  onClick={item.onClick}
                  className={`w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${item.active ? 'bg-yellow-500 text-black' : 'text-black hover:bg-yellow-500 hover:text-black'}`}
                >
                  <item.icon className="inline-block w-4 h-4 mr-2" />
                  {item.name}
                </button>
              )
            )}
            <Button
              onClick={() => {
                setShowLogoutDialog(true);
                setIsMobileMenuOpen(false);
              }}
              variant="ghost"
              className="w-full text-left text-black hover:bg-yellow-500 hover:text-black justify-start"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileMenu;
