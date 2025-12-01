import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useApiUrl } from "@/hooks/useApiUrl";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";

interface AssignFeBdPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locationId: number;
  initialValues: {
    primary_fe: string | null;
    secondary_fe: string | null;
    primary_bd: string | null;
  };
  onSuccess: () => void;
}

const AssignFeBdPopup: React.FC<AssignFeBdPopupProps> = ({
  open,
  onOpenChange,
  locationId,
  initialValues,
  onSuccess,
}) => {
  const { accessToken } = useAuth();
  const apiUrl = useApiUrl();
  const { toast } = useToast();
  const [primaryFe, setPrimaryFe] = useState(initialValues.primary_fe || "");
  const [secondaryFe, setSecondaryFe] = useState(initialValues.secondary_fe || "");
  const [primaryBd, setPrimaryBd] = useState(initialValues.primary_bd || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const feOptions = ["Pradeep", "Sridhar", "Bhargav", "Santhosh", "Vipin"];
  const bdOptions = ["Corporate", "Maruthi", "Charnesh"];

  useEffect(() => {
    setPrimaryFe(initialValues.primary_fe || "");
    setSecondaryFe(initialValues.secondary_fe || "");
    setPrimaryBd(initialValues.primary_bd || "");
  }, [initialValues]);

  const handleSubmit = async () => {
    if (!accessToken) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${apiUrl.podcore}/locations/${locationId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          primary_fe: primaryFe || null,
          secondary_fe: secondaryFe || null,
          primary_bd: primaryBd || null,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "FE/BD assignments updated successfully",
        });
        onSuccess();
        onOpenChange(false);
      } else {
        throw new Error("Failed to update assignments");
      }
    } catch (error) {
      console.error("Error updating FE/BD assignments:", error);
      toast({
        title: "Error",
        description: "Failed to update FE/BD assignments",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign FE/BD</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Primary FE</label>
            <Select value={primaryFe} onValueChange={setPrimaryFe}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Primary FE" />
              </SelectTrigger>
              <SelectContent>
                {feOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Secondary FE</label>
            <Select value={secondaryFe} onValueChange={setSecondaryFe}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Secondary FE" />
              </SelectTrigger>
              <SelectContent>
                {feOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Primary BD</label>
            <Select value={primaryBd} onValueChange={setPrimaryBd}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Primary BD" />
              </SelectTrigger>
              <SelectContent>
                {bdOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-[#FDDC4E] hover:bg-yellow-400 text-black"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignFeBdPopup;
