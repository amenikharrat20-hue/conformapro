import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Dashboard from "./pages/Dashboard";
import VeilleReglementaire from "./pages/VeilleReglementaire";
import DossierReglementaire from "./pages/DossierReglementaire";
import ControlesTechniques from "./pages/ControlesTechniques";
import Incidents from "./pages/Incidents";
import ComingSoon from "./pages/ComingSoon";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="flex min-h-screen w-full bg-background">
            <AppSidebar />
            <main className="flex-1 p-8">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/veille" element={<VeilleReglementaire />} />
                <Route path="/dossier" element={<DossierReglementaire />} />
                <Route path="/controles" element={<ControlesTechniques />} />
                <Route path="/incidents" element={<Incidents />} />
                <Route path="/audits" element={<ComingSoon title="Audits & Inspections" description="Gestion des audits, inspections et checklists de conformité" />} />
                <Route path="/formations" element={<ComingSoon title="Formations & Compétences" description="Suivi des formations réglementaires et habilitations du personnel" />} />
                <Route path="/epi" element={<ComingSoon title="EPI & Équipements" description="Registre des équipements de protection individuelle et dotations" />} />
                <Route path="/prestataires" element={<ComingSoon title="Prestataires & Sous-traitants" description="Gestion des contrats et conformité des prestataires externes" />} />
                <Route path="/permis" element={<ComingSoon title="Permis de travail" description="Système électronique de permis de travail et accès visiteurs" />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
