import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, MapPin, Users, Package, Eye, EyeOff, Smartphone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardApi, LocationDetail as LocationDetailType } from '@/services/dashboardApi';
import LocationReservationsTable from './LocationReservationsTable';
import AssignFeBdPopup from './AssignFeBdPopup';
import CreateUserPopup from './CreateUserPopup';
import PaymentModePopup from './PaymentModePopup';
import EditLocationPopup from './EditLocationPopup';
import { useMediaQuery } from '@/hooks/use-media-query';

interface LocationDetailProps {
  locationId: number;
  onBack: () => void;
  onStandardReservationClick?: (reservationId: number) => void;
  onAdhocReservationClick?: (reservationId: number) => void;
}

const LocationDetail: React.FC<LocationDetailProps> = ({
  locationId,
  onBack,
  onStandardReservationClick,
  onAdhocReservationClick
}) => {
  const { accessToken } = useAuth();
  const [locationDetail, setLocationDetail] = useState<LocationDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHiddenSection, setShowHiddenSection] = useState(false);
  const [showAssignFeBdPopup, setShowAssignFeBdPopup] = useState(false);
  const [showCreateUserPopup, setShowCreateUserPopup] = useState(false);
  const [showPaymentModePopup, setShowPaymentModePopup] = useState(false);
  const [showEditLocationPopup, setShowEditLocationPopup] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const fetchLocationDetail = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const data = await dashboardApi.getLocationDetail(accessToken, locationId);
      setLocationDetail(data);
    } catch (error) {
      console.error('Error fetching location detail:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocationDetail();
  }, [locationId, accessToken]);

  const formatValue = (value: any): string => {
    if (value === null || value === undefined || value === 'null' || value === '') {
      return 'N/A';
    }
    return String(value);
  };

  const handlePopupSuccess = () => {
    fetchLocationDetail();
  };

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Locations</span>
          </Button>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500">Loading location details...</p>
        </div>
      </div>
    );
  }

  if (!locationDetail) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Locations</span>
          </Button>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500">Location not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Navigation */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Locations</span>
        </Button>
      </div>

      {/* Location Details Card */}
      <Card className="bg-white shadow-sm rounded-xl border-gray-200">
        <CardHeader className="pb-6 pt-8">
          <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-4">
            <div className="w-full md:w-32 h-32 md:h-40 bg-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0 mx-auto md:mx-0">
              <img
                alt="Qikpod Logo"
                src="/lovable-uploads/cb0256d6-2513-4ed8-af3c-637c2631975d.png"
                className="w-10 h-auto object-fill"
              />
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                Location Details: {locationDetail.location_name}
              </CardTitle>

              {/* Details Grid - Updated layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 text-sm">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <span className="text-gray-600 font-medium min-w-[120px]">PRIMARY NAME:</span>
                    <span className="ml-2 text-gray-900">{formatValue(locationDetail.primary_name)}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-600 font-medium min-w-[120px]">CONTACT:</span>
                    <span className="ml-2 text-gray-900">{formatValue(locationDetail.primary_contact)}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <span className="text-gray-600 font-medium min-w-[120px]">PINCODE:</span>
                    <span className="ml-2 text-gray-900">{formatValue(locationDetail.location_pincode)}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-600 font-medium min-w-[120px]">RESERVATIONS:</span>
                    <span className="ml-2 text-gray-900">338</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <span className="text-gray-600 font-medium min-w-[120px]">PODS:</span>
                    <span className="ml-2 text-gray-900">0</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-600 font-medium min-w-[120px]">USERS:</span>
                    <span className="ml-2 text-gray-900">114</span>
                  </div>
                </div>

                <div className="md:col-span-2 lg:col-span-3">
                  <div className="flex items-start mt-4">
                    <span className="text-gray-600 font-medium min-w-[120px]">ADDRESS:</span>
                    <span className="ml-2 text-gray-900">{formatValue(locationDetail.location_address)}</span>
                  </div>
                  <div className="flex items-center mt-4">
                    <span className="text-gray-600 font-medium min-w-[120px]">PAYMENT MODE:</span>
                    <span className="ml-2 text-gray-900">{formatValue(locationDetail.payment_mode)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-8">
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 md:gap-3 mb-6 justify-center md:justify-start">
            <Button variant="outline" className="rounded-lg text-xs md:text-sm" onClick={() => setShowAssignFeBdPopup(true)}>
              Assign FE/BD
            </Button>
            <Button variant="outline" className="rounded-lg text-xs md:text-sm" onClick={() => setShowCreateUserPopup(true)}>
              Create User
            </Button>
            <Button variant="outline" className="rounded-lg text-xs md:text-sm" onClick={() => setShowPaymentModePopup(true)}>
              Payment Mode
            </Button>
            <Button variant="outline" className="rounded-lg text-xs md:text-sm" onClick={() => setShowEditLocationPopup(true)}>
              Edit
            </Button>
            <Button variant="destructive" className="rounded-lg text-xs md:text-sm">
              Delete
            </Button>
          </div>

          {/* Hide/Show Toggle */}
          <div className="mb-6 text-center md:text-left">
            <Button variant="ghost" onClick={() => setShowHiddenSection(!showHiddenSection)} className="flex items-center space-x-2 text-gray-600 mx-auto md:mx-0">
              {showHiddenSection ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showHiddenSection ? 'Hide' : 'Show More Details'}</span>
            </Button>
          </div>

          {/* Additional Details (Hidden by default) */}
          {showHiddenSection && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 text-sm border-t pt-6">
              <div className="flex items-center">
                <span className="text-gray-600 font-medium min-w-[120px]">STATUS:</span>
                <span className="ml-2 text-gray-900">{formatValue(locationDetail.status)}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 font-medium min-w-[120px]">PRIMARY FE:</span>
                <span className="ml-2 text-gray-900">{formatValue(locationDetail.primary_fe)}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 font-medium min-w-[120px]">PRIMARY BD:</span>
                <span className="ml-2 text-gray-900">{formatValue(locationDetail.primary_bd)}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 font-medium min-w-[120px]">SECONDARY NAME:</span>
                <span className="ml-2 text-gray-900">{formatValue(locationDetail.secondary_name)}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 font-medium min-w-[120px]">SECONDARY FE:</span>
                <span className="ml-2 text-gray-900">{formatValue(locationDetail.secondary_fe)}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 font-medium min-w-[120px]">SECONDARY CONTACT:</span>
                <span className="ml-2 text-gray-900">{formatValue(locationDetail.secondary_contact)}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 font-medium min-w-[120px]">LATITUDE:</span>
                <span className="ml-2 text-gray-900">{formatValue(locationDetail.map_latitude)}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 font-medium min-w-[120px]">LONGITUDE:</span>
                <span className="ml-2 text-gray-900">{formatValue(locationDetail.map_longitude)}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 font-medium min-w-[120px]">STATE:</span>
                <span className="ml-2 text-gray-900">{formatValue(locationDetail.location_state)}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 font-medium min-w-[120px]">DOCS STATUS:</span>
                <span className="ml-2 text-gray-900">{formatValue(locationDetail.docs_status)}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 font-medium min-w-[120px]">BD TAG:</span>
                <span className="ml-2 text-gray-900">{formatValue(locationDetail.bd_tag)}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 font-medium min-w-[120px]">BD DETAILS:</span>
                <span className="ml-2 text-gray-900">{formatValue(locationDetail.bd_details)}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 font-medium min-w-[120px]">CREATED AT:</span>
                <span className="ml-2 text-gray-900">{formatValue(locationDetail.created_at)}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 font-medium min-w-[120px]">UPDATED AT:</span>
                <span className="ml-2 text-gray-900">{formatValue(locationDetail.updated_at)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reservations Card */}
      <Card className="bg-white shadow-sm rounded-xl border-gray-200">
        <CardHeader>
          <CardTitle>Reservations</CardTitle>
        </CardHeader>
        <CardContent>
          <LocationReservationsTable
            locationId={locationId}
            isMobile={isMobile}
            onStandardReservationClick={onStandardReservationClick}
            onAdhocReservationClick={onAdhocReservationClick}
          />
        </CardContent>
      </Card>

      {/* Popups */}
      <AssignFeBdPopup
        open={showAssignFeBdPopup}
        onOpenChange={setShowAssignFeBdPopup}
        locationId={locationId}
        initialValues={{
          primary_fe: locationDetail.primary_fe,
          secondary_fe: locationDetail.secondary_fe,
          primary_bd: locationDetail.primary_bd
        }}
        onSuccess={handlePopupSuccess}
      />

      <CreateUserPopup
        open={showCreateUserPopup}
        onOpenChange={setShowCreateUserPopup}
        locationId={locationId}
        onSuccess={handlePopupSuccess}
      />

      <PaymentModePopup
        open={showPaymentModePopup}
        onOpenChange={setShowPaymentModePopup}
        locationId={locationId}
        initialValue={locationDetail.payment_mode}
        onSuccess={handlePopupSuccess}
      />

      <EditLocationPopup
        open={showEditLocationPopup}
        onOpenChange={setShowEditLocationPopup}
        locationId={locationId}
        onSuccess={handlePopupSuccess}
      />
    </div>
  );
};

export default LocationDetail;