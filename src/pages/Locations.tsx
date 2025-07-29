import React from 'react';
import LocationsTable from '@/components/LocationsTable';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';

const LocationsPage: React.FC = () => {
  const { accessToken } = useAuth();
  
  if (!accessToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to view locations.</p>
        </div>
      </div>
    );
  }

  return (
    <Layout title="Locations Management" breadcrumb="Operations / Locations Management">
      <LocationsTable onLocationClick={(id) => console.log('Location clicked:', id)} />
    </Layout>
  );
};

export default LocationsPage;