import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Download, CheckCircle2, XCircle, AlertCircle, Clock } from "lucide-react";
import { toast } from "sonner";

const ConformiteEvaluation = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [siteFilter, setSiteFilter] = useState<string>("all");
  const [etatFilter, setEtatFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Fetch clients for filter
  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("id, nom_legal")
        .order("nom_legal");
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch sites for filter
  const { data: sites } = useQuery({
    queryKey: ["sites", clientFilter],
    queryFn: async () => {
      let query = supabase
        .from("sites")
        .select("id, nom_site, client_id")
        .order("nom_site");
      
      if (clientFilter !== "all") {
        query = query.eq("client_id", clientFilter);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: clientFilter !== "all",
  });

  // Fetch conformite evaluations with related data
  const { data: evaluations, isLoading } = useQuery({
    queryKey: ["conformite-evaluations", searchTerm, clientFilter, siteFilter, etatFilter, page],
    queryFn: async () => {
      let query = supabase
        .from("conformite")
        .select(`
          *,
          applicabilite:applicabilite_id (
            id,
            texte_id,
            article_id,
            client_id,
            site_id,
            applicable,
            justification,
            activite,
            actes_reglementaires:texte_id (
              id,
              reference,
              titre,
              type_acte
            ),
            articles:article_id (
              id,
              numero,
              titre_court
            ),
            clients:client_id (
              id,
              nom_legal
            ),
            sites:site_id (
              id,
              nom_site
            )
          )
        `)
        .order("derniere_mise_a_jour", { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (etatFilter !== "all") {
        query = query.eq("etat", etatFilter as any);
      }

      const { data, error, count } = await query;
      if (error) throw error;
      
      // Apply client/site filters in memory (since we need to filter through applicabilite)
      let filteredData = data || [];
      
      if (clientFilter !== "all") {
        filteredData = filteredData.filter(
          (item: any) => item.applicabilite?.client_id === clientFilter
        );
      }
      
      if (siteFilter !== "all") {
        filteredData = filteredData.filter(
          (item: any) => item.applicabilite?.site_id === siteFilter
        );
      }

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredData = filteredData.filter((item: any) => {
          const texte = item.applicabilite?.actes_reglementaires;
          const article = item.applicabilite?.articles;
          const client = item.applicabilite?.clients;
          return (
            texte?.reference?.toLowerCase().includes(term) ||
            texte?.titre?.toLowerCase().includes(term) ||
            article?.numero?.toLowerCase().includes(term) ||
            client?.nom_legal?.toLowerCase().includes(term)
          );
        });
      }

      return { data: filteredData, count: filteredData.length };
    },
  });

  const getEtatBadge = (etat: string) => {
    switch (etat) {
      case "Conforme":
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Conforme</Badge>;
      case "Non_conforme":
        return <Badge className="bg-red-500"><XCircle className="h-3 w-3 mr-1" />Non conforme</Badge>;
      case "Partiellement_conforme":
        return <Badge className="bg-orange-500"><AlertCircle className="h-3 w-3 mr-1" />Partiellement conforme</Badge>;
      default:
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Non évalué</Badge>;
    }
  };

  const handleExport = () => {
    toast.info("Fonctionnalité d'export en cours de développement");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Évaluation de conformité</h1>
          <p className="text-muted-foreground">
            Évaluez la conformité de vos sites aux exigences réglementaires
          </p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exporter
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtres de recherche</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={clientFilter} onValueChange={setClientFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les clients" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les clients</SelectItem>
                {clients?.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.nom_legal}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={siteFilter} 
              onValueChange={setSiteFilter}
              disabled={clientFilter === "all"}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous les sites" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les sites</SelectItem>
                {sites?.map((site) => (
                  <SelectItem key={site.id} value={site.id}>
                    {site.nom_site}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={etatFilter} onValueChange={setEtatFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les états" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les états</SelectItem>
                <SelectItem value="Non_evalue">Non évalué</SelectItem>
                <SelectItem value="Conforme">Conforme</SelectItem>
                <SelectItem value="Partiellement_conforme">Partiellement conforme</SelectItem>
                <SelectItem value="Non_conforme">Non conforme</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setClientFilter("all");
                setSiteFilter("all");
                setEtatFilter("all");
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <p className="text-muted-foreground">Chargement...</p>
            </div>
          ) : evaluations?.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune évaluation trouvée</h3>
              <p className="text-muted-foreground">
                Aucune évaluation ne correspond à vos critères de recherche
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Référence texte</TableHead>
                  <TableHead>Article</TableHead>
                  <TableHead>Activité</TableHead>
                  <TableHead>État</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Dernière MAJ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evaluations?.data.map((evaluation: any) => (
                  <TableRow key={evaluation.id}>
                    <TableCell className="font-medium">
                      {evaluation.applicabilite?.clients?.nom_legal || "-"}
                    </TableCell>
                    <TableCell>
                      {evaluation.applicabilite?.sites?.nom_site || "Tous les sites"}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">
                          {evaluation.applicabilite?.actes_reglementaires?.reference}
                        </div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {evaluation.applicabilite?.actes_reglementaires?.titre}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {evaluation.applicabilite?.articles?.numero || "-"}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {evaluation.applicabilite?.activite || "-"}
                    </TableCell>
                    <TableCell>{getEtatBadge(evaluation.etat)}</TableCell>
                    <TableCell>
                      {evaluation.score ? `${evaluation.score}%` : "-"}
                    </TableCell>
                    <TableCell>
                      {new Date(evaluation.derniere_mise_a_jour).toLocaleDateString("fr-FR")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {evaluations && evaluations.count > pageSize && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {evaluations.count} évaluation(s) trouvée(s)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={evaluations.data.length < pageSize}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConformiteEvaluation;
