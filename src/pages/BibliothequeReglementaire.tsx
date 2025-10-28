import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { 
  Search, 
  Plus,
  Download,
  Upload,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Scale,
  Filter,
  X
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { textesReglementairesQueries, TexteReglementaire } from "@/lib/textes-queries";
import { domainesQueries, sousDomainesQueries } from "@/lib/actes-queries";
import { searchQueries } from "@/lib/bibliotheque-queries";
import { toast } from "sonner";
import { TexteFormModal } from "@/components/TexteFormModal";
import { ImportCSVDialog } from "@/components/ImportCSVDialog";
import * as XLSX from 'xlsx';

const TYPE_LABELS = {
  LOI: "Loi",
  ARRETE: "Arrêté",
  DECRET: "Décret",
  CIRCULAIRE: "Circulaire",
};

export default function BibliothequeReglementaire() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [domaineFilter, setDomaineFilter] = useState<string>("all");
  const [sousDomaineFilter, setSousDomaineFilter] = useState<string>("all");
  const [statutFilter, setStatutFilter] = useState<string>("all");
  const [anneeFilter, setAnneeFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("date_publication");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showFormModal, setShowFormModal] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [editingTexte, setEditingTexte] = useState<TexteReglementaire | null>(null);
  const [deleteTexteId, setDeleteTexteId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(true);
  const pageSize = 25;

  const { data: domainesList } = useQuery({
    queryKey: ["domaines"],
    queryFn: () => domainesQueries.getActive(),
  });

  const { data: sousDomainesList } = useQuery({
    queryKey: ["sous-domaines", domaineFilter],
    queryFn: () => domaineFilter !== "all" ? sousDomainesQueries.getActive(domaineFilter) : Promise.resolve([]),
    enabled: domaineFilter !== "all",
  });

  const { data: result, isLoading, error } = useQuery({
    queryKey: ["textes-reglementaires", searchTerm, typeFilter, domaineFilter, sousDomaineFilter, statutFilter, anneeFilter, page, sortBy, sortOrder],
    queryFn: () =>
      textesReglementairesQueries.getAll({
        searchTerm,
        typeFilter: typeFilter !== "all" ? typeFilter : undefined,
        statutFilter: statutFilter !== "all" ? statutFilter : undefined,
        domaineFilter: domaineFilter !== "all" ? domaineFilter : undefined,
        sousDomaineFilter: sousDomaineFilter !== "all" ? sousDomaineFilter : undefined,
        anneeFilter: anneeFilter !== "all" ? anneeFilter : undefined,
        page,
        pageSize,
        sortBy,
        sortOrder,
      }),
  });

  if (error) {
    toast.error("Erreur lors du chargement des textes réglementaires");
  }

  const deleteMutation = useMutation({
    mutationFn: (id: string) => textesReglementairesQueries.softDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["textes-reglementaires"] });
      toast.success("Texte supprimé avec succès");
      setDeleteTexteId(null);
    },
    onError: () => {
      toast.error("Erreur lors de la suppression");
    },
  });

  const textes = result?.data || [];
  const totalCount = result?.count || 0;
  const totalPages = result?.totalPages || 1;

  const uniqueYears = Array.from(
    new Set(
      textes
        .map((t: any) => t.annee)
        .filter((y): y is number => y !== null)
    )
  ).sort((a, b) => b - a);

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case "en_vigueur":
        return { 
          label: "En vigueur", 
          className: "bg-success/10 text-success border border-success/20 font-medium",
          icon: "✓"
        };
      case "modifie":
        return { 
          label: "Modifié", 
          className: "bg-warning/10 text-warning border border-warning/20 font-medium",
          icon: "⚠"
        };
      case "abroge":
        return { 
          label: "Abrogé", 
          className: "bg-destructive/10 text-destructive border border-destructive/20 font-medium",
          icon: "✕"
        };
      case "suspendu":
        return { 
          label: "Suspendu", 
          className: "bg-muted text-muted-foreground border border-border font-medium",
          icon: "⏸"
        };
      default:
        return { label: statut, className: "", icon: "" };
    }
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
    setPage(1);
  };

  const handleEdit = (texte: TexteReglementaire) => {
    setEditingTexte(texte);
    setShowFormModal(true);
  };

  const handleExportExcel = () => {
    const exportData = textes.map((t: any) => ({
      Type: TYPE_LABELS[t.type as keyof typeof TYPE_LABELS],
      Référence: t.reference_officielle,
      Titre: t.titre,
      Autorité: t.autorite || "",
      "Date de publication": t.date_publication || "",
      Statut: getStatutBadge(t.statut_vigueur).label,
      "Nombre d'articles": t.articles?.[0]?.count || 0,
      Année: t.annee || "",
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Textes");
    XLSX.writeFile(wb, `textes_reglementaires_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success("Export Excel effectué");
  };

  const activeFiltersCount = [typeFilter, domaineFilter, sousDomaineFilter, statutFilter, anneeFilter]
    .filter(f => f !== "all").length;

  const clearAllFilters = () => {
    setTypeFilter("all");
    setDomaineFilter("all");
    setSousDomaineFilter("all");
    setStatutFilter("all");
    setAnneeFilter("all");
    setSearchTerm("");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header avec gradient */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-primary p-8 shadow-strong">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-accent/10 backdrop-blur-sm">
                <Scale className="h-8 w-8 text-accent" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-2">
                  Bibliothèque Réglementaire
                </h1>
                <p className="text-primary-foreground/80 text-sm sm:text-base">
                  Gestion centralisée des textes juridiques HSE
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => setShowImportDialog(true)}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Upload className="h-4 w-4 mr-2" />
                Importer
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={handleExportExcel}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
              <Button 
                size="sm" 
                onClick={() => { setEditingTexte(null); setShowFormModal(true); }}
                className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-gold"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouveau texte
              </Button>
            </div>
          </div>
        </div>

        {/* Barre de recherche et filtres améliorés */}
        <Card className="shadow-medium border-2 border-border/50">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Recherche et filtres</CardTitle>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Réinitialiser
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowFilters(!showFilters)}
                >
                  {showFilters ? "Masquer" : "Afficher"}
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Recherche principale */}
            <div className="relative">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Rechercher par titre, référence, autorité..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="pl-12 h-12 text-base border-2 focus:border-accent focus:ring-accent"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Filtres avancés */}
            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 border-t">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Type
                  </label>
                  <Select value={typeFilter} onValueChange={(val) => { setTypeFilter(val); setPage(1); }}>
                    <SelectTrigger className="border-2">
                      <SelectValue placeholder="Tous les types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      {Object.entries(TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Statut
                  </label>
                  <Select value={statutFilter} onValueChange={(val) => { setStatutFilter(val); setPage(1); }}>
                    <SelectTrigger className="border-2">
                      <SelectValue placeholder="Tous les statuts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="en_vigueur">✓ En vigueur</SelectItem>
                      <SelectItem value="modifie">⚠ Modifié</SelectItem>
                      <SelectItem value="abroge">✕ Abrogé</SelectItem>
                      <SelectItem value="suspendu">⏸ Suspendu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Domaine
                  </label>
                  <Select value={domaineFilter} onValueChange={(val) => { 
                    setDomaineFilter(val); 
                    setSousDomaineFilter("all");
                    setPage(1); 
                  }}>
                    <SelectTrigger className="border-2">
                      <SelectValue placeholder="Tous les domaines" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les domaines</SelectItem>
                      {domainesList?.map((domaine) => (
                        <SelectItem key={domaine.id} value={domaine.id}>
                          {domaine.libelle}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Sous-domaine
                  </label>
                  <Select 
                    value={sousDomaineFilter} 
                    onValueChange={(val) => { setSousDomaineFilter(val); setPage(1); }}
                    disabled={domaineFilter === "all"}
                  >
                    <SelectTrigger className="border-2">
                      <SelectValue placeholder="Sous-domaine" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      {sousDomainesList?.map((sd) => (
                        <SelectItem key={sd.id} value={sd.id}>
                          {sd.libelle}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Année
                  </label>
                  <Select value={anneeFilter} onValueChange={(val) => { setAnneeFilter(val); setPage(1); }}>
                    <SelectTrigger className="border-2">
                      <SelectValue placeholder="Toutes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les années</SelectItem>
                      {uniqueYears.map((year) => (
                        <SelectItem key={year} value={String(year)}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tableau des résultats */}
        <Card className="shadow-medium">
          <CardHeader className="border-b bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-xl">Textes réglementaires</CardTitle>
                  <CardDescription className="mt-1">
                    {totalCount} texte{totalCount > 1 ? 's' : ''} trouvé{totalCount > 1 ? 's' : ''}
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                <p className="text-muted-foreground font-medium">Chargement des textes...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="p-4 rounded-full bg-destructive/10">
                  <FileText className="h-12 w-12 text-destructive" />
                </div>
                <div className="text-center">
                  <p className="text-destructive font-semibold mb-2">Erreur de chargement</p>
                  <p className="text-sm text-muted-foreground">Impossible de charger les textes réglementaires</p>
                </div>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Réessayer
                </Button>
              </div>
            ) : textes.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead className="font-semibold cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort("type")}>
                          <div className="flex items-center gap-1">
                            Type
                            {sortBy === "type" && (
                              <span className="text-accent">{sortOrder === "asc" ? "↑" : "↓"}</span>
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort("reference_officielle")}>
                          <div className="flex items-center gap-1">
                            Référence
                            {sortBy === "reference_officielle" && (
                              <span className="text-accent">{sortOrder === "asc" ? "↑" : "↓"}</span>
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort("titre")}>
                          <div className="flex items-center gap-1">
                            Titre
                            {sortBy === "titre" && (
                              <span className="text-accent">{sortOrder === "asc" ? "↑" : "↓"}</span>
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort("autorite")}>
                          <div className="flex items-center gap-1">
                            Autorité
                            {sortBy === "autorite" && (
                              <span className="text-accent">{sortOrder === "asc" ? "↑" : "↓"}</span>
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort("date_publication")}>
                          <div className="flex items-center gap-1">
                            Date
                            {sortBy === "date_publication" && (
                              <span className="text-accent">{sortOrder === "asc" ? "↑" : "↓"}</span>
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold">Statut</TableHead>
                        <TableHead className="font-semibold text-center">Articles</TableHead>
                        <TableHead className="font-semibold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {textes.map((texte: any) => {
                        const statutInfo = getStatutBadge(texte.statut_vigueur);
                        const articleCount = texte.articles?.[0]?.count || 0;
                        
                        return (
                          <TableRow 
                            key={texte.id} 
                            className="hover:bg-accent/5 transition-colors cursor-pointer"
                            onClick={() => navigate(`/veille/bibliotheque/textes/${texte.id}`)}
                          >
                            <TableCell>
                              <Badge variant="outline" className="text-xs font-medium">
                                {TYPE_LABELS[texte.type as keyof typeof TYPE_LABELS]}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-semibold text-sm">
                              {texte.reference_officielle}
                            </TableCell>
                            <TableCell>
                              <div className="max-w-md">
                                <div className="font-medium text-foreground line-clamp-2 mb-1">
                                  {texte.titre}
                                </div>
                                {texte.resume && (
                                  <div className="text-xs text-muted-foreground line-clamp-1">
                                    {texte.resume}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {texte.autorite || "—"}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                              {texte.date_publication
                                ? new Date(texte.date_publication).toLocaleDateString("fr-FR")
                                : "—"}
                            </TableCell>
                            <TableCell>
                              <Badge className={statutInfo.className}>
                                <span className="mr-1">{statutInfo.icon}</span>
                                {statutInfo.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-primary/5 text-primary font-semibold text-sm">
                                {articleCount}
                              </div>
                            </TableCell>
                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/veille/bibliotheque/textes/${texte.id}`);
                                  }}
                                  className="h-8 w-8 p-0"
                                >
                                  <FileText className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(texte);
                                  }}
                                  className="h-8 w-8 p-0 hover:text-accent"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteTexteId(texte.id);
                                  }}
                                  className="h-8 w-8 p-0 hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination améliorée */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/20">
                    <div className="text-sm text-muted-foreground">
                      Page <span className="font-semibold text-foreground">{page}</span> sur{" "}
                      <span className="font-semibold text-foreground">{totalPages}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(1)}
                        disabled={page === 1}
                        className="hidden sm:flex"
                      >
                        Première
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="hidden sm:inline ml-1">Précédent</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages}
                      >
                        <span className="hidden sm:inline mr-1">Suivant</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(totalPages)}
                        disabled={page === totalPages}
                        className="hidden sm:flex"
                      >
                        Dernière
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <div className="inline-flex p-4 rounded-full bg-muted/50 mb-4">
                  <FileText className="h-12 w-12 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium text-foreground mb-2">Aucun texte trouvé</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Essayez de modifier vos critères de recherche
                </p>
                {activeFiltersCount > 0 && (
                  <Button variant="outline" onClick={clearAllFilters}>
                    Réinitialiser les filtres
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <TexteFormModal
        open={showFormModal}
        onOpenChange={(open) => {
          setShowFormModal(open);
          if (!open) setEditingTexte(null);
        }}
        texte={editingTexte}
      />

      <ImportCSVDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["textes-reglementaires"] });
        }}
      />

      <AlertDialog open={!!deleteTexteId} onOpenChange={() => setDeleteTexteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce texte réglementaire ? Cette action ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTexteId && deleteMutation.mutate(deleteTexteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
