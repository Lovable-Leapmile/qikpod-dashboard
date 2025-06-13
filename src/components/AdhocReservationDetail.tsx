
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardApi, AdhocReservationDetail } from '@/services/dashboardApi';

interface AdhocReservationDetailProps {
  reservationId: number;
  onBack: () => void;
}

const AdhocReservationDetailComponent: React.FC<AdhocReservationDetailProps> = ({ reservationId, onBack }) => {
  const { accessToken } = useAuth();
  const [reservation, setReservation] = useState<AdhocReservationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMoreDetails, setShowMoreDetails] = useState(false);

  useEffect(() => {
    const fetchReservationDetail = async () => {
      if (!accessToken) return;
      setLoading(true);
      try {
        const data = await dashboardApi.getAdhocReservationDetail(accessToken, reservationId);
        setReservation(data);
      } catch (error) {
        console.error('Error fetching adhoc reservation detail:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReservationDetail();
  }, [reservationId, accessToken]);

  const handleCancelReservation = () => {
    console.log('Cancelling reservation:', reservationId);
    // Implement cancel reservation functionality here
  };

  const handleResendPickupOTP = () => {
    console.log('Resending pickup OTP for reservation:', reservationId);
    // Implement resend pickup OTP functionality here
  };

  const handleResendDropOTP = () => {
    console.log('Resending drop OTP for reservation:', reservationId);
    // Implement resend drop OTP functionality here
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Reservations
        </Button>
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-500">Loading reservation details...</div>
        </div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Reservations
        </Button>
        <Card className="bg-white shadow-sm rounded-xl border-gray-200">
          <CardContent className="p-8">
            <p className="text-gray-600">Reservation not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Reservations
        </Button>
      </div>
      
      <Card className="bg-white shadow-sm rounded-xl border-gray-200">
        <CardHeader className="pb-6">
          <CardTitle className="text-xl font-semibold text-gray-900">
            Adhoc Reservation Details - ID: {reservation.id}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Important Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Status</label>
              <p className="text-lg font-semibold text-gray-900">{reservation.reservation_status}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Pod Name</label>
              <p className="text-lg font-semibold text-gray-900">{reservation.pod_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">User Phone</label>
              <p className="text-lg font-semibold text-gray-900">{reservation.user_phone}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Drop Time</label>
              <p className="text-lg font-semibold text-gray-900">{reservation.drop_time}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Pickup Time</label>
              <p className="text-lg font-semibold text-gray-900">{reservation.pickup_time}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Payment</label>
              <p className="text-lg font-semibold text-gray-900">{reservation.payment_mode}</p>
              <p className="text-sm text-gray-600">{reservation.payment_status}</p>
            </div>
          </div>

          {/* OTP Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">OTP Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <label className="text-sm font-medium text-blue-700 uppercase tracking-wide">Drop OTP</label>
                <p className="text-2xl font-bold text-blue-900 font-mono">{reservation.drop_otp}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <label className="text-sm font-medium text-green-700 uppercase tracking-wide">Pickup OTP</label>
                <p className="text-2xl font-bold text-green-900 font-mono">{reservation.pickup_otp}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <label className="text-sm font-medium text-orange-700 uppercase tracking-wide">RTO OTP</label>
                <p className="text-2xl font-bold text-orange-900 font-mono">{reservation.rto_otp}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t pt-6">
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleCancelReservation} variant="destructive">
                Cancel Reservation
              </Button>
              <Button onClick={handleResendPickupOTP} className="bg-green-600 hover:bg-green-700">
                Resend Pickup OTP
              </Button>
              <Button onClick={handleResendDropOTP} className="bg-blue-600 hover:bg-blue-700">
                Resend Drop OTP
              </Button>
            </div>
          </div>

          {/* Show More Details */}
          <div className="border-t pt-6">
            <Button
              variant="ghost"
              onClick={() => setShowMoreDetails(!showMoreDetails)}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              {showMoreDetails ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Hide Details
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Show More Details
                </>
              )}
            </Button>

            {showMoreDetails && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">RTO Pickup Time</label>
                  <p className="text-sm text-gray-900">{reservation.rto_picktime}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Payment Amount</label>
                  <p className="text-sm text-gray-900">₹{reservation.payment_amount}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Created At</label>
                  <p className="text-sm text-gray-900">{new Date(reservation.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Updated At</label>
                  <p className="text-sm text-gray-900">{new Date(reservation.updated_at).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Location ID</label>
                  <p className="text-sm text-gray-900">{reservation.location_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Pod ID</label>
                  <p className="text-sm text-gray-900">{reservation.pod_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">User ID</label>
                  <p className="text-sm text-gray-900">{reservation.user_id}</p>
                </div>
                {reservation.notes && (
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Notes</label>
                    <p className="text-sm text-gray-900">{reservation.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdhocReservationDetailComponent;
