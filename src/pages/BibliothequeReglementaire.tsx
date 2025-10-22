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
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  FileText
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { textesReglementairesQueries, TexteReglementaire } from "@/lib/textes-queries";
import { domainesQueries, sousDomainesQueries } from "@/lib/actes-queries";
import { toast } from "sonner";
import { TexteFormModal } from "@/components/TexteFormModal";
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
  const [editingTexte, setEditingTexte] = useState<TexteReglementaire | null>(null);
  const [deleteTexteId, setDeleteTexteId] = useState<string | null>(null);
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

  // Show error toast if query fails
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
        return { label: "En vigueur", className: "bg-success text-success-foreground" };
      case "modifie":
        return { label: "Modifié", className: "bg-warning text-warning-foreground" };
      case "abroge":
        return { label: "Abrogé", className: "bg-destructive text-destructive-foreground" };
      case "suspendu":
        return { label: "Suspendu", className: "bg-secondary text-secondary-foreground" };
      default:
        return { label: statut, className: "" };
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
            Bibliothèque réglementaire
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Gestion des textes réglementaires HSE
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportExcel}>
            <Download className="h-4 w-4 mr-2" />
            Exporter Excel
          </Button>
          <Button size="sm" onClick={() => { setEditingTexte(null); setShowFormModal(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-soft">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par titre, référence, autorité..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <Select value={typeFilter} onValueChange={(val) => { setTypeFilter(val); setPage(1); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
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

              <Select value={statutFilter} onValueChange={(val) => { setStatutFilter(val); setPage(1); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="en_vigueur">En vigueur</SelectItem>
                  <SelectItem value="modifie">Modifié</SelectItem>
                  <SelectItem value="abroge">Abrogé</SelectItem>
                  <SelectItem value="suspendu">Suspendu</SelectItem>
                </SelectContent>
              </Select>

              <Select value={domaineFilter} onValueChange={(val) => { 
                setDomaineFilter(val); 
                setSousDomaineFilter("all");
                setPage(1); 
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Domaine" />
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

              <Select 
                value={sousDomaineFilter} 
                onValueChange={(val) => { setSousDomaineFilter(val); setPage(1); }}
                disabled={domaineFilter === "all"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sous-domaine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les sous-domaines</SelectItem>
                  {sousDomainesList?.map((sd) => (
                    <SelectItem key={sd.id} value={sd.id}>
                      {sd.libelle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={anneeFilter} onValueChange={(val) => { setAnneeFilter(val); setPage(1); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Année" />
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
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <FileText className="h-5 w-5 text-primary" />
            Textes réglementaires
          </CardTitle>
          <CardDescription className="text-sm">
            {totalCount} texte(s) trouvé(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Chargement des textes réglementaires...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <FileText className="h-12 w-12 text-destructive" />
              <p className="text-destructive font-medium">Erreur lors du chargement</p>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                Réessayer
              </Button>
            </div>
          ) : textes.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("type")}>
                        Type {sortBy === "type" && (sortOrder === "asc" ? "↑" : "↓")}
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("reference_officielle")}>
                        Référence {sortBy === "reference_officielle" && (sortOrder === "asc" ? "↑" : "↓")}
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("titre")}>
                        Titre {sortBy === "titre" && (sortOrder === "asc" ? "↑" : "↓")}
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("autorite")}>
                        Autorité {sortBy === "autorite" && (sortOrder === "asc" ? "↑" : "↓")}
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("date_publication")}>
                        Date publication {sortBy === "date_publication" && (sortOrder === "asc" ? "↑" : "↓")}
                      </TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-center">#Articles</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {textes.map((texte: any) => {
                      const statutInfo = getStatutBadge(texte.statut_vigueur);
                      const articleCount = texte.articles?.[0]?.count || 0;
                      
                      return (
                        <TableRow key={texte.id} className="hover:bg-muted/50">
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {TYPE_LABELS[texte.type as keyof typeof TYPE_LABELS]}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {texte.reference_officielle}
                          </TableCell>
                          <TableCell>
                            <div className="max-w-md">
                              <div className="font-medium text-foreground line-clamp-1">
                                {texte.titre}
                              </div>
                              {texte.resume && (
                                <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                  {texte.resume}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {texte.autorite || "—"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {texte.date_publication
                              ? new Date(texte.date_publication).toLocaleDateString("fr-FR")
                              : "—"}
                          </TableCell>
                          <TableCell>
                            <Badge className={statutInfo.className}>
                              {statutInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center text-sm font-medium">
                            {articleCount}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/veille/bibliotheque/textes/${texte.id}`)}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(texte)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteTexteId(texte.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Page {page} sur {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Aucun texte trouvé
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Modal */}
      <TexteFormModal
        open={showFormModal}
        onOpenChange={(open) => {
          setShowFormModal(open);
          if (!open) setEditingTexte(null);
        }}
        texte={editingTexte}
      />

      {/* Delete Confirmation */}
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
