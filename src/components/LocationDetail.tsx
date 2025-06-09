
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, MapPin, Users, Package, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardApi, LocationDetail as LocationDetailType } from '@/services/dashboardApi';
import LocationReservationsTable from './LocationReservationsTable';
import AssignFeBdPopup from './AssignFeBdPopup';
import CreateUserPopup from './CreateUserPopup';
import PaymentModePopup from './PaymentModePopup';
import EditLocationPopup from './EditLocationPopup';

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
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Locations</span>
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
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Locations</span>
          </Button>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500">Location not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Locations</span>
        </Button>
      </div>

      {/* Location Details Card */}
      <Card className="bg-white shadow-sm rounded-xl border-gray-200">
        <CardHeader className="pb-6 pt-8">
          <div className="flex items-start space-x-4">
            <div className="w-32 h-40 bg-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0">
              <img 
                src="/lovable-uploads/10ae1ee2-d8e4-4863-8041-f983e231b5a3.png" 
                alt="Qikpod Logo"
                className="w-20 h-auto"
              />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold text-gray-900 mb-4">
                Location Details: {locationDetail.location_name}
              </CardTitle>
              
              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                <div>
                  <span className="text-gray-600 font-medium">PRIMARY NAME:</span>
                  <span className="ml-4 text-gray-900">{formatValue(locationDetail.primary_name)}</span>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">RESERVATIONS:</span>
                  <span className="ml-4 text-gray-900">338</span>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">PAYMENT MODE:</span>
                  <span className="ml-4 text-gray-900">{formatValue(locationDetail.payment_mode)}</span>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">CONTACT:</span>
                  <span className="ml-4 text-gray-900">{formatValue(locationDetail.primary_contact)}</span>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">PODS:</span>
                  <span className="ml-4 text-gray-900">0</span>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">USERS:</span>
                  <span className="ml-4 text-gray-900">114</span>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">PINCODE:</span>
                  <span className="ml-4 text-gray-900">{formatValue(locationDetail.location_pincode)}</span>
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <span className="text-gray-600 font-medium">ADDRESS:</span>
                  <span className="ml-4 text-gray-900">{formatValue(locationDetail.location_address)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-8">
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            <Button 
              variant="outline" 
              className="rounded-lg"
              onClick={() => setShowAssignFeBdPopup(true)}
            >
              Assign FE/BD
            </Button>
            <Button 
              variant="outline" 
              className="rounded-lg"
              onClick={() => setShowCreateUserPopup(true)}
            >
              Create User
            </Button>
            <Button 
              variant="outline" 
              className="rounded-lg"
              onClick={() => setShowPaymentModePopup(true)}
            >
              Payment Mode
            </Button>
            <Button 
              variant="outline" 
              className="rounded-lg"
              onClick={() => setShowEditLocationPopup(true)}
            >
              Edit
            </Button>
            <Button variant="destructive" className="rounded-lg">
              Delete
            </Button>
          </div>

          {/* Hide/Show Toggle */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => setShowHiddenSection(!showHiddenSection)}
              className="flex items-center space-x-2 text-gray-600"
            >
              {showHiddenSection ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showHiddenSection ? 'Hide' : 'Show More Details'}</span>
            </Button>
          </div>

          {/* Additional Details (Hidden by default) */}
          {showHiddenSection && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm border-t pt-6">
              <div>
                <span className="text-gray-600 font-medium">STATUS:</span>
                <span className="ml-2 text-gray-900">{formatValue(locationDetail.status)}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">PRIMARY FE:</span>
                <span className="ml-2 text-gray-900">{formatValue(locationDetail.primary_fe)}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">PRIMARY BD:</span>
                <span className="ml-2 text-gray-900">{formatValue(locationDetail.primary_bd)}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">SECONDARY NAME:</span>
                <span className="ml-2 text-gray-900">{formatValue(locationDetail.secondary_name)}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">SECONDARY FE:</span>
                <span className="ml-2 text-gray-900">{formatValue(locationDetail.secondary_fe)}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">SECONDARY CONTACT:</span>
                <span className="ml-2 text-gray-900">{formatValue(locationDetail.secondary_contact)}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">LATITUDE:</span>
                <span className="ml-2 text-gray-900">{formatValue(locationDetail.map_latitude)}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">LONGITUDE:</span>
                <span className="ml-2 text-gray-900">{formatValue(locationDetail.map_longitude)}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">STATE:</span>
                <span className="ml-2 text-gray-900">{formatValue(locationDetail.location_state)}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">DOCS STATUS:</span>
                <span className="ml-2 text-gray-900">{formatValue(locationDetail.docs_status)}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">BD TAG:</span>
                <span className="ml-2 text-gray-900">{formatValue(locationDetail.bd_tag)}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">BD DETAILS:</span>
                <span className="ml-2 text-gray-900">{formatValue(locationDetail.bd_details)}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">CREATED AT:</span>
                <span className="ml-2 text-gray-900">{formatValue(locationDetail.created_at)}</span>
              </div>
              <div>
                <span className="text-gray-600 font-medium">UPDATED AT:</span>
                <span className="ml-2 text-gray-900">{formatValue(locationDetail.updated_at)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reservations Tables */}
      <LocationReservationsTable 
        locationId={locationId}
        onStandardReservationClick={onStandardReservationClick}
        onAdhocReservationClick={onAdhocReservationClick}
      />

      {/* Popups */}
      <AssignFeBdPopup
        open={showAssignFeBdPopup}
        onOpenChange={setShowAssignFeBdPopup}
        locationId={locationId}
        initialValues={{
          primary_fe: locationDetail.primary_fe,
          secondary_fe: locationDetail.secondary_fe,
          primary_bd: locationDetail.primary_bd,
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
