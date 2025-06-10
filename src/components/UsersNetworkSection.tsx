
import React, { useState } from 'react';
import { Users as UsersIcon, UserPlus, Bell, ArrowLeft } from 'lucide-react';
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
        return <UsersTable onBack={() => setCurrentSubView('users')} />;
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
      {/* Back Button */}
      <Button
        onClick={onBack}
        variant="outline"
        className="flex items-center space-x-2 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </Button>

      {/* Header with title */}
      <div className="flex items-center space-x-3 mb-6">
        <UsersIcon className="w-6 h-6 text-gray-700" />
        <h2 className="text-2xl font-bold text-gray-900">Users & Network</h2>
      </div>

      {/* Sub-header navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {subHeaderItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setCurrentSubView(item.key)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                currentSubView === item.key
                  ? 'border-[#FDDC4E] text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Dynamic content based on selected sub-view */}
      {renderSubView()}
    </div>
  );
};

export default UsersNetworkSection;
