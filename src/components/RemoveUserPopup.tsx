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

interface LocationMapping {
  id: number;
  location_name: string;
}

interface RemoveUserPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locationMapping: LocationMapping;
  onSuccess: () => void;
}

const RemoveUserPopup: React.FC<RemoveUserPopupProps> = ({
  open,
  onOpenChange,
  locationMapping,
  onSuccess,
}) => {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const { podcore } = useApiUrl();
  const [loading, setLoading] = useState(false);

  const handleRemove = async () => {
    if (!accessToken) return;

    setLoading(true);
    try {
      const response = await fetch(`${podcore}/users/locations/${locationMapping.id}`, {
        method: "DELETE",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `User removed from ${locationMapping.location_name} successfully`,
        });
        onSuccess();
        onOpenChange(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to remove user from location");
      }
    } catch (error) {
      console.error("Error removing user from location:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove user from location",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove User from Location</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>Are you sure you want to remove this user from the location?</p>
            <p className="font-medium text-foreground">{locationMapping.location_name}</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRemove}
            disabled={loading}
            className="bg-destructive hover:bg-destructive/90"
          >
            {loading ? "Removing..." : "Remove"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RemoveUserPopup;
