import React from 'react';
import Reservations from '@/components/Reservations';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';

const ReservationsPage: React.FC = () => {
  const { accessToken } = useAuth();
  
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
        onStandardReservationClick={(id) => console.log('Standard reservation clicked:', id)}
        onAdhocReservationClick={(id) => console.log('Adhoc reservation clicked:', id)}
        onBack={() => window.history.back()}
      />
    </Layout>
  );
};

export default ReservationsPage;