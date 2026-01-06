import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, User, Edit, Trash2, UserMinus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardApi, UserDetail as UserDetailType, UserLocation, UserReservation } from '@/services/dashboardApi';
import { useToast } from '@/hooks/use-toast';
import NoDataIllustration from '@/components/ui/no-data-illustration';
import EditUserPopup from './EditUserPopup';
import RemoveUserPopup from './RemoveUserPopup';
import DeleteUserPopup from './DeleteUserPopup';

interface UserDetailProps {
  userId: number;
  onBack: () => void;
}

interface LocationMapping {
  id: number;
  location_name: string;
  location_address: string;
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
  const [selectedLocation, setSelectedLocation] = useState<LocationMapping | null>(null);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

        // Fetch user reservations using phone number with ordering
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

  useEffect(() => {
    fetchUserDetails();
  }, [userId, accessToken]);

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
    fetchUserDetails();
  };

  const handleRemoveSuccess = () => {
    fetchUserDetails();
    setSelectedLocation(null);
  };

  const handleDeleteSuccess = () => {
    onBack();
  };

  const handleRemoveClick = (location: UserLocation) => {
    setSelectedLocation({
      id: location.id,
      location_name: location.location_name,
      location_address: location.location_address,
    });
    setShowRemovePopup(true);
  };

  if (loading) {
    return <div className="p-6 space-y-6">
        <Button onClick={onBack} variant="outline" className="flex items-center space-x-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Users</span>
        </Button>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-lg text-muted-foreground">Loading user details...</div>
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
      <Card className="rounded-xl border border-border shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* User Avatar/Icon */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-primary rounded-lg flex items-center justify-center">
                <User className="w-12 h-12 text-primary-foreground" />
              </div>
            </div>

            {/* User Information */}
            <div className="flex-grow">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                User Details: {userDetail.user_name}
              </h2>
              
              {/* Display information in rows */}
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                  <div className="flex">
                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider w-24">Name:</span>
                    <p className="text-foreground font-medium">{formatValue(userDetail.user_name)}</p>
                  </div>
                  <div className="flex">
                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider w-24">Phone:</span>
                    <p className="text-foreground font-medium">{formatValue(userDetail.user_phone)}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                  <div className="flex">
                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider w-24">Email:</span>
                    <p className="text-foreground font-medium">{formatValue(userDetail.user_email)}</p>
                  </div>
                  <div className="flex">
                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider w-24">Type:</span>
                    <p className="text-foreground font-medium">{formatValue(userDetail.user_type)}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                  <div className="flex">
                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider w-24">Flat No:</span>
                    <p className="text-foreground font-medium">{formatValue(userDetail.user_flatno)}</p>
                  </div>
                  <div className="flex">
                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider w-24">Status:</span>
                    <p className="text-foreground font-medium">{formatValue(userDetail.status)}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                  <div className="flex">
                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider w-24">Credit Limit:</span>
                    <p className="text-foreground font-medium">{formatValue(userDetail.user_credit_limit)}</p>
                  </div>
                  <div className="flex">
                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider w-24">Credit Used:</span>
                    <p className="text-foreground font-medium">{formatValue(userDetail.user_credit_used)}</p>
                  </div>
                </div>
                
                <div className="flex">
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider w-24">Created:</span>
                  <p className="text-foreground font-medium">{formatDate(userDetail.created_at)}</p>
                </div>
                
                <div className="flex">
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider w-24">Address:</span>
                  <p className="text-foreground font-medium">{formatValue(userDetail.user_address)}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button 
                  variant="outline" 
                  className="flex items-center space-x-2"
                  onClick={() => setShowEditPopup(true)}
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex items-center space-x-2"
                  onClick={() => setShowDeletePopup(true)}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Locations */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground">Locations</h3>
        {userLocations.length > 0 ? <div className="rounded-xl border border-border overflow-hidden shadow-sm">
            {isMobile ? <div className="space-y-3 p-4">
                {userLocations.map(location => <Card key={location.id} className="border border-border rounded-lg">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-foreground">{location.location_name}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleRemoveClick(location)}
                          >
                            <UserMinus className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">{location.location_address}</p>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Primary: {location.primary_name}</span>
                          <span className="text-muted-foreground">Pincode: {location.location_pincode}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>)}
              </div> : <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground uppercase tracking-wider">Address</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground uppercase tracking-wider">Pincode</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-muted-foreground uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {userLocations.map((location, index) => <tr key={location.id} className={`${index % 2 === 0 ? 'bg-background' : 'bg-muted/30'} hover:bg-muted/50 transition-colors`}>
                        <td className="px-6 py-4 text-sm text-foreground font-medium">{location.location_name}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{location.location_address}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{location.location_pincode}</td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleRemoveClick(location)}
                          >
                            <UserMinus className="w-4 h-4 mr-2" />
                            Remove
                          </Button>
                        </td>
                      </tr>)}
                  </tbody>
                </table>
              </div>}
          </div> : <NoDataIllustration title="No locations found" description="This user has no associated locations." />}
      </div>

      {/* User Reservations */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground">Reservations</h3>
        {userReservations.length > 0 ? <div className="rounded-xl border border-border overflow-hidden shadow-sm">
            {isMobile ? <div className="space-y-3 p-4">
                {userReservations.map(reservation => <Card key={reservation.id} className="border border-border rounded-lg">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-foreground">{reservation.drop_by_name}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${reservation.reservation_status === 'active' ? 'bg-green-100 text-green-800' : 'bg-muted text-muted-foreground'}`}>
                            {reservation.reservation_status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{reservation.location_name}</p>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">By: {reservation.created_by_name}</span>
                          <span className="text-muted-foreground">{formatDate(reservation.created_at)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>)}
              </div> : <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground uppercase tracking-wider">Drop By</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground uppercase tracking-wider">Location</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground uppercase tracking-wider">Created By</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground uppercase tracking-wider">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {userReservations.map((reservation, index) => <tr key={reservation.id} className={`${index % 2 === 0 ? 'bg-background' : 'bg-muted/30'} hover:bg-muted/50 transition-colors`}>
                        <td className="px-6 py-4 text-sm text-foreground font-medium">{reservation.drop_by_name}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{reservation.location_name}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{reservation.created_by_name}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${reservation.reservation_status === 'active' ? 'bg-green-100 text-green-800' : 'bg-muted text-muted-foreground'}`}>
                            {reservation.reservation_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(reservation.created_at)}</td>
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
          {selectedLocation && (
            <RemoveUserPopup 
              open={showRemovePopup} 
              onOpenChange={setShowRemovePopup} 
              locationMapping={selectedLocation}
              onSuccess={handleRemoveSuccess}
            />
          )}
          <DeleteUserPopup 
            open={showDeletePopup} 
            onOpenChange={setShowDeletePopup} 
            user={userDetail}
            onSuccess={handleDeleteSuccess}
          />
        </>
      )}
    </div>;
};

export default UserDetail;