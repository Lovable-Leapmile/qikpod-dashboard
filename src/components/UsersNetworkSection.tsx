
import React, { useState } from 'react';
import { useUsersData } from '@/hooks/useUsersData';
import UsersAgGrid from './UsersAgGrid';
import UserDetail from './UserDetail';

interface UsersNetworkSectionProps {
  onBack: () => void;
}

const UsersNetworkSection: React.FC<UsersNetworkSectionProps> = ({ onBack }) => {
  const { users, loading, refetchUsers } = useUsersData();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const handleUserClick = (userId: number) => {
    console.log('Navigate to user detail:', userId);
    setSelectedUserId(userId);
  };

  const handleBackToUsers = () => {
    setSelectedUserId(null);
  };

  if (selectedUserId) {
    return <UserDetail userId={selectedUserId} onBack={handleBackToUsers} />;
  }

  return (
    <UsersAgGrid
      users={users}
      loading={loading}
      onBack={onBack}
      onUserClick={handleUserClick}
      onRefreshUsers={refetchUsers}
    />
  );
};

export default UsersNetworkSection;
