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
import { UserDetail } from "@/services/dashboardApi";

interface RemoveUserPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserDetail;
  onSuccess: () => void;
}

const RemoveUserPopup: React.FC<RemoveUserPopupProps> = ({ open, onOpenChange, user, onSuccess }) => {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const { podcore } = useApiUrl();
  const [loading, setLoading] = useState(false);

  const handleRemove = async () => {
    if (!accessToken) return;

    setLoading(true);
    try {
      const response = await fetch(`${podcore}/users/locations/${user.id}`, {
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

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove User</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>Are you sure you want to remove this user from the location?</p>
            <p className="font-medium text-gray-900">{user.user_name}</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>No</AlertDialogCancel>
          <AlertDialogAction onClick={handleRemove} disabled={loading} className="bg-red-600 hover:bg-red-700">
            {loading ? "Removing..." : "Yes"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RemoveUserPopup;
