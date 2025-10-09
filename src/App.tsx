import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import ClientDetail from "./pages/ClientDetail";
import Sites from "./pages/Sites";
import SiteDetail from "./pages/SiteDetail";
import VeilleReglementaire from "./pages/VeilleReglementaire";
import BibliothequeTextes from "./pages/BibliothequeTextes";
import BibliothequeTexteDetail from "./pages/BibliothequeTexteDetail";
import BibliothequeTexteArticles from "./pages/BibliothequeTexteArticles";
import BibliothequeArticleVersions from "./pages/BibliothequeArticleVersions";
import DossierReglementaire from "./pages/DossierReglementaire";
import ControlesTechniques from "./pages/ControlesTechniques";
import Incidents from "./pages/Incidents";
import TextesReglementaires from "./pages/TextesReglementaires";
import TexteDetail from "./pages/TexteDetail";
import TexteForm from "./pages/TexteForm";
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
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/clients/:id" element={<ClientDetail />} />
                <Route path="/sites" element={<Sites />} />
                <Route path="/sites/:id" element={<SiteDetail />} />
                <Route path="/actes" element={<TextesReglementaires />} />
                <Route path="/actes/nouveau" element={<TexteForm />} />
                <Route path="/actes/:id" element={<TexteDetail />} />
                <Route path="/actes/:id/editer" element={<TexteForm />} />
                {/* Legacy routes for backward compatibility */}
                <Route path="/textes" element={<TextesReglementaires />} />
                <Route path="/textes/nouveau" element={<TexteForm />} />
                <Route path="/textes/:id" element={<TexteDetail />} />
                <Route path="/textes/:id/editer" element={<TexteForm />} />
                <Route path="/veille" element={<VeilleReglementaire />} />
                <Route path="/veille/bibliotheque" element={<BibliothequeTextes />} />
                <Route path="/veille/bibliotheque/textes/:id" element={<BibliothequeTexteDetail />} />
                <Route path="/veille/bibliotheque/textes/:id/articles" element={<BibliothequeTexteArticles />} />
                <Route path="/veille/bibliotheque/articles/:articleId/versions" element={<BibliothequeArticleVersions />} />
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
