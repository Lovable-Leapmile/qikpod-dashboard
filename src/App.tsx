import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import DashboardPage from "./pages/Dashboard";
import PodsPage from "./pages/Pods";
import LocationsPage from "./pages/Locations";
import ReservationsPage from "./pages/Reservations";
import UsersPage from "./pages/Users";
import PartnerPage from "./pages/Partner";
import NotificationsPage from "./pages/Notifications";
import SMSDetailsPage from "./pages/SMSDetails";
import EmailDetailsPage from "./pages/EmailDetails";
import PaymentsPage from "./pages/Payments";
import LogsPage from "./pages/Logs";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/locations" element={<LocationsPage />} />
            <Route path="/pods" element={<PodsPage />} />
            <Route path="/reservations" element={<ReservationsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/partner" element={<PartnerPage />} />
            <Route path="/notification" element={<NotificationsPage />} />
            <Route path="/notification/sms/:recordId" element={<SMSDetailsPage />} />
            <Route path="/notification/email/:recordId" element={<EmailDetailsPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/logs" element={<LogsPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
