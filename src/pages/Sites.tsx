import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Plus, Search, Factory, Users, Pencil, Trash2, FileText, Building2, Settings, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSites, deleteSite, fetchClients, listSiteModules, listGouvernorats } from "@/lib/multi-tenant-queries";
import { SiteFormModal } from "@/components/SiteFormModal";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Database } from "@/integrations/supabase/types";

type SiteRow = Database["public"]["Tables"]["sites"]["Row"];

const CLASSIFICATIONS = [
  "1ère catégorie",
  "2ème catégorie", 
  "3ème catégorie",
  "ERP",
  "EOP",
  "Non classé",
];

const SECTEURS = [
  "Chimique",
  "Pharmaceutique",
  "Agroalimentaire",
  "Pétrolière",
  "Logistique",
  "Tertiaire",
  "Énergie",
  "Autre",
];

export default function Sites() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterClient, setFilterClient] = useState<string>("all");
  const [filterGouvernorat, setFilterGouvernorat] = useState<string>("all");
  const [filterSecteur, setFilterSecteur] = useState<string>("all");
  const [filterClassification, setFilterClassification] = useState<string>("all");
  const [filterModule, setFilterModule] = useState<string>("all");
  const [siteFormOpen, setSiteFormOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<SiteRow | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: sites, isLoading } = useQuery({
    queryKey: ["sites"],
    queryFn: fetchSites,
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: fetchClients,
  });

  const { data: gouvernorats = [] } = useQuery({
    queryKey: ["gouvernorats"],
    queryFn: listGouvernorats,
  });

  // Component to show active modules for a site
  const SiteModulesBadges = ({ siteId }: { siteId: string }) => {
    const { data: siteModules = [] } = useQuery({
      queryKey: ["site-modules", siteId],
      queryFn: () => listSiteModules(siteId),
    });

    const activeModules = siteModules.filter((sm: any) => sm.enabled);

    if (activeModules.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {activeModules.slice(0, 3).map((sm: any) => (
          <Badge key={sm.id} variant="secondary" className="text-xs">
            <Settings className="h-3 w-3 mr-1" />
            {sm.modules_systeme?.code}
          </Badge>
        ))}
        {activeModules.length > 3 && (
          <Badge variant="outline" className="text-xs">
            +{activeModules.length - 3}
          </Badge>
        )}
      </div>
    );
  };

  const deleteMutation = useMutation({
    mutationFn: deleteSite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sites"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast({ title: "Site supprimé avec succès" });
      setDeletingId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erreur lors de la suppression",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredSites = sites?.filter(site => {
    // Text search
    const matchesSearch = 
      site.nom_site.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.code_site.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (site.gouvernorat && site.gouvernorat.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (site.delegation && site.delegation.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (site.localite && site.localite.toLowerCase().includes(searchQuery.toLowerCase()));

    // Filters
    const matchesClient = filterClient === "all" || site.client_id === filterClient;
    const matchesGouvernorat = filterGouvernorat === "all" || site.gouvernorat === filterGouvernorat;
    const matchesSecteur = filterSecteur === "all" || site.secteur_activite === filterSecteur;
    const matchesClassification = filterClassification === "all" || site.classification === filterClassification;

    return matchesSearch && matchesClient && matchesGouvernorat && matchesSecteur && matchesClassification;
  }) || [];

  const handleEdit = (site: SiteRow) => {
    setEditingSite(site);
    setSiteFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = () => {
    if (deletingId) {
      deleteMutation.mutate(deletingId);
    }
  };

  const handleExportPDF = () => {
    toast({ title: "Export PDF en cours...", description: "Fonctionnalité à venir" });
  };

  const getRisqueBadgeVariant = (risque: string | null) => {
    if (!risque) return "default";
    switch (risque.toLowerCase()) {
      case "critique":
      case "élevé":
        return "destructive";
      case "moyen":
        return "secondary";
      default:
        return "default";
    }
  };

  const totalEffectif = sites?.reduce((sum, site) => sum + (site.effectif || 0), 0) || 0;
  const highRiskSites = sites?.filter(s => s.niveau_risque && ["Critique", "Élevé"].includes(s.niveau_risque)).length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Gestion des Sites</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Gérez tous les sites et établissements
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportPDF}>
            <FileText className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button 
            className="bg-gradient-primary shadow-medium"
            onClick={() => {
              setEditingSite(undefined);
              setSiteFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau site
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <Card className="shadow-soft">
        <CardContent className="pt-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, code, gouvernorat, délégation, localité..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <div>
              <Select value={filterClient} onValueChange={setFilterClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Client" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-50">
                  <SelectItem value="all">Tous les clients</SelectItem>
                  {clients.map((client: any) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.nom_legal}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={filterGouvernorat} onValueChange={setFilterGouvernorat}>
                <SelectTrigger>
                  <SelectValue placeholder="Gouvernorat" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-50 max-h-60 overflow-y-auto">
                  <SelectItem value="all">Tous</SelectItem>
                  {gouvernorats.map((gov: any) => (
                    <SelectItem key={gov.id} value={gov.nom}>
                      {gov.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={filterSecteur} onValueChange={setFilterSecteur}>
                <SelectTrigger>
                  <SelectValue placeholder="Secteur" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-50">
                  <SelectItem value="all">Tous</SelectItem>
                  {SECTEURS.map((secteur) => (
                    <SelectItem key={secteur} value={secteur}>
                      {secteur}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={filterClassification} onValueChange={setFilterClassification}>
                <SelectTrigger>
                  <SelectValue placeholder="Classification" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-50">
                  <SelectItem value="all">Toutes</SelectItem>
                  {CLASSIFICATIONS.map((classif) => (
                    <SelectItem key={classif} value={classif}>
                      {classif}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={filterModule} onValueChange={setFilterModule}>
                <SelectTrigger>
                  <SelectValue placeholder="Module" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-50">
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="VEILLE">VEILLE</SelectItem>
                  <SelectItem value="CONFORMITE">CONFORMITE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {(filterClient !== "all" || filterGouvernorat !== "all" || filterSecteur !== "all" || filterClassification !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterClient("all");
                setFilterGouvernorat("all");
                setFilterSecteur("all");
                setFilterClassification("all");
                setFilterModule("all");
              }}
              className="text-xs"
            >
              <Filter className="h-3 w-3 mr-1" />
              Réinitialiser les filtres
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardDescription>Total sites</CardDescription>
            <CardTitle className="text-3xl">{sites?.length || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardDescription>Effectif total</CardDescription>
            <CardTitle className="text-3xl">{totalEffectif}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardDescription>Sites à risque élevé</CardDescription>
            <CardTitle className="text-3xl text-destructive">{highRiskSites}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardDescription>Résultats filtrés</CardDescription>
            <CardTitle className="text-3xl">{filteredSites.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Sites list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredSites.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredSites.map((site) => (
            <Card 
              key={site.id} 
              className="shadow-soft hover:shadow-medium transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge variant="outline" className="text-xs font-mono">
                        {site.code_site}
                      </Badge>
                      {site.est_siege && (
                        <Badge variant="default" className="text-xs">
                          Siège
                        </Badge>
                      )}
                      {site.niveau_risque && (
                        <Badge variant={getRisqueBadgeVariant(site.niveau_risque)} className="text-xs">
                          {site.niveau_risque}
                        </Badge>
                      )}
                      {site.classification && (
                        <Badge variant="secondary" className="text-xs">
                          {site.classification}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{site.nom_site}</CardTitle>
                    {site.clients && (
                      <CardDescription className="text-xs mt-1 flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {(site.clients as any).nom_legal}
                      </CardDescription>
                    )}
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Factory className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {site.secteur_activite && (
                      <div className="flex items-center gap-2">
                        <Factory className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground truncate">{site.secteur_activite}</span>
                      </div>
                    )}
                    {site.effectif !== null && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{site.effectif} employés</span>
                      </div>
                    )}
                  </div>

                  {(site.gouvernorat || site.delegation || site.localite) && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="text-muted-foreground">
                          {[site.localite, site.delegation, site.gouvernorat]
                            .filter(Boolean)
                            .join(", ")}
                          {site.code_postal && ` · ${site.code_postal}`}
                        </span>
                      </div>
                    </div>
                  )}

                  <SiteModulesBadges siteId={site.id} />

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    {site.responsable_site ? (
                      <span className="text-sm font-medium text-muted-foreground truncate">
                        {site.responsable_site}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">Pas de responsable</span>
                    )}
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(site)}
                        title="Modifier"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(site.id)}
                        className="text-destructive hover:text-destructive"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="shadow-soft">
          <CardContent className="py-12 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              {searchQuery || filterClient !== "all" || filterGouvernorat !== "all" 
                ? "Aucun site ne correspond aux critères de recherche" 
                : "Aucun site enregistré"}
            </p>
            {!searchQuery && filterClient === "all" && filterGouvernorat === "all" && (
              <Button 
                onClick={() => {
                  setEditingSite(undefined);
                  setSiteFormOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer le premier site
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <SiteFormModal
        open={siteFormOpen}
        onOpenChange={(open) => {
          setSiteFormOpen(open);
          if (!open) setEditingSite(undefined);
        }}
        site={editingSite}
      />

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce site ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
