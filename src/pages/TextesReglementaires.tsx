import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, Eye, FileText, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function TextesReglementaires() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [anneeFilter, setAnneeFilter] = useState<string>("all");
  const [statutFilter, setStatutFilter] = useState<string>("all");

  const { data: typesActe } = useQuery({
    queryKey: ["types-acte"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("types_acte")
        .select("*")
        .order("libelle");
      if (error) throw error;
      return data;
    },
  });

  const { data: textes, isLoading } = useQuery({
    queryKey: ["textes-reglementaires", searchTerm, typeFilter, anneeFilter, statutFilter],
    queryFn: async () => {
      let query = supabase
        .from("textes_reglementaires")
        .select("*, types_acte(code, libelle)")
        .order("date_publication_jort", { ascending: false });

      if (searchTerm) {
        query = query.or(`intitule.ilike.%${searchTerm}%,numero_officiel.ilike.%${searchTerm}%,objet_resume.ilike.%${searchTerm}%`);
      }
      if (typeFilter !== "all") {
        query = query.eq("type_acte", typeFilter);
      }
      if (anneeFilter !== "all") {
        query = query.eq("annee", parseInt(anneeFilter));
      }
      if (statutFilter !== "all") {
        query = query.eq("statut_vigueur", statutFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const annees = Array.from({ length: 30 }, (_, i) => (new Date().getFullYear() - i).toString());

  const getStatutBadgeColor = (statut: string) => {
    switch (statut) {
      case "en_vigueur":
        return "bg-success text-success-foreground";
      case "modifie":
        return "bg-warning text-warning-foreground";
      case "abroge":
        return "bg-destructive text-destructive-foreground";
      case "suspendu":
        return "bg-muted text-muted-foreground";
      default:
        return "";
    }
  };

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case "en_vigueur":
        return "En vigueur";
      case "modifie":
        return "Modifié";
      case "abroge":
        return "Abrogé";
      case "suspendu":
        return "Suspendu";
      default:
        return statut;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
            Textes réglementaires
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Gestion de la base réglementaire tunisienne
          </p>
        </div>
        <Button
          className="bg-gradient-primary shadow-medium w-full sm:w-auto"
          onClick={() => navigate("/textes/nouveau")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Créer un texte
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-soft border-l-4 border-l-primary">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="text-3xl font-bold text-primary">
              {textes?.length || 0}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Textes totaux</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft border-l-4 border-l-success">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-success">
              {textes?.filter((t) => t.statut_vigueur === "en_vigueur").length || 0}
            </div>
            <p className="text-sm text-muted-foreground mt-1">En vigueur</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft border-l-4 border-l-warning">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-warning">
              {textes?.filter((t) => t.statut_vigueur === "modifie").length || 0}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Modifiés</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft border-l-4 border-l-destructive">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-destructive">
              {textes?.filter((t) => t.statut_vigueur === "abroge").length || 0}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Abrogés</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card className="shadow-soft">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par titre, numéro officiel, objet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Type d'acte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  {typesActe?.map((type) => (
                    <SelectItem key={type.code} value={type.code}>
                      {type.libelle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={anneeFilter} onValueChange={setAnneeFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Année" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les années</SelectItem>
                  {annees.map((annee) => (
                    <SelectItem key={annee} value={annee}>
                      {annee}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statutFilter} onValueChange={setStatutFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des textes */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Liste des textes réglementaires
          </CardTitle>
          <CardDescription>
            {textes?.length || 0} texte(s) trouvé(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Chargement...</div>
          ) : textes && textes.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numéro officiel</TableHead>
                    <TableHead>Intitulé</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>JORT</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>PDF</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {textes.map((texte) => (
                    <TableRow key={texte.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        {texte.numero_officiel}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-foreground">
                            {texte.intitule}
                          </div>
                          {texte.objet_resume && (
                            <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {texte.objet_resume}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {texte.types_acte?.libelle || texte.type_acte}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {texte.jort_numero && (
                          <div>
                            <div>JORT n° {texte.jort_numero}</div>
                            {texte.date_publication_jort && (
                              <div className="text-xs">
                                {new Date(texte.date_publication_jort).toLocaleDateString("fr-TN")}
                              </div>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatutBadgeColor(texte.statut_vigueur)}>
                          {getStatutLabel(texte.statut_vigueur)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {texte.url_pdf_ar && (
                            <Badge variant="outline" className="text-xs">AR</Badge>
                          )}
                          {texte.url_pdf_fr && (
                            <Badge variant="outline" className="text-xs">FR</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/textes/${texte.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Aucun texte réglementaire trouvé
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
