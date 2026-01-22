import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PaymentProvider } from "@/contexts/PaymentContext";
import Index from "./pages/Index";
import Sales from "./pages/Sales";
import Inventory from "./pages/Inventory";
import Customers from "./pages/Customers";
import AddCustomer from "./pages/AddCustomer";
import Payments from "./pages/Payments";
import Suppliers from "./pages/Suppliers";
import Reports from "./pages/Reports";
import Staff from "./pages/Staff";
import AddStaff from "./pages/AddStaff";
import AddSupplier from "./pages/AddSupplier";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <PaymentProvider>
        <BrowserRouter
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/customers/add" element={<AddCustomer />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/add-staff" element={<AddStaff />} />
            <Route path="/add-supplier" element={<AddSupplier />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </PaymentProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
