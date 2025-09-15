import React, { useState } from 'react';
import LocationsTable from '@/components/LocationsTable';
import LocationDetail from '@/components/LocationDetail';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';

const LocationsPage: React.FC = () => {
  const { accessToken } = useAuth();
  const [currentView, setCurrentView] = useState<'locations' | 'locationDetail'>('locations');
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);

  const handleLocationClick = (locationId: number) => {
    setSelectedLocationId(locationId);
    setCurrentView('locationDetail');
  };

  const handleBackToLocations = () => {
    setCurrentView('locations');
    setSelectedLocationId(null);
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

  if (currentView === 'locationDetail' && selectedLocationId) {
    return (
      <Layout title="Location Details" breadcrumb="Operations / Locations Management / Location Details">
        <div className="px-1"> {/* Added 4px padding (px-1 = 4px) */}
          <LocationDetail locationId={selectedLocationId} onBack={handleBackToLocations} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Locations Management" breadcrumb="Operations / Locations Management">
      <div className="px-1"> {/* Added 4px padding (px-1 = 4px) */}
        <LocationsTable onLocationClick={handleLocationClick} />
      </div>
    </Layout>
  );
};

export default LocationsPage;