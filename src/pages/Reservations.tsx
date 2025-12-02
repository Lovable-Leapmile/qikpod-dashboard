import React, { useState } from 'react';
import Reservations from '@/components/Reservations';
import ReservationDetail from '@/components/ReservationDetail';
import AdhocReservationDetail from '@/components/AdhocReservationDetail';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';

const ReservationsPage: React.FC = () => {
  const { accessToken } = useAuth();
  const [currentView, setCurrentView] = useState<'reservations' | 'reservationDetail' | 'adhocReservationDetail'>('reservations');
  const [selectedReservationId, setSelectedReservationId] = useState<number | null>(null);

  const handleStandardReservationClick = (reservationId: number) => {
    setSelectedReservationId(reservationId);
    setCurrentView('reservationDetail');
  };

  const handleAdhocReservationClick = (reservationId: number) => {
    setSelectedReservationId(reservationId);
    setCurrentView('adhocReservationDetail');
  };

  if (!accessToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to view reservations.</p>
        </div>
      </div>
    );
  }

  if (currentView === 'reservationDetail' && selectedReservationId) {
    return (
      <Layout title="Reservation Details" breadcrumb="Operations / Reservations Management / Reservation Details">
        <ReservationDetail reservationId={selectedReservationId} onBack={() => setCurrentView('reservations')} />
      </Layout>
    );
  }

  if (currentView === 'adhocReservationDetail' && selectedReservationId) {
    return (
      <Layout title="Adhoc Reservation Details" breadcrumb="Operations / Reservations Management / Adhoc Reservation Details">
        <AdhocReservationDetail reservationId={selectedReservationId} onBack={() => setCurrentView('reservations')} />
      </Layout>
    );
  }

  return (
    <Layout title="Reservations Management" breadcrumb="Operations / Reservations Management">
      <Reservations 
        onStandardReservationClick={handleStandardReservationClick}
        onAdhocReservationClick={handleAdhocReservationClick}
        onBack={() => {}}
      />
    </Layout>
  );
};

export default ReservationsPage;