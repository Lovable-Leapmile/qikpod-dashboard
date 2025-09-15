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
  return <div className="space-y-6">
      {/* Back Button */}
      <div className="mb-2">
        <Button onClick={onBack} variant="outline" size="sm" className="flex items-center gap-2 h-8">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>
      
      <ReservationsTable onStandardReservationClick={onStandardReservationClick} onAdhocReservationClick={onAdhocReservationClick} />
    </div>;
};
export default Reservations;