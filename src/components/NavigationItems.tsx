
import { Activity, Settings, MapPin, Package, Calendar, Users, UserPlus, Bell, CreditCard, FileText, Map, HelpCircle } from 'lucide-react';

export type ViewType = 'dashboard' | 'locations' | 'pods' | 'reservations' | 'locationDetail' | 'podDetail' | 'reservationDetail' | 'adhocReservationDetail' | 'usersNetwork' | 'partner';

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
    active: currentView === 'usersNetwork' || currentView === 'partner',
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
        onClick: () => {} // TODO: Implement notification functionality
      }
    ]
  },
  {
    name: 'System & Finance',
    icon: Settings,
    isDropdown: true,
    items: [
      {
        name: 'Payments',
        icon: CreditCard,
        onClick: () => {} // TODO: Implement payments functionality
      },
      {
        name: 'Logs',
        icon: FileText,
        onClick: () => {} // TODO: Implement logs functionality
      },
      {
        name: 'FE Map',
        icon: Map,
        onClick: () => {} // TODO: Implement FE Map functionality
      }
    ]
  },
  {
    name: 'Support',
    icon: HelpCircle,
    onClick: () => setShowSupportPopup(true)
  }
];
