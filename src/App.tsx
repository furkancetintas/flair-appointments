import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { store } from "@/store";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Barbers from "./pages/Barbers";
import BarberProfile from "./pages/BarberProfile";
import NotFound from "./pages/NotFound";
import { AdminLayout } from "./layouts/AdminLayout";
import AdminEarnings from "./pages/admin/AdminEarnings";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AdminServices from "./pages/admin/AdminServices";
import AdminWorkingHours from "./pages/admin/AdminWorkingHours";
import AdminShopStatus from "./pages/admin/AdminShopStatus";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<AuthRoute><Auth /></AuthRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/barbers" element={<ProtectedRoute><Barbers /></ProtectedRoute>} />
      <Route path="/barber/:id" element={<ProtectedRoute><BarberProfile /></ProtectedRoute>} />
      
      {/* Admin Routes */}
      <Route path="/admin/earnings" element={<ProtectedRoute><AdminLayout><AdminEarnings /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/appointments" element={<ProtectedRoute><AdminLayout><AdminAppointments /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/services" element={<ProtectedRoute><AdminLayout><AdminServices /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/working-hours" element={<ProtectedRoute><AdminLayout><AdminWorkingHours /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/shop-status" element={<ProtectedRoute><AdminLayout><AdminShopStatus /></AdminLayout></ProtectedRoute>} />
      
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <TooltipProvider>
              <AppRoutes />
              <Toaster />
              <Sonner />
            </TooltipProvider>
          </AuthProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </Provider>
  );
};

export default App;
