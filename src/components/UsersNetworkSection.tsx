
import React, { useState } from 'react';
import { Users as UsersIcon, UserPlus, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UsersTable from './UsersTable';

type SubView = 'users' | 'partner' | 'notification';

interface UsersNetworkSectionProps {
  onBack: () => void;
}

const UsersNetworkSection: React.FC<UsersNetworkSectionProps> = ({ onBack }) => {
  const [currentSubView, setCurrentSubView] = useState<SubView>('users');

  const subHeaderItems = [
    {
      name: 'Users',
      key: 'users' as SubView,
      icon: UsersIcon,
    },
    {
      name: 'Partner',
      key: 'partner' as SubView,
      icon: UserPlus,
    },
    {
      name: 'Notification',
      key: 'notification' as SubView,
      icon: Bell,
    },
  ];

  const renderSubView = () => {
    switch (currentSubView) {
      case 'users':
        return <UsersTable onBack={onBack} />;
      case 'partner':
        return (
          <div className="flex items-center justify-center min-h-96 text-gray-500">
            <div className="text-center">
              <UserPlus className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">Partner management coming soon</p>
            </div>
          </div>
        );
      case 'notification':
        return (
          <div className="flex items-center justify-center min-h-96 text-gray-500">
            <div className="text-center">
              <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">Notification center coming soon</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-header buttons */}
      <div className="flex flex-wrap gap-4">
        {subHeaderItems.map((item) => (
          <Button
            key={item.key}
            onClick={() => setCurrentSubView(item.key)}
            variant={currentSubView === item.key ? 'default' : 'outline'}
            className={`flex items-center space-x-2 ${
              currentSubView === item.key
                ? 'bg-[#FDDC4E] hover:bg-yellow-400 text-black'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <item.icon className="w-4 h-4" />
            <span>{item.name}</span>
          </Button>
        ))}
      </div>

      {/* Dynamic content based on selected sub-view */}
      {renderSubView()}
    </div>
  );
};

export default UsersNetworkSection;
