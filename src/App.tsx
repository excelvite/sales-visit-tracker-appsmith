
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { AuthWrapper } from "@/components/AuthWrapper";
import { Layout } from "@/components/Layout";

import Dashboard from "./pages/Dashboard";
import Visits from "./pages/Visits";
import VisitNew from "./pages/VisitNew";
import Stores from "./pages/Stores";
import VeterinaryClinics from "./pages/VeterinaryClinics";
import StoreDetail from "./pages/StoreDetail";
import StoreNew from "./pages/StoreNew";
import StoreEdit from "./pages/StoreEdit";
import VisitEdit from "./pages/VisitEdit";
import Reports from "./pages/Reports";
import Team from "./pages/Team";
import WeeklyUpdates from "./pages/WeeklyUpdates";
import ProfileSettings from "./pages/ProfileSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AuthWrapper>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/visits" element={<Visits />} />
                <Route path="/visits/new" element={<VisitNew />} />
                <Route path="/visits/:visitId/edit" element={<VisitEdit />} />
                <Route path="/stores" element={<Stores />} />
                <Route path="/veterinary-clinics" element={<VeterinaryClinics />} />
                <Route path="/stores/:storeId" element={<StoreDetail />} />
                <Route path="/stores/:storeId/edit" element={<StoreEdit />} />
                <Route path="/stores/new" element={<StoreNew />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/team" element={<Team />} />
                <Route path="/weekly-updates" element={<WeeklyUpdates />} />
                <Route path="/profile" element={<ProfileSettings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </AuthWrapper>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
