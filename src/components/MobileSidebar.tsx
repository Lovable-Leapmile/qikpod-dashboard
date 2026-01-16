import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  LogOut,
  HelpCircle,
  Activity,
  Settings,
  MapPin,
  Package,
  Calendar,
  Users,
  UserPlus,
  Bell,
  CreditCard,
  FileText,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  setShowLogoutDialog: (show: boolean) => void;
  setShowSupportPopup: (show: boolean) => void;
}

interface NavItem {
  name: string;
  icon: any;
  path?: string;
  children?: { name: string; icon: any; path: string }[];
}

const navItems: NavItem[] = [
  {
    name: "Dashboard",
    icon: Activity,
    path: "/dashboard",
  },
  {
    name: "Operations",
    icon: Settings,
    children: [
      { name: "Locations", icon: MapPin, path: "/locations" },
      { name: "Pods", icon: Package, path: "/pods" },
      { name: "Reservations", icon: Calendar, path: "/reservations" },
    ],
  },
  {
    name: "Users & Network",
    icon: Users,
    children: [
      { name: "Users", icon: Users, path: "/users" },
      { name: "Partner", icon: UserPlus, path: "/partner" },
      { name: "Notification", icon: Bell, path: "/notification" },
      { name: "Payments", icon: CreditCard, path: "/payments" },
      { name: "Logs", icon: FileText, path: "/logs" },
    ],
  },
];

const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose, setShowLogoutDialog, setShowSupportPopup }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["Operations", "Users & Network"]);

  const isActive = (path: string) => location.pathname === path;

  const isGroupActive = (item: NavItem) => {
    if (item.path) return isActive(item.path);
    return item.children?.some((child) => isActive(child.path)) || false;
  };

  const toggleGroup = (name: string) => {
    setExpandedGroups((prev) => (prev.includes(name) ? prev.filter((g) => g !== name) : [...prev, name]));
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />

      {/* Sidebar */}
      <aside className="fixed top-0 left-0 w-64 h-full bg-[#FDDC4E] z-50 flex flex-col shadow-xl lg:hidden transform transition-transform duration-300 ease-in-out">
        {/* Header with close button */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-yellow-300">
          <div
            className="cursor-pointer"
            onClick={() => {
              navigate("/dashboard");
              onClose();
            }}
          >
            <img
              src="https://leapmile-website.blr1.cdn.digitaloceanspaces.com/Qikpod/Images/q70.png"
              alt="QikPod Logo"
              className="h-6 w-auto"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <div className="space-y-1">
            {navItems.map((item) => (
              <div key={item.name}>
                {item.children ? (
                  <>
                    <button
                      onClick={() => toggleGroup(item.name)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-md transition-colors",
                        isGroupActive(item) ? "bg-yellow-400 text-black" : "text-black hover:bg-yellow-400",
                      )}
                    >
                      <span className="flex items-center">
                        <item.icon className="w-4 h-4 mr-3" />
                        {item.name}
                      </span>
                      {expandedGroups.includes(item.name) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    {expandedGroups.includes(item.name) && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.children.map((child) => (
                          <button
                            key={child.name}
                            onClick={() => handleNavClick(child.path)}
                            className={cn(
                              "w-full flex items-center px-3 py-2.5 text-sm rounded-md transition-colors",
                              isActive(child.path)
                                ? "bg-yellow-500 text-black font-medium"
                                : "text-black hover:bg-yellow-400",
                            )}
                          >
                            <child.icon className="w-4 h-4 mr-3" />
                            {child.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => handleNavClick(item.path!)}
                    className={cn(
                      "w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors",
                      isActive(item.path!) ? "bg-yellow-400 text-black" : "text-black hover:bg-yellow-400",
                    )}
                  >
                    <item.icon className="w-4 h-4 mr-3" />
                    {item.name}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Support */}
          <div className="mt-4 pt-4 border-t border-yellow-300">
            <button
              onClick={() => {
                setShowSupportPopup(true);
                onClose();
              }}
              className="w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md text-black hover:bg-yellow-400 transition-colors"
            >
              <HelpCircle className="w-4 h-4 mr-3" />
              Support
            </button>
          </div>
        </nav>

        {/* User & Logout */}
        <div className="p-4 border-t border-yellow-300">
          {user && <div className="text-xs text-black font-medium mb-2 px-2">Welcome, {user.user_name}</div>}
          <button
            onClick={() => {
              setShowLogoutDialog(true);
              onClose();
            }}
            className="w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md text-black hover:bg-yellow-400 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default MobileSidebar;
