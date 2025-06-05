
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

interface AdhocReservationDetailProps {
  reservationId: number;
  onBack: () => void;
}

const AdhocReservationDetail: React.FC<AdhocReservationDetailProps> = ({ reservationId, onBack }) => {
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
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Adhoc Reservation Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Showing details for Adhoc Reservation ID: {reservationId}
          </p>
          <p className="text-gray-500 mt-2">
            This is a placeholder for the adhoc reservation detail page. 
            Add your detailed reservation information here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdhocReservationDetail;
