
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, MapPin } from 'lucide-react';

interface LocationDetailProps {
  locationId: number;
  onBack: () => void;
}

const LocationDetail: React.FC<LocationDetailProps> = ({ locationId, onBack }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Locations</span>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Location Details</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-yellow-500" />
            Location ID: {locationId}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Location detail page for ID: {locationId}
            </p>
            <p className="text-gray-400 mt-2">
              This page will show detailed information about the selected location.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationDetail;
