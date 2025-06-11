import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, MapPin, Eye, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardApi, UserDetail as UserDetailType, UserLocation, UserReservation } from '@/services/dashboardApi';
import { useToast } from '@/hooks/use-toast';
import NoDataIllustration from '@/components/ui/no-data-illustration';
interface UserDetailProps {
  userId: number;
  onBack: () => void;
}
const UserDetail: React.FC<UserDetailProps> = ({
  userId,
  onBack
}) => {
  const {
    accessToken
  } = useAuth();
  const {
    toast
  } = useToast();
  const [userDetail, setUserDetail] = useState<UserDetailType | null>(null);
  const [userLocations, setUserLocations] = useState<UserLocation[]>([]);
  const [userReservations, setUserReservations] = useState<UserReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

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
          <div className="flex flex-col lg:flex-row gap-6">
            {/* User Avatar/Icon */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-[#FDDC4E] rounded-lg flex items-center justify-center">
                <div className="w-12 h-12 bg-white rounded-md flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </div>

            {/* User Information */}
            <div className="flex-grow">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                User Details: {userDetail.user_name}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div>
                  <span className="text-sm font-medium text-gray-600 uppercase tracking-wider">Name:</span>
                  <p className="text-gray-900 font-medium">{formatValue(userDetail.user_name)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600 uppercase tracking-wider">Phone:</span>
                  <p className="text-gray-900 font-medium">{formatValue(userDetail.user_phone)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600 uppercase tracking-wider">Email:</span>
                  <p className="text-gray-900 font-medium">{formatValue(userDetail.user_email)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600 uppercase tracking-wider">Type:</span>
                  <p className="text-gray-900 font-medium">{formatValue(userDetail.user_type)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600 uppercase tracking-wider">Flat No:</span>
                  <p className="text-gray-900 font-medium">{formatValue(userDetail.user_flatno)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600 uppercase tracking-wider">Status:</span>
                  <p className="text-gray-900 font-medium">{formatValue(userDetail.status)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600 uppercase tracking-wider">Credit Limit:</span>
                  <p className="text-gray-900 font-medium">{formatValue(userDetail.user_credit_limit)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600 uppercase tracking-wider">Credit Used:</span>
                  <p className="text-gray-900 font-medium">{formatValue(userDetail.user_credit_used)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600 uppercase tracking-wider">Created:</span>
                  <p className="text-gray-900 font-medium">{formatDate(userDetail.created_at)}</p>
                </div>
              </div>

              <div className="mb-6">
                <span className="text-sm font-medium text-gray-600 uppercase tracking-wider">Address:</span>
                <p className="text-gray-900 font-medium">{formatValue(userDetail.user_address)}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" className="flex items-center space-x-2">
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </Button>
                <Button variant="outline" className="flex items-center space-x-2">
                  <Eye className="w-4 h-4" />
                  <span>Remove</span>
                </Button>
                <Button variant="destructive" className="flex items-center space-x-2">
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
        <h3 className="text-xl font-semibold text-gray-900">Locations</h3>
        {userLocations.length > 0 ? <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            {isMobile ? <div className="space-y-3 p-4">
                {userLocations.map(location => <Card key={location.id} className="border border-gray-200 rounded-lg">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-gray-900">{location.location_name}</h4>
                          <span className="text-sm text-gray-500">#{location.id}</span>
                        </div>
                        <p className="text-sm text-gray-600">{location.location_address}</p>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Primary: {location.primary_name}</span>
                          <span className="text-gray-500">Pincode: {location.location_pincode}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>)}
              </div> : <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Address</th>
                      
                      
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Pincode</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {userLocations.map((location, index) => <tr key={location.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-blue-50/50 transition-colors`}>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{location.location_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{location.location_address}</td>
                        
                        
                        <td className="px-6 py-4 text-sm text-gray-700">{location.location_pincode}</td>
                      </tr>)}
                  </tbody>
                </table>
              </div>}
          </div> : <NoDataIllustration title="No locations found" description="This user has no associated locations." />}
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
    </div>;
};
export default UserDetail;