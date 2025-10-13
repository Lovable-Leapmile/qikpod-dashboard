import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Send, RotateCcw } from "lucide-react";

interface CreateUserPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locationId: number;
  onSuccess: () => void;
}

const CreateUserPopup: React.FC<CreateUserPopupProps> = ({ open, onOpenChange, locationId, onSuccess }) => {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    userType: "",
    email: "@gmail.com",
    phone: "",
    address: "",
    flatNo: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userTypeOptions = ["QPStaff", "Customer", "SiteSecurity", "SiteAdmin", "DeliveryExec"];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNameChange = (value: string) => {
    // Allow only alphabets and spaces
    const alphabetOnly = value.replace(/[^a-zA-Z\s]/g, "");
    handleInputChange("name", alphabetOnly);
  };

  const handlePhoneChange = (value: string) => {
    // Allow only numerics
    const numericOnly = value.replace(/[^0-9]/g, "");
    handleInputChange("phone", numericOnly);
  };

  const handleFlatNoChange = (value: string) => {
    // Allow only numerics
    const numericOnly = value.replace(/[^0-9]/g, "");
    handleInputChange("flatNo", numericOnly);
  };

  const handleEmailChange = (value: string) => {
    // Ensure it always ends with @gmail.com
    let emailValue = value;
    if (!emailValue.includes("@gmail.com")) {
      emailValue = emailValue.replace(/@.*$/, "") + "@gmail.com";
    }
    handleInputChange("email", emailValue);
  };

  const clearAll = () => {
    setFormData({
      name: "",
      userType: "",
      email: "@gmail.com",
      phone: "",
      address: "",
      flatNo: "",
    });
  };

  const handleSubmit = async () => {
    if (!accessToken || !formData.name || !formData.userType || !formData.phone) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`http://productionv36.qikpod.com/podcore/users/${locationId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          user_name: formData.name,
          user_email: formData.email,
          user_phone: formData.phone,
          user_type: formData.userType,
          location_address: formData.address,
          user_flatno: formData.flatNo,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "User created successfully",
        });
        onSuccess();
        onOpenChange(false);
        clearAll();
      } else {
        throw new Error("Failed to create user");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        title: "Error",
        description: "Failed to create user",
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
          <DialogTitle>Create New User</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Name *</label>
            <Input value={formData.name} onChange={(e) => handleNameChange(e.target.value)} placeholder="Enter name" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">User Type *</label>
            <Select value={formData.userType} onValueChange={(value) => handleInputChange("userType", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select user type" />
              </SelectTrigger>
              <SelectContent>
                {userTypeOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Email</label>
            <Input
              value={formData.email}
              onChange={(e) => handleEmailChange(e.target.value)}
              placeholder="username@gmail.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Phone *</label>
            <Input
              value={formData.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Address</label>
            <Input
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="Enter address"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Flat No</label>
            <Input
              value={formData.flatNo}
              onChange={(e) => handleFlatNoChange(e.target.value)}
              placeholder="Enter flat number"
            />
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={clearAll}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear All
            </Button>
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

export default CreateUserPopup;
