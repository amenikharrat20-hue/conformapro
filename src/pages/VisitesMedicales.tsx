import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Calendar, Users, AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";
import { fetchMedicalVisits, fetchMedicalVisitsStats, fetchEmployees } from "@/lib/medical-queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { MedicalVisitFormDrawer } from "@/components/MedicalVisitFormDrawer";
import { EmployeeFormModal } from "@/components/EmployeeFormModal";

const VisitesMedicales = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [isVisitDrawerOpen, setIsVisitDrawerOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [view, setView] = useState<"list" | "calendar">("list");

  const { data: visits, isLoading: visitsLoading } = useQuery({
    queryKey: ["medical-visits"],
    queryFn: fetchMedicalVisits,
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["medical-visits-stats"],
    queryFn: fetchMedicalVisitsStats,
  });

  const { data: employees } = useQuery({
    queryKey: ["employees"],
    queryFn: fetchEmployees,
  });

  const filteredVisits = visits?.filter((visit) => {
    const matchesSearch =
      visit.employe?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.employe?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.employe?.matricule?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || visit.statut_visite === statusFilter;
    const matchesType = typeFilter === "all" || visit.type_visite === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      PLANIFIEE: { label: "Planifiée", variant: "default" },
      REALISEE: { label: "Réalisée", variant: "secondary" },
      REPORTEE: { label: "Reportée", variant: "outline" },
      ANNULEE: { label: "Annulée", variant: "destructive" },
      NO_SHOW: { label: "Absent", variant: "destructive" },
    };
    const config = variants[status] || variants.PLANIFIEE;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      EMBAUCHE: "Embauche",
      PERIODIQUE: "Périodique",
      REPRISE: "Reprise",
      CHANGEMENT_POSTE: "Changement de poste",
      SMS: "SMS",
    };
    return labels[type] || type;
  };

  const getAptitudeIcon = (aptitude: string | null) => {
    if (!aptitude || aptitude === "EN_ATTENTE") return <Clock className="h-4 w-4 text-muted-foreground" />;
    if (aptitude === "APTE") return <CheckCircle2 className="h-4 w-4 text-success" />;
    if (aptitude === "APTE_RESTRICTIONS") return <AlertCircle className="h-4 w-4 text-warning" />;
    return <XCircle className="h-4 w-4 text-destructive" />;
  };

  const handleOpenNewVisit = () => {
    setSelectedVisitId(null);
    setIsVisitDrawerOpen(true);
  };

  const handleEditVisit = (visitId: string) => {
    setSelectedVisitId(visitId);
    setIsVisitDrawerOpen(true);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Visites Médicales</h1>
          <p className="text-muted-foreground">Gestion de la médecine du travail</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsEmployeeModalOpen(true)} variant="outline">
            <Users className="mr-2 h-4 w-4" />
            Gérer les employés
          </Button>
          <Button onClick={handleOpenNewVisit}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle visite
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total visites</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.total || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">En retard</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-destructive">{stats?.enRetard || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Prochains 30 jours</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-warning">{stats?.procheEcheance || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aptes</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-success">{stats?.aptes || 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un employé..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="PLANIFIEE">Planifiée</SelectItem>
                <SelectItem value="REALISEE">Réalisée</SelectItem>
                <SelectItem value="REPORTEE">Reportée</SelectItem>
                <SelectItem value="ANNULEE">Annulée</SelectItem>
                <SelectItem value="NO_SHOW">Absent</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="EMBAUCHE">Embauche</SelectItem>
                <SelectItem value="PERIODIQUE">Périodique</SelectItem>
                <SelectItem value="REPRISE">Reprise</SelectItem>
                <SelectItem value="CHANGEMENT_POSTE">Changement de poste</SelectItem>
                <SelectItem value="SMS">SMS</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Visits Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des visites</CardTitle>
          <CardDescription>{filteredVisits?.length || 0} visite(s) trouvée(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {visitsLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employé</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date planifiée</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Aptitude</TableHead>
                  <TableHead>Médecin</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVisits && filteredVisits.length > 0 ? (
                  filteredVisits.map((visit) => (
                    <TableRow key={visit.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {visit.employe?.nom} {visit.employe?.prenom}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {visit.employe?.matricule}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeLabel(visit.type_visite)}</TableCell>
                      <TableCell>
                        {format(new Date(visit.date_planifiee), "dd MMM yyyy", { locale: fr })}
                      </TableCell>
                      <TableCell>{getStatusBadge(visit.statut_visite)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getAptitudeIcon(visit.resultat_aptitude)}
                        </div>
                      </TableCell>
                      <TableCell>{visit.medecin_nom || "-"}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditVisit(visit.id)}
                        >
                          Voir
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Aucune visite trouvée
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <MedicalVisitFormDrawer
        open={isVisitDrawerOpen}
        onOpenChange={setIsVisitDrawerOpen}
        visitId={selectedVisitId}
        employees={employees || []}
      />

      <EmployeeFormModal
        open={isEmployeeModalOpen}
        onOpenChange={setIsEmployeeModalOpen}
      />
    </div>
  );
};

export default VisitesMedicales;
