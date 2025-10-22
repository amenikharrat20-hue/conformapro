import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Plus, Search, MapPin, Factory, Eye, Pencil, Trash2, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchClients, fetchSites, deleteClient } from "@/lib/multi-tenant-queries";
import { ClientFormModal } from "@/components/ClientFormModal";
import { SitesDrawer } from "@/components/SitesDrawer";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Database } from "@/integrations/supabase/types";

type ClientRow = Database["public"]["Tables"]["clients"]["Row"];

export default function Clients() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statutFilter, setStatutFilter] = useState<string>("all");
  const [abonnementFilter, setAbonnementFilter] = useState<string>("all");
  const [clientFormOpen, setClientFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientRow | undefined>();
  const [sitesDrawerOpen, setSitesDrawerOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<{ id: string; name: string; color?: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: clients, isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: fetchClients,
  });

  const { data: allSites } = useQuery({
    queryKey: ["sites"],
    queryFn: fetchSites,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast({ title: "Client supprimé avec succès" });
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

  const getSitesCount = (clientId: string) => {
    return allSites?.filter(site => site.client_id === clientId).length || 0;
  };

  const filteredClients = clients?.filter(client => {
    const matchesSearch = 
      client.nom_legal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.secteur && client.secteur.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatut = statutFilter === "all" || client.statut === statutFilter;
    const matchesAbonnement = abonnementFilter === "all" || client.abonnement_type === abonnementFilter;
    
    return matchesSearch && matchesStatut && matchesAbonnement;
  }) || [];

  const handleEdit = (client: ClientRow) => {
    setEditingClient(client);
    setClientFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = () => {
    if (deletingId) {
      deleteMutation.mutate(deletingId);
    }
  };

  const handleViewSites = (client: ClientRow) => {
    setSelectedClient({ 
      id: client.id, 
      name: client.nom_legal,
      color: client.couleur_primaire || undefined
    });
    setSitesDrawerOpen(true);
  };

  const handleExportPDF = () => {
    toast({ title: "Export PDF en cours...", description: "Fonctionnalité à venir" });
  };

  const activeClients = clients?.filter(c => c.statut === "actif").length || 0;
  const totalSites = allSites?.length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Gestion des Clients</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Gérez vos clients et leurs sites
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
              setEditingClient(undefined);
              setClientFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau client
          </Button>
        </div>
      </div>

      {/* Search and filters */}
      <Card className="shadow-soft">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou secteur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statutFilter} onValueChange={setStatutFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border z-50">
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="actif">Actif</SelectItem>
                <SelectItem value="inactif">Inactif</SelectItem>
                <SelectItem value="suspendu">Suspendu</SelectItem>
              </SelectContent>
            </Select>
            <Select value={abonnementFilter} onValueChange={setAbonnementFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Abonnement" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border z-50">
                <SelectItem value="all">Tous les abonnements</SelectItem>
                <SelectItem value="essentiel">Essentiel</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="entreprise">Entreprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardDescription>Total clients</CardDescription>
            <CardTitle className="text-3xl">{clients?.length || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardDescription>Clients actifs</CardDescription>
            <CardTitle className="text-3xl text-success">{activeClients}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardDescription>Sites totaux</CardDescription>
            <CardTitle className="text-3xl">{totalSites}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardDescription>Résultats filtrés</CardDescription>
            <CardTitle className="text-3xl">{filteredClients.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Clients list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredClients.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client) => {
            const brandColor = client.couleur_primaire || "#0066CC";
            const sitesCount = getSitesCount(client.id);
            
            return (
              <Card 
                key={client.id} 
                className="shadow-soft hover:shadow-medium transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div 
                        className="h-12 w-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${brandColor}20` }}
                      >
                        <Building2 className="h-6 w-6" style={{ color: brandColor }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{client.nom_legal}</CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {client.rne_rc || "Pas de RNE"}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      {client.statut && (
                        <Badge 
                          variant={client.statut === "actif" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {client.statut}
                        </Badge>
                      )}
                      {client.abonnement_type && (
                        <Badge variant="outline" className="text-xs capitalize">
                          {client.abonnement_type}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {client.secteur && (
                      <div className="flex items-center gap-2 text-sm">
                        <Factory className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{client.secteur}</span>
                      </div>
                    )}
                    {client.gouvernorat && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{client.gouvernorat}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <span className="text-sm text-muted-foreground">
                        {sitesCount} site{sitesCount > 1 ? 's' : ''}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewSites(client)}
                          title="Voir les sites"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(client)}
                          title="Modifier"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(client.id)}
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
            );
          })}
        </div>
      ) : (
        <Card className="shadow-soft">
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              {searchQuery || statutFilter !== "all" || abonnementFilter !== "all" 
                ? "Aucun client ne correspond aux filtres" 
                : "Aucun client enregistré"}
            </p>
            {!searchQuery && statutFilter === "all" && abonnementFilter === "all" && (
              <Button 
                onClick={() => {
                  setEditingClient(undefined);
                  setClientFormOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer le premier client
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <ClientFormModal
        open={clientFormOpen}
        onOpenChange={(open) => {
          setClientFormOpen(open);
          if (!open) setEditingClient(undefined);
        }}
        client={editingClient}
      />

      {selectedClient && (
        <SitesDrawer
          open={sitesDrawerOpen}
          onOpenChange={setSitesDrawerOpen}
          clientId={selectedClient.id}
          clientName={selectedClient.name}
          brandColor={selectedClient.color}
        />
      )}

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce client ? Tous les sites associés seront également supprimés. Cette action est irréversible.
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
