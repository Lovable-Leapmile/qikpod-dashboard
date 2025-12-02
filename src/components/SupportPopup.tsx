import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Send, X, Mail, Copy, ExternalLink, LifeBuoy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SupportPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const SupportPopup: React.FC<SupportPopupProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fromEmail: "",
    name: "",
    phone: "",
    details: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [showEmailTemplate, setShowEmailTemplate] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === "phone") {
      const numericValue = value.replace(/[^0-9]/g, "");
      setFormData((prev) => ({ ...prev, [field]: numericValue }));
    } else if (field === "fromEmail") {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (value && !validateEmail(value)) {
        setEmailError("Please enter a valid email address");
      } else {
        setEmailError("");
      }
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const generateEmailContent = () => {
    const subject = `Support Request from ${formData.name} (${formData.fromEmail})`;
    const emailBody = `Hi Support Team,

I am reaching out for assistance with the following:

From: ${formData.fromEmail}
Name: ${formData.name}
Phone: ${formData.phone}

Details:
${formData.details}

Submitted on: ${new Date().toLocaleString()}

Please get back to me at your earliest convenience.

Thank you!`;

    return { subject, emailBody };
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to Clipboard",
        description: "Email content has been copied to your clipboard.",
      });
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      toast({
        title: "Copy Failed",
        description: "Please manually copy the email content.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fromEmail.trim() || !formData.name.trim() || !formData.phone.trim() || !formData.details.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(formData.fromEmail)) {
      setEmailError("Please enter a valid email address");
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { subject, emailBody } = generateEmailContent();
      const mailtoLink = `mailto:magesh.thalamurugan@qikpod.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
      const link = document.createElement("a");
      link.href = mailtoLink;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setShowEmailTemplate(true);

      toast({
        title: "Email Client Opened",
        description: "If your email client didn't open, you can copy the email content below and send it manually.",
      });
    } catch (error) {
      console.error("Error opening email client:", error);
      setShowEmailTemplate(true);
      toast({
        title: "Email Client Not Available",
        description: "Please copy the email content below and send it manually.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackupEmailSend = () => {
    const { subject, emailBody } = generateEmailContent();
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=magesh.thalamurugan@qikpod.com&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(gmailUrl, "_blank");

    toast({
      title: "Gmail Opened",
      description: "Gmail web interface has been opened in a new tab.",
    });
  };

  const resetForm = () => {
    setFormData({ fromEmail: "", name: "", phone: "", details: "" });
    setEmailError("");
    setShowEmailTemplate(false);
    onClose();
  };

  if (showEmailTemplate) {
    const { subject, emailBody } = generateEmailContent();

    return (
      <Dialog open={isOpen} onOpenChange={resetForm}>
        <DialogContent className="sm:max-w-2xl w-full mx-4 max-height-[90vh] overflow-y-auto">
          {/* ... unchanged code ... */}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md w-full mx-4">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <LifeBuoy className="h-6 w-6 text-gray-700" />
            Support
          </DialogTitle>
        </DialogHeader>

        {/* --- FORM BELOW REMAINS COMPLETELY UNCHANGED --- */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* From Address */}
          <div className="space-y-2">
            <Label htmlFor="fromEmail" className="text-sm font-medium text-gray-700">
              From Address
            </Label>
            <div className="relative">
              <Input
                id="fromEmail"
                type="email"
                value={formData.fromEmail}
                onChange={(e) => handleInputChange("fromEmail", e.target.value)}
                placeholder="Enter your email address"
                className={`focus:ring-2 focus:ring-[#FDDC4E] focus:border-[#FDDC4E] ${emailError ? "border-red-500" : ""}`}
                required
              />
              <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            {emailError && <p className="text-sm text-red-500">{emailError}</p>}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Name
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter your full name"
              className="focus:ring-2 focus:ring-[#FDDC4E] focus:border-[#FDDC4E]"
              required
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
              Phone
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="Enter your phone number"
              className="focus:ring-2 focus:ring-[#FDDC4E] focus:border-[#FDDC4E]"
              required
            />
          </div>

          {/* Details */}
          <div className="space-y-2">
            <Label htmlFor="details" className="text-sm font-medium text-gray-700">
              Details
            </Label>
            <Textarea
              id="details"
              value={formData.details}
              onChange={(e) => handleInputChange("details", e.target.value)}
              placeholder="Please describe your issue or question in detail..."
              className="min-h-[100px] focus:ring-2 focus:ring-[#FDDC4E] focus:border-[#FDDC4E]"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !!emailError}
              className="flex-1 bg-[#FDDC4E] hover:bg-yellow-400 text-black"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? "Sending..." : "Submit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SupportPopup;
