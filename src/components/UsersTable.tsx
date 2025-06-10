
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useUsersData } from '@/hooks/useUsersData';
import UsersTableHeader from './UsersTableHeader';
import UsersTableControls from './UsersTableControls';
import UsersGrid from './UsersGrid';
import AddUserPopup from './AddUserPopup';

interface UsersTableProps {
  onBack: () => void;
}

const UsersTable: React.FC<UsersTableProps> = ({ onBack }) => {
  const { toast } = useToast();
  const { users, loading, refetchUsers } = useUsersData();
  const [searchText, setSearchText] = useState('');
  const [pageSize, setPageSize] = useState(25);
  const [showAddUserPopup, setShowAddUserPopup] = useState(false);

  const handleUserClick = (userId: number) => {
    console.log('Navigate to user detail:', userId);
    // TODO: Implement user detail navigation
  };

  const handleAddUserSuccess = () => {
    refetchUsers();
    setShowAddUserPopup(false);
    toast({
      title: "Success",
      description: "User added successfully",
    });
  };

  return (
    <div className="space-y-4">
      <UsersTableHeader onAddUser={() => setShowAddUserPopup(true)} />

      <UsersTableControls
        searchText={searchText}
        onSearchChange={setSearchText}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
      />

      <UsersGrid
        users={users}
        loading={loading}
        searchText={searchText}
        pageSize={pageSize}
        onUserClick={handleUserClick}
      />

      <AddUserPopup
        open={showAddUserPopup}
        onOpenChange={setShowAddUserPopup}
        onSuccess={handleAddUserSuccess}
      />
    </div>
  );
};

export default UsersTable;
