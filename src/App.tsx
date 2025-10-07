import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Provider } from "react-redux";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { store } from "@/store";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import MyAppointments from "./pages/MyAppointments";
import Barbers from "./pages/Barbers";
import BarberProfile from "./pages/BarberProfile";
import NotFound from "./pages/NotFound";
import { AdminLayout } from "./layouts/AdminLayout";
import AdminEarnings from "./pages/admin/AdminEarnings";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AdminServices from "./pages/admin/AdminServices";
import AdminWorkingHours from "./pages/admin/AdminWorkingHours";
import AdminShopStatus from "./pages/admin/AdminShopStatus";
import AdminSettings from "./pages/admin/AdminSettings";

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
  const { user, profile, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (user) {
    // Redirect based on role
    if (profile?.role === 'barber') {
      return <Navigate to="/admin/earnings" replace />;
    }
    return <Navigate to="/my-appointments" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAuthRoute = location.pathname === '/auth';

  return (
    <>
      {!isAdminRoute && !isAuthRoute && <Header />}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<AuthRoute><Auth /></AuthRoute>} />
        <Route path="/my-appointments" element={<ProtectedRoute><MyAppointments /></ProtectedRoute>} />
        <Route path="/barbers" element={<ProtectedRoute><Barbers /></ProtectedRoute>} />
        <Route path="/barber/:slug" element={<ProtectedRoute><BarberProfile /></ProtectedRoute>} />
        
        {/* Admin Routes */}
        <Route path="/admin/earnings" element={<ProtectedRoute><AdminLayout><AdminEarnings /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/appointments" element={<ProtectedRoute><AdminLayout><AdminAppointments /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/services" element={<ProtectedRoute><AdminLayout><AdminServices /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/working-hours" element={<ProtectedRoute><AdminLayout><AdminWorkingHours /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/shop-status" element={<ProtectedRoute><AdminLayout><AdminShopStatus /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute><AdminLayout><AdminSettings /></AdminLayout></ProtectedRoute>} />
        
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
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
