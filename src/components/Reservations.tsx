
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import ReservationsTable from './ReservationsTable';

interface ReservationsProps {
  onBack: () => void;
  onStandardReservationClick: (reservationId: number) => void;
  onAdhocReservationClick: (reservationId: number) => void;
}

const Reservations: React.FC<ReservationsProps> = ({ 
  onBack, 
  onStandardReservationClick,
  onAdhocReservationClick 
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Operations
        </Button>
      </div>
      
      <ReservationsTable 
        onStandardReservationClick={onStandardReservationClick}
        onAdhocReservationClick={onAdhocReservationClick}
      />
    </div>
  );
};

export default Reservations;
