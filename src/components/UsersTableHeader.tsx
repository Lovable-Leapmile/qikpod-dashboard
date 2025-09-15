import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface UsersTableHeaderProps {
  onAddUser: () => void;
}

const UsersTableHeader: React.FC<UsersTableHeaderProps> = ({ onAddUser }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Users Management</h3>
        <p className="text-sm text-gray-500">Manage all users in your network</p>
      </div>
      <Button
        onClick={onAddUser}
        className="bg-[#FDDC4E] hover:bg-yellow-400 text-black flex items-center space-x-2"
      >
        <Plus className="w-4 h-4" />
        <span>Add User</span>
      </Button>
    </div>
  );
};

export default UsersTableHeader;