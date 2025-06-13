
import React from 'react';
import { ViewType } from './NavigationItems';
import LocationsTable from './LocationsTable';
import PodsTable from './PodsTable';
import LocationDetail from './LocationDetail';
import PodDetail from './PodDetail';
import Reservations from './Reservations';
import ReservationDetail from './ReservationDetail';
import AdhocReservationDetail from './AdhocReservationDetail';
import UsersNetworkSection from './UsersNetworkSection';
import StatsCards from './StatsCards';

interface DashboardStats {
  locations: number;
  pods: number;
  users: number;
  reservations: number;
}

interface ViewRendererProps {
  currentView: ViewType;
  selectedLocationId: number | null;
  selectedPodId: number | null;
  selectedReservationId: number | null;
  dashboardStats: DashboardStats;
  statsLoading: boolean;
  onLocationClick: (locationId: number) => void;
  onPodClick: (podId: number) => void;
  onStandardReservationClick: (reservationId: number) => void;
  onAdhocReservationClick: (reservationId: number) => void;
  onBackToLocations: () => void;
  onBackToPods: () => void;
  onBackToReservations: () => void;
  onBackToOperations: () => void;
}

const ViewRenderer: React.FC<ViewRendererProps> = ({
  currentView,
  selectedLocationId,
  selectedPodId,
  selectedReservationId,
  dashboardStats,
  statsLoading,
  onLocationClick,
  onPodClick,
  onStandardReservationClick,
  onAdhocReservationClick,
  onBackToLocations,
  onBackToPods,
  onBackToReservations,
  onBackToOperations
}) => {
  switch (currentView) {
    case 'locations':
      return <LocationsTable onLocationClick={onLocationClick} />;
    case 'pods':
      return <PodsTable onPodClick={onPodClick} />;
    case 'reservations':
      return (
        <Reservations
          onBack={onBackToOperations}
          onStandardReservationClick={onStandardReservationClick}
          onAdhocReservationClick={onAdhocReservationClick}
        />
      );
    case 'usersNetwork':
      return <UsersNetworkSection onBack={onBackToOperations} />;
    case 'locationDetail':
      return selectedLocationId ? (
        <LocationDetail locationId={selectedLocationId} onBack={onBackToLocations} />
      ) : null;
    case 'podDetail':
      return selectedPodId ? (
        <PodDetail podId={selectedPodId} onBack={onBackToPods} />
      ) : null;
    case 'reservationDetail':
      return selectedReservationId ? (
        <ReservationDetail reservationId={selectedReservationId} onBack={onBackToReservations} />
      ) : null;
    case 'adhocReservationDetail':
      return selectedReservationId ? (
        <AdhocReservationDetail reservationId={selectedReservationId} onBack={onBackToReservations} />
      ) : null;
    default:
      return (
        <div className="space-y-4">
          <StatsCards dashboardStats={dashboardStats} statsLoading={statsLoading} />
          <div className="space-y-6">
            <LocationsTable onLocationClick={onLocationClick} />
            <PodsTable onPodClick={onPodClick} />
          </div>
        </div>
      );
  }
};

export default ViewRenderer;
