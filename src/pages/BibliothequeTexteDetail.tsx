import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Calendar, 
  ExternalLink,
  ArrowLeft,
  List
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { actesQueries, articlesQueries } from "@/lib/actes-queries";

export default function BibliothequeTexteDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: acte, isLoading } = useQuery({
    queryKey: ["bibliotheque-acte", id],
    queryFn: () => actesQueries.getById(id!),
    enabled: !!id,
  });

  const { data: articles } = useQuery({
    queryKey: ["bibliotheque-articles", id],
    queryFn: () => articlesQueries.getByActeId(id!),
    enabled: !!id,
  });

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case "en_vigueur":
        return { label: "En vigueur", variant: "success" as const };
      case "modifie":
        return { label: "Modifié", variant: "warning" as const };
      case "abroge":
        return { label: "Abrogé", variant: "destructive" as const };
      case "suspendu":
        return { label: "Suspendu", variant: "secondary" as const };
      default:
        return { label: statut, variant: "secondary" as const };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  if (!acte) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <FileText className="h-16 w-16 text-muted-foreground" />
        <p className="text-muted-foreground">Texte non trouvé</p>
        <Button onClick={() => navigate("/veille/bibliotheque")}>
          Retour à la bibliothèque
        </Button>
      </div>
    );
  }

  const statutInfo = getStatutBadge(acte.statut_vigueur);

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <Button
        variant="ghost"
        onClick={() => navigate("/veille/bibliotheque")}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour à la bibliothèque
      </Button>

      {/* En-tête du texte */}
      <Card className="shadow-medium">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{acte.numero_officiel}</Badge>
                <Badge
                  className={
                    statutInfo.variant === "success"
                      ? "bg-success text-success-foreground"
                      : statutInfo.variant === "warning"
                      ? "bg-warning text-warning-foreground"
                      : statutInfo.variant === "destructive"
                      ? "bg-destructive text-destructive-foreground"
                      : ""
                  }
                >
                  {statutInfo.label}
                </Badge>
              </div>
              <CardTitle className="text-2xl">{acte.intitule}</CardTitle>
              {acte.objet_resume && (
                <CardDescription className="mt-2">{acte.objet_resume}</CardDescription>
              )}
            </div>
            <div className="flex gap-2">
              {articles && articles.length > 0 && (
                <Button
                  onClick={() => navigate(`/veille/bibliotheque/textes/${id}/articles`)}
                >
                  <List className="h-4 w-4 mr-2" />
                  Voir les articles ({articles.length})
                </Button>
              )}
              {acte.lien_pdf && (
                <Button
                  variant="outline"
                  onClick={() => window.open(acte.lien_pdf!, "_blank")}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  PDF
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {acte.date_signature && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">Date de signature</div>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {new Date(acte.date_signature).toLocaleDateString("fr-TN")}
                </div>
              </div>
            )}
            {acte.date_publication_jort && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">Date de publication JORT</div>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {new Date(acte.date_publication_jort).toLocaleDateString("fr-TN")}
                </div>
              </div>
            )}
            {acte.jort_numero && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">JORT N°</div>
                <div className="mt-1">{acte.jort_numero}</div>
              </div>
            )}
            {acte.autorite_emettrice && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">Autorité émettrice</div>
                <div className="mt-1">{acte.autorite_emettrice}</div>
              </div>
            )}
          </div>

          {acte.domaines && acte.domaines.length > 0 && (
            <div className="mt-6">
              <div className="text-sm font-medium text-muted-foreground mb-2">Domaines</div>
              <div className="flex flex-wrap gap-2">
                {acte.domaines.map((domaine, idx) => (
                  <Badge key={idx} variant="outline">
                    {domaine}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {acte.mots_cles && acte.mots_cles.length > 0 && (
            <div className="mt-4">
              <div className="text-sm font-medium text-muted-foreground mb-2">Mots-clés</div>
              <div className="flex flex-wrap gap-2">
                {acte.mots_cles.map((motCle, idx) => (
                  <Badge key={idx} variant="secondary">
                    {motCle}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {acte.notes_editoriales && (
            <div className="mt-6">
              <div className="text-sm font-medium text-muted-foreground mb-2">Notes éditoriales</div>
              <div className="text-sm">{acte.notes_editoriales}</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
