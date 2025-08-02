import React from 'react';
import Reservations from '@/components/Reservations';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ReservationsPage: React.FC = () => {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const handleStandardReservationClick = (reservationId: number) => {
    navigate(`/reservations/standard/${reservationId}`);
  };

  const handleAdhocReservationClick = (reservationId: number) => {
    navigate(`/reservations/adhoc/${reservationId}`);
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

  return (
    <Layout title="Reservations Management" breadcrumb="Operations / Reservations Management">
      <Reservations 
        onStandardReservationClick={handleStandardReservationClick}
        onAdhocReservationClick={handleAdhocReservationClick}
        onBack={() => window.history.back()}
      />
    </Layout>
  );
};

export default ReservationsPage;