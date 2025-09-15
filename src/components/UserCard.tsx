import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, User, Phone, Mail, Building } from 'lucide-react';
import { User as UserType } from '@/services/dashboardApi';

interface UserCardProps {
  user: UserType;
  onUserClick: (userId: number) => void;
}

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString();
};

const UserCard: React.FC<UserCardProps> = ({ user, onUserClick }) => {
  return (
    <Card className="mb-3 bg-white shadow-sm hover:shadow-md transition-shadow rounded-xl">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 pr-3">
            <div className="flex items-center space-x-2 mb-2">
              <User className="w-4 h-4 text-gray-500" />
              <h3 className="font-semibold text-lg text-gray-900">{user.user_name}</h3>
            </div>
            <div className="inline-block px-2 py-1 bg-gray-100 rounded-md text-xs font-medium text-gray-700 mb-2">
              {user.user_type}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onUserClick(user.id)}
            className="h-8 w-8 p-0 hover:bg-[#FDDC4E]/20 hover:text-gray-900 transition-colors shrink-0"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <Phone className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{user.user_phone}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600 break-all">{user.user_email}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Building className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Flat {user.user_flatno}</span>
          </div>
          <div className="pt-1 border-t border-gray-100">
            <span className="text-xs text-gray-500">Created: {formatDate(user.created_at)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserCard;