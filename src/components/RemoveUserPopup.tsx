import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useApiUrl } from "@/hooks/useApiUrl";
import { UserDetail, UserLocation } from "@/services/dashboardApi";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RemoveUserPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserDetail;
  locations: UserLocation[];
  onSuccess: () => void;
}

const RemoveUserPopup: React.FC<RemoveUserPopupProps> = ({ open, onOpenChange, user, locations, onSuccess }) => {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const { podcore } = useApiUrl();
  const [loading, setLoading] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string>("");

  const handleRemove = async () => {
    if (!accessToken || !selectedLocationId) return;

    setLoading(true);
    try {
      const response = await fetch(`${podcore}/users/locations/${selectedLocationId}`, {
        method: "DELETE",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "User removed from location successfully",
        });
        onSuccess();
        onOpenChange(false);
        setSelectedLocationId("");
      } else {
        throw new Error("Failed to remove user from location");
      }
    } catch (error) {
      console.error("Error removing user from location:", error);
      toast({
        title: "Error",
        description: "Failed to remove user from location",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedLocationId("");
    }
    onOpenChange(isOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove User from Location</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>Select the location to remove <span className="font-medium text-gray-900">{user.user_name}</span> from:</p>
            {locations.length > 0 ? (
              <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id.toString()}>
                      {location.location_name} - {location.primary_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-gray-500">No locations associated with this user.</p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleRemove} 
            disabled={loading || !selectedLocationId || locations.length === 0} 
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? "Removing..." : "Remove"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RemoveUserPopup;
