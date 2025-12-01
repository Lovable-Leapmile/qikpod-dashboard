

import { Activity, Settings, MapPin, Package, Calendar, Users, UserPlus, Bell, HelpCircle, CreditCard, FileText } from 'lucide-react';

export type ViewType = 'dashboard' | 'locations' | 'pods' | 'reservations' | 'locationDetail' | 'podDetail' | 'reservationDetail' | 'adhocReservationDetail' | 'usersNetwork' | 'partner' | 'notification' | 'payments' | 'logs' | 'smsDetails' | 'emailDetails';

export interface NavigationItem {
  name: string;
  icon: any;
  active?: boolean;
  onClick?: () => void;
  isDropdown?: boolean;
  items?: {
    name: string;
    icon: any;
    onClick: () => void;
  }[];
}

export const createNavigationItems = (
  currentView: ViewType,
  handleNavigationClick: (view: ViewType, onClick?: () => void) => void,
  setShowSupportPopup: (show: boolean) => void
): NavigationItem[] => [
  {
    name: 'Dashboard',
    icon: Activity,
    active: currentView === 'dashboard',
    onClick: () => handleNavigationClick('dashboard')
  },
  {
    name: 'Operations',
    icon: Settings,
    active: currentView === 'locations' || currentView === 'pods' || currentView === 'reservations',
    isDropdown: true,
    items: [
      {
        name: 'Locations',
        icon: MapPin,
        onClick: () => handleNavigationClick('locations')
      },
      {
        name: 'Pods',
        icon: Package,
        onClick: () => handleNavigationClick('pods')
      },
      {
        name: 'Reservations',
        icon: Calendar,
        onClick: () => handleNavigationClick('reservations')
      }
    ]
  },
  {
    name: 'Users & Network',
    icon: Users,
    active: currentView === 'usersNetwork' || currentView === 'partner' || currentView === 'notification' || currentView === 'payments' || currentView === 'logs' || currentView === 'smsDetails' || currentView === 'emailDetails',
    isDropdown: true,
    items: [
      {
        name: 'Users',
        icon: Users,
        onClick: () => handleNavigationClick('usersNetwork')
      },
      {
        name: 'Partner',
        icon: UserPlus,
        onClick: () => handleNavigationClick('partner')
      },
      {
        name: 'Notification',
        icon: Bell,
        onClick: () => handleNavigationClick('notification')
      },
      {
        name: 'Payments',
        icon: CreditCard,
        onClick: () => handleNavigationClick('payments')
      },
      {
        name: 'Logs',
        icon: FileText,
        onClick: () => handleNavigationClick('logs')
      }
    ]
  },
  {
    name: 'Support',
    icon: HelpCircle,
    onClick: () => setShowSupportPopup(true)
  }
];

