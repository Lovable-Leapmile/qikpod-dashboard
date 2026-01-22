import React, { useState } from 'react';
import LocationsTable from '@/components/LocationsTable';
import LocationDetail from '@/components/LocationDetail';
import PodDetail from '@/components/PodDetail';
import UserDetail from '@/components/UserDetail';
import ReservationDetail from '@/components/ReservationDetail';
import AdhocReservationDetail from '@/components/AdhocReservationDetail';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';

type ViewType = 'locations' | 'locationDetail' | 'podDetail' | 'userDetail' | 'reservationDetail' | 'adhocReservationDetail';

const LocationsPage: React.FC = () => {
  const { accessToken } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('locations');
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [selectedPodId, setSelectedPodId] = useState<number | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedReservationId, setSelectedReservationId] = useState<number | null>(null);

  const handleLocationClick = (locationId: number) => {
    setSelectedLocationId(locationId);
    setCurrentView('locationDetail');
  };

  const handlePodClick = (podId: number) => {
    setSelectedPodId(podId);
    setCurrentView('podDetail');
  };

  const handleUserClick = (userId: number) => {
    setSelectedUserId(userId);
    setCurrentView('userDetail');
  };

  const handleStandardReservationClick = (reservationId: number) => {
    setSelectedReservationId(reservationId);
    setCurrentView('reservationDetail');
  };

  const handleAdhocReservationClick = (reservationId: number) => {
    setSelectedReservationId(reservationId);
    setCurrentView('adhocReservationDetail');
  };

  const handleBackToLocationDetail = () => {
    setCurrentView('locationDetail');
  };

  if (!accessToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to view locations.</p>
        </div>
      </div>
    );
  }

  if (currentView === 'podDetail' && selectedPodId) {
    return (
      <Layout title="Pod Details" breadcrumb="Operations / Locations / Pod Details">
        <PodDetail podId={selectedPodId} onBack={handleBackToLocationDetail} />
      </Layout>
    );
  }

  if (currentView === 'userDetail' && selectedUserId) {
    return (
      <Layout title="User Details" breadcrumb="Operations / Locations / User Details">
        <UserDetail userId={selectedUserId} onBack={handleBackToLocationDetail} />
      </Layout>
    );
  }

  if (currentView === 'reservationDetail' && selectedReservationId) {
    return (
      <Layout title="Reservation Details" breadcrumb="Operations / Locations / Reservation Details">
        <ReservationDetail reservationId={selectedReservationId} onBack={handleBackToLocationDetail} />
      </Layout>
    );
  }

  if (currentView === 'adhocReservationDetail' && selectedReservationId) {
    return (
      <Layout title="Adhoc Reservation Details" breadcrumb="Operations / Locations / Adhoc Reservation Details">
        <AdhocReservationDetail reservationId={selectedReservationId} onBack={handleBackToLocationDetail} />
      </Layout>
    );
  }

  if (currentView === 'locationDetail' && selectedLocationId) {
    return (
      <Layout title="Location Details" breadcrumb="Operations / Locations Management / Location Details">
        <LocationDetail
          locationId={selectedLocationId}
          onBack={() => setCurrentView('locations')}
          onPodClick={handlePodClick}
          onUserClick={handleUserClick}
          onStandardReservationClick={handleStandardReservationClick}
          onAdhocReservationClick={handleAdhocReservationClick}
        />
      </Layout>
    );
  }

  return (
    <Layout title="Locations Management" breadcrumb="Operations / Locations Management">
      <LocationsTable onLocationClick={handleLocationClick} />
    </Layout>
  );
};

export default LocationsPage;