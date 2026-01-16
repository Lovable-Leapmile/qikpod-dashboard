import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useApiUrl } from '@/hooks/useApiUrl';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface Location {
  id: number;
  location_name: string;
}

interface AddLocationToUserPopupProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  onSuccess: () => void;
}

const AddLocationToUserPopup: React.FC<AddLocationToUserPopupProps> = ({
  isOpen,
  onClose,
  userId,
  onSuccess
}) => {
  const { accessToken } = useAuth();
  const apiUrl = useApiUrl();
  const { toast } = useToast();
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [fetchingLocations, setFetchingLocations] = useState(false);

  useEffect(() => {
    const fetchLocations = async () => {
      if (!accessToken || !isOpen) return;
      
      try {
        setFetchingLocations(true);
        const response = await fetch(`${apiUrl.podcore}/locations/?order_by_field=updated_at&order_by_type=DESC`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setLocations(data);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      } finally {
        setFetchingLocations(false);
      }
    };

    fetchLocations();
  }, [accessToken, apiUrl.podcore, isOpen]);

  const handleSubmit = async () => {
    if (!selectedLocationId) {
      toast({
        title: "Error",
        description: "Please select a location",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${apiUrl.podcore}/users/locations/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
          location_id: parseInt(selectedLocationId)
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Location added to user successfully"
        });
        onSuccess();
        onClose();
        setSelectedLocationId('');
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast({
          title: "Error",
          description: errorData.detail || "Failed to add location to user",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error adding location to user:', error);
      toast({
        title: "Error",
        description: "Failed to add location to user",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Location to User</DialogTitle>
          <DialogDescription>
            Select a location to add to this user.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={fetchingLocations ? "Loading locations..." : "Select a location"} />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.id.toString()}>
                  {location.location_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !selectedLocationId}
            className="bg-[#FDDC4E] hover:bg-yellow-400 text-black"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Location'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddLocationToUserPopup;
