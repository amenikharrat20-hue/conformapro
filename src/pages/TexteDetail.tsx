import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, FileText, Download, Edit, ExternalLink } from "lucide-react";

export default function TexteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: texte, isLoading } = useQuery({
    queryKey: ["texte", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("textes_reglementaires")
        .select("*, types_acte(code, libelle)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: articles } = useQuery({
    queryKey: ["articles", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("texte_id", id!)
        .order("numero");
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: relations } = useQuery({
    queryKey: ["relations", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("relations_textes")
        .select(`
          *,
          cible:textes_reglementaires!relations_textes_cible_id_fkey(numero_officiel, intitule)
        `)
        .eq("source_id", id!);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

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

  const getRelationLabel = (relation: string) => {
    switch (relation) {
      case "modifie":
        return "Modifie";
      case "abroge":
        return "Abroge";
      case "complete":
        return "Complète";
      case "rend_applicable":
        return "Rend applicable";
      case "rectifie":
        return "Rectifie";
      case "renvoi":
        return "Renvoi à";
      default:
        return relation;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  if (!texte) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="text-muted-foreground">Texte non trouvé</div>
        <Button onClick={() => navigate("/textes")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à la liste
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/textes")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              {texte.numero_officiel}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              {texte.intitule}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate(`/textes/${id}/editer`)}>
          <Edit className="h-4 w-4 mr-2" />
          Éditer
        </Button>
      </div>

      {/* Métadonnées principales */}
      <Card className="shadow-medium">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Informations générales
            </CardTitle>
            <Badge className={getStatutBadgeColor(texte.statut_vigueur)}>
              {getStatutLabel(texte.statut_vigueur)}
            </Badge>
            <Badge variant="outline">{texte.types_acte?.libelle}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Bloc JORT */}
          {texte.jort_numero && (
            <div className="bg-muted/50 p-4 rounded-lg border border-border">
              <h3 className="font-semibold mb-3 text-foreground">Publication au JORT</h3>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Numéro JORT:</span>
                  <span className="font-medium">n° {texte.jort_numero}</span>
                </div>
                {texte.date_publication_jort && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date de publication:</span>
                    <span className="font-medium">
                      {new Date(texte.date_publication_jort).toLocaleDateString("fr-TN")}
                    </span>
                  </div>
                )}
                {(texte.jort_page_debut || texte.jort_page_fin) && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pages:</span>
                    <span className="font-medium">
                      {texte.jort_page_debut}
                      {texte.jort_page_fin && ` - ${texte.jort_page_fin}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Autres informations */}
          <div className="grid gap-4 sm:grid-cols-2">
            {texte.date_signature && (
              <div>
                <div className="text-sm text-muted-foreground">Date de signature</div>
                <div className="font-medium">
                  {new Date(texte.date_signature).toLocaleDateString("fr-TN")}
                </div>
              </div>
            )}
            {texte.annee && (
              <div>
                <div className="text-sm text-muted-foreground">Année</div>
                <div className="font-medium">{texte.annee}</div>
              </div>
            )}
            {texte.autorite_emettrice && (
              <div className="sm:col-span-2">
                <div className="text-sm text-muted-foreground">Autorité émettrice</div>
                <div className="font-medium">{texte.autorite_emettrice}</div>
              </div>
            )}
          </div>

          {/* Objet */}
          {texte.objet_resume && (
            <div>
              <div className="text-sm text-muted-foreground mb-2">Objet / Résumé</div>
              <div className="text-foreground">{texte.objet_resume}</div>
            </div>
          )}

          {/* Domaines et mots-clés */}
          {(texte.domaines?.length > 0 || texte.mots_cles?.length > 0) && (
            <div className="space-y-3">
              {texte.domaines?.length > 0 && (
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Domaines</div>
                  <div className="flex flex-wrap gap-2">
                    {texte.domaines.map((domaine: string, idx: number) => (
                      <Badge key={idx} variant="secondary">
                        {domaine}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {texte.mots_cles?.length > 0 && (
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Mots-clés</div>
                  <div className="flex flex-wrap gap-2">
                    {texte.mots_cles.map((mot: string, idx: number) => (
                      <Badge key={idx} variant="outline">
                        {mot}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Fichiers PDF */}
          <div>
            <div className="text-sm text-muted-foreground mb-3">Documents disponibles</div>
            <div className="flex flex-wrap gap-3">
              {texte.url_pdf_ar && (
                <Button variant="outline" size="sm" asChild>
                  <a href={texte.url_pdf_ar} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4 mr-2" />
                    PDF Arabe (Officiel)
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </a>
                </Button>
              )}
              {texte.url_pdf_fr && (
                <Button variant="outline" size="sm" asChild>
                  <a href={texte.url_pdf_fr} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4 mr-2" />
                    PDF Français (Informatif)
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </a>
                </Button>
              )}
            </div>
            {!texte.url_pdf_fr && texte.url_pdf_ar && (
              <p className="text-xs text-muted-foreground mt-2">
                <strong>Note:</strong> Traduction informative — seul l'arabe fait foi
              </p>
            )}
          </div>

          {/* Notes éditoriales */}
          {texte.notes_editoriales && (
            <div>
              <div className="text-sm text-muted-foreground mb-2">Notes éditoriales</div>
              <div className="text-sm text-muted-foreground italic bg-muted/30 p-3 rounded">
                {texte.notes_editoriales}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Onglets: Articles & Relations */}
      <Tabs defaultValue="articles" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="articles">
            Articles ({articles?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="relations">
            Relations ({relations?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="articles">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Articles du texte</CardTitle>
              <CardDescription>
                Contenu des articles en arabe et français
              </CardDescription>
            </CardHeader>
            <CardContent>
              {articles && articles.length > 0 ? (
                <div className="space-y-4">
                  {articles.map((article) => (
                    <div
                      key={article.id}
                      className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-semibold text-foreground">
                          Article {article.numero}
                          {article.titre_court && ` - ${article.titre_court}`}
                        </div>
                      </div>
                      {article.contenu_ar && (
                        <div className="mb-3 text-right" dir="rtl">
                          <div className="text-xs text-muted-foreground mb-1">النص العربي</div>
                          <div className="text-sm">{article.contenu_ar}</div>
                        </div>
                      )}
                      {article.contenu_fr && (
                        <div className="mb-3">
                          <div className="text-xs text-muted-foreground mb-1">Texte français</div>
                          <div className="text-sm">{article.contenu_fr}</div>
                        </div>
                      )}
                      {article.notes && (
                        <div className="text-xs text-muted-foreground italic bg-muted/30 p-2 rounded">
                          {article.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun article disponible
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relations">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Relations avec d'autres textes</CardTitle>
              <CardDescription>
                Textes modifiés, abrogés, complétés ou rectifiés
              </CardDescription>
            </CardHeader>
            <CardContent>
              {relations && relations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type de relation</TableHead>
                      <TableHead>Texte cible</TableHead>
                      <TableHead>Détails</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {relations.map((relation) => (
                      <TableRow key={relation.id}>
                        <TableCell>
                          <Badge variant="outline">
                            {getRelationLabel(relation.relation)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {relation.cible?.numero_officiel}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {relation.cible?.intitule}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {relation.details || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune relation établie
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
