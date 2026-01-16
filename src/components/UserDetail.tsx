import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, User, Eye, Edit, Trash2, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardApi, UserDetail as UserDetailType, UserLocation, UserReservation } from '@/services/dashboardApi';
import { useToast } from '@/hooks/use-toast';
import NoDataIllustration from '@/components/ui/no-data-illustration';
import EditUserPopup from './EditUserPopup';
import RemoveUserPopup from './RemoveUserPopup';
import DeleteUserPopup from './DeleteUserPopup';
import AddLocationToUserPopup from './AddLocationToUserPopup';

interface UserDetailProps {
  userId: number;
  onBack: () => void;
}

const UserDetail: React.FC<UserDetailProps> = ({
  userId,
  onBack
}) => {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const [userDetail, setUserDetail] = useState<UserDetailType | null>(null);
  const [userLocations, setUserLocations] = useState<UserLocation[]>([]);
  const [userReservations, setUserReservations] = useState<UserReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showRemovePopup, setShowRemovePopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showAddLocationPopup, setShowAddLocationPopup] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!accessToken) return;
      try {
        setLoading(true);

        // Fetch user detail
        const userDetailData = await dashboardApi.getUserDetail(accessToken, userId);
        setUserDetail(userDetailData);
        if (userDetailData) {
          // Fetch user locations
          const locationsData = await dashboardApi.getUserLocations(accessToken, userId);
          setUserLocations(locationsData);

          // Fetch user reservations using phone number
          const reservationsData = await dashboardApi.getUserReservations(accessToken, userDetailData.user_phone);
          setUserReservations(reservationsData);
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
        toast({
          title: "Error",
          description: "Failed to fetch user details",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetails();
  }, [userId, accessToken, toast]);

  const formatValue = (value: any) => {
    if (value === null || value === undefined || value === '') {
      return 'N/A';
    }
    return value.toString();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const handleEditSuccess = () => {
    // Refresh user details after successful edit
    const fetchUserDetails = async () => {
      if (!accessToken) return;
      try {
        const userDetailData = await dashboardApi.getUserDetail(accessToken, userId);
        setUserDetail(userDetailData);
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };
    fetchUserDetails();
  };

  const handleRemoveSuccess = async () => {
    // Refresh user locations after successful removal
    if (!accessToken) return;
    try {
      const locationsData = await dashboardApi.getUserLocations(accessToken, userId);
      setUserLocations(locationsData);
    } catch (error) {
      console.error('Error fetching user locations:', error);
    }
  };

  const handleDeleteSuccess = () => {
    onBack(); // Go back to users list after successful deletion
  };

  if (loading) {
    return <div className="p-6 space-y-6">
        <Button onClick={onBack} variant="outline" className="flex items-center space-x-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Users</span>
        </Button>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-lg text-gray-500">Loading user details...</div>
        </div>
      </div>;
  }

  if (!userDetail) {
    return <div className="p-6 space-y-6">
        <Button onClick={onBack} variant="outline" className="flex items-center space-x-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Users</span>
        </Button>
        <NoDataIllustration title="User not found" description="The requested user could not be found." />
      </div>;
  }

  return <div className="p-6 space-y-6">
      {/* Back Button */}
      <Button onClick={onBack} variant="outline" className="flex items-center space-x-2">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Users</span>
      </Button>

      {/* User Details Card */}
      <Card className="rounded-xl border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            {/* User Avatar/Icon - smaller on mobile */}
            <div className="flex items-center gap-3 md:block md:flex-shrink-0">
              <div className="w-12 h-12 md:w-24 md:h-24 bg-[#FDDC4E] rounded-lg flex items-center justify-center shrink-0">
                <User className="w-6 h-6 md:w-12 md:h-12 text-gray-600" />
              </div>
              {/* Mobile: Title next to icon */}
              <h2 className="text-lg font-bold text-gray-900 md:hidden">
                {userDetail.user_name}
              </h2>
            </div>

            {/* User Information */}
            <div className="flex-grow min-w-0">
              {/* Desktop: Title */}
              <h2 className="hidden md:block text-2xl font-bold text-gray-900 mb-6">
                User Details: {userDetail.user_name}
              </h2>
              
              {/* Display information in rows */}
              <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                  <div className="flex flex-wrap">
                    <span className="text-xs md:text-sm font-medium text-gray-600 uppercase tracking-wider w-20 md:w-24 shrink-0">Name:</span>
                    <p className="text-gray-900 font-medium text-sm md:text-base break-words min-w-0">{formatValue(userDetail.user_name)}</p>
                  </div>
                  <div className="flex flex-wrap">
                    <span className="text-xs md:text-sm font-medium text-gray-600 uppercase tracking-wider w-20 md:w-24 shrink-0">Phone:</span>
                    <p className="text-gray-900 font-medium text-sm md:text-base break-words min-w-0">{formatValue(userDetail.user_phone)}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                  <div className="flex flex-wrap">
                    <span className="text-xs md:text-sm font-medium text-gray-600 uppercase tracking-wider w-20 md:w-24 shrink-0">Email:</span>
                    <p className="text-gray-900 font-medium text-sm md:text-base break-all min-w-0">{formatValue(userDetail.user_email)}</p>
                  </div>
                  <div className="flex flex-wrap">
                    <span className="text-xs md:text-sm font-medium text-gray-600 uppercase tracking-wider w-20 md:w-24 shrink-0">Type:</span>
                    <p className="text-gray-900 font-medium text-sm md:text-base break-words min-w-0">{formatValue(userDetail.user_type)}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                  <div className="flex flex-wrap">
                    <span className="text-xs md:text-sm font-medium text-gray-600 uppercase tracking-wider w-20 md:w-24 shrink-0">Flat No:</span>
                    <p className="text-gray-900 font-medium text-sm md:text-base break-words min-w-0">{formatValue(userDetail.user_flatno)}</p>
                  </div>
                  <div className="flex flex-wrap">
                    <span className="text-xs md:text-sm font-medium text-gray-600 uppercase tracking-wider w-20 md:w-24 shrink-0">Status:</span>
                    <p className="text-gray-900 font-medium text-sm md:text-base break-words min-w-0">{formatValue(userDetail.status)}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                  <div className="flex flex-wrap">
                    <span className="text-xs md:text-sm font-medium text-gray-600 uppercase tracking-wider w-20 md:w-24 shrink-0">Credit Limit:</span>
                    <p className="text-gray-900 font-medium text-sm md:text-base break-words min-w-0">{formatValue(userDetail.user_credit_limit)}</p>
                  </div>
                  <div className="flex flex-wrap">
                    <span className="text-xs md:text-sm font-medium text-gray-600 uppercase tracking-wider w-20 md:w-24 shrink-0">Credit Used:</span>
                    <p className="text-gray-900 font-medium text-sm md:text-base break-words min-w-0">{formatValue(userDetail.user_credit_used)}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap">
                  <span className="text-xs md:text-sm font-medium text-gray-600 uppercase tracking-wider w-20 md:w-24 shrink-0">Created:</span>
                  <p className="text-gray-900 font-medium text-sm md:text-base break-words min-w-0">{formatDate(userDetail.created_at)}</p>
                </div>
                
                <div className="flex flex-wrap">
                  <span className="text-xs md:text-sm font-medium text-gray-600 uppercase tracking-wider w-20 md:w-24 shrink-0">Address:</span>
                  <p className="text-gray-900 font-medium text-sm md:text-base break-words min-w-0">{formatValue(userDetail.user_address)}</p>
                </div>
              </div>

              {/* Action Buttons - Delete and Add Location on same line for mobile */}
              <div className="flex flex-wrap gap-2 md:gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center space-x-1 md:space-x-2 text-xs md:text-sm"
                  onClick={() => setShowEditPopup(true)}
                >
                  <Edit className="w-3 h-3 md:w-4 md:h-4" />
                  <span>Edit</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center space-x-1 md:space-x-2 text-xs md:text-sm"
                  onClick={() => setShowRemovePopup(true)}
                >
                  <Eye className="w-3 h-3 md:w-4 md:h-4" />
                  <span>Remove</span>
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  className="flex items-center space-x-1 md:space-x-2 text-xs md:text-sm"
                  onClick={() => setShowDeletePopup(true)}
                >
                  <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                  <span>Delete</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center space-x-1 md:space-x-2 bg-[#FDDC4E] hover:bg-yellow-400 text-black border-yellow-400 text-xs md:text-sm"
                  onClick={() => setShowAddLocationPopup(true)}
                >
                  <MapPin className="w-3 h-3 md:w-4 md:h-4" />
                  <span>Add Location</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Locations */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">Locations</h3>
        {userLocations.length > 0 ? (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            {isMobile ? (
              <div className="space-y-3 p-4">
                {userLocations.map(location => (
                  <Card key={location.id} className="border border-gray-200 rounded-lg">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-gray-900">{formatValue(location.location_name)}</h4>
                          <span className="text-sm text-gray-500">#{location.id}</span>
                        </div>
                        <div className="grid grid-cols-1 gap-2 text-sm">
                          <div className="flex">
                            <span className="text-gray-500 w-24">Address:</span>
                            <span className="text-gray-900">{formatValue(location.location_address)}</span>
                          </div>
                          <div className="flex">
                            <span className="text-gray-500 w-24">Pincode:</span>
                            <span className="text-gray-900">{formatValue(location.location_pincode)}</span>
                          </div>
                          <div className="flex">
                            <span className="text-gray-500 w-24">Primary:</span>
                            <span className="text-gray-900">{formatValue(location.primary_name)}</span>
                          </div>
                          <div className="flex">
                            <span className="text-gray-500 w-24">Contact:</span>
                            <span className="text-gray-900">{formatValue(location.primary_contact)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-fixed">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="w-[10%] px-4 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                      <th className="w-[20%] px-4 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                      <th className="w-[30%] px-4 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Address</th>
                      <th className="w-[10%] px-4 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Pincode</th>
                      <th className="w-[15%] px-4 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Primary Name</th>
                      <th className="w-[15%] px-4 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Primary Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {userLocations.map((location, index) => (
                      <tr key={location.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-blue-50/50 transition-colors`}>
                        <td className="px-4 py-4 text-sm text-gray-700">{location.id}</td>
                        <td className="px-4 py-4 text-sm text-gray-900 font-medium">{formatValue(location.location_name)}</td>
                        <td className="px-4 py-4 text-sm text-gray-700">{formatValue(location.location_address)}</td>
                        <td className="px-4 py-4 text-sm text-gray-700">{formatValue(location.location_pincode)}</td>
                        <td className="px-4 py-4 text-sm text-gray-700">{formatValue(location.primary_name)}</td>
                        <td className="px-4 py-4 text-sm text-gray-700">{formatValue(location.primary_contact)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <NoDataIllustration title="No locations found" description="This user has no associated locations." />
        )}
      </div>

      {/* User Reservations */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">Reservations</h3>
        {userReservations.length > 0 ? <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            {isMobile ? <div className="space-y-3 p-4">
                {userReservations.map(reservation => <Card key={reservation.id} className="border border-gray-200 rounded-lg">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-gray-900">{reservation.drop_by_name}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${reservation.reservation_status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {reservation.reservation_status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{reservation.location_name}</p>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">By: {reservation.created_by_name}</span>
                          <span className="text-gray-500">{formatDate(reservation.created_at)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>)}
              </div> : <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Drop By</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Created By</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {userReservations.map((reservation, index) => <tr key={reservation.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-blue-50/50 transition-colors`}>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{reservation.drop_by_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{reservation.location_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{reservation.created_by_name}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${reservation.reservation_status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {reservation.reservation_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{formatDate(reservation.created_at)}</td>
                      </tr>)}
                  </tbody>
                </table>
              </div>}
          </div> : <NoDataIllustration title="No reservations found" description="This user has no reservations." />}
      </div>

      {/* Popups */}
      {userDetail && (
        <>
          <EditUserPopup 
            open={showEditPopup} 
            onOpenChange={setShowEditPopup} 
            user={userDetail}
            onSuccess={handleEditSuccess}
          />
          <RemoveUserPopup 
            open={showRemovePopup} 
            onOpenChange={setShowRemovePopup} 
            user={userDetail}
            locations={userLocations}
            onSuccess={handleRemoveSuccess}
          />
          <DeleteUserPopup 
            open={showDeletePopup} 
            onOpenChange={setShowDeletePopup} 
            user={userDetail}
            onSuccess={handleDeleteSuccess}
          />
          <AddLocationToUserPopup
            isOpen={showAddLocationPopup}
            onClose={() => setShowAddLocationPopup(false)}
            userId={userId}
            onSuccess={handleRemoveSuccess}
          />
        </>
      )}
    </div>;
};

export default UserDetail;