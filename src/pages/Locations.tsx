import React, { useState } from 'react';
import LocationsTable from '@/components/LocationsTable';
import LocationDetail from '@/components/LocationDetail';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

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
        <div className="flex items-center gap-4 mb-4">
          <Button onClick={handleBackToLocations} variant="outline" size="sm" className="flex items-center gap-2 h-8">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
        <LocationDetail locationId={selectedLocationId} onBack={handleBackToLocations} />
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