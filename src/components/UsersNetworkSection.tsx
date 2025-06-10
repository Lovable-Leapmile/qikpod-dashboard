
import React from 'react';
import { useUsersData } from '@/hooks/useUsersData';
import UsersAgGrid from './UsersAgGrid';

interface UsersNetworkSectionProps {
  onBack: () => void;
}

const UsersNetworkSection: React.FC<UsersNetworkSectionProps> = ({ onBack }) => {
  const { users, loading, refetchUsers } = useUsersData();

  const handleUserClick = (userId: number) => {
    console.log('Navigate to user detail:', userId);
    // TODO: Implement user detail navigation
  };

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
