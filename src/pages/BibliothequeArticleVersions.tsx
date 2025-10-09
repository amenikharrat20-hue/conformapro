import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  FileText,
  Calendar
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function BibliothequeArticleVersions() {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();

  const { data: article, isLoading: articleLoading } = useQuery({
    queryKey: ["bibliotheque-article", articleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*, actes_reglementaires(numero_officiel, intitule)")
        .eq("id", articleId!)
        .is("deleted_at", null)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!articleId,
  });

  const { data: versions, isLoading: versionsLoading } = useQuery({
    queryKey: ["bibliotheque-article-versions", articleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles_versions")
        .select("*")
        .eq("article_id", articleId!)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!articleId,
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

  if (articleLoading || versionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <FileText className="h-16 w-16 text-muted-foreground" />
        <p className="text-muted-foreground">Article non trouvé</p>
        <Button onClick={() => navigate("/veille/bibliotheque")}>
          Retour à la bibliothèque
        </Button>
      </div>
    );
  }

  const acte = article.actes_reglementaires as any;

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour
      </Button>

      {/* En-tête */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Versions - Article {article.numero}
        </h1>
        <p className="text-muted-foreground mt-2">
          {acte?.numero_officiel} - {acte?.intitule}
        </p>
        {article.titre_court && (
          <p className="text-sm text-muted-foreground mt-1">{article.titre_court}</p>
        )}
      </div>

      {/* Version actuelle */}
      <Card className="shadow-medium border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Version actuelle</CardTitle>
            <Badge className="bg-primary text-primary-foreground">Actuelle</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {article.contenu_fr && (
            <div className="prose prose-sm max-w-none mb-4">
              <div className="text-sm whitespace-pre-wrap">{article.contenu_fr}</div>
            </div>
          )}
          {article.contenu_ar && (
            <div className="prose prose-sm max-w-none" dir="rtl">
              <div className="text-sm whitespace-pre-wrap">{article.contenu_ar}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Versions historiques */}
      {versions && versions.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Versions historiques</h2>
          {versions.map((version, index) => {
            const statutInfo = getStatutBadge(version.statut_vigueur);
            return (
              <Card key={version.id} className="shadow-soft">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {version.version_label}
                      </CardTitle>
                      {version.date_effet && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Calendar className="h-4 w-4" />
                          Date d'effet: {new Date(version.date_effet).toLocaleDateString("fr-TN")}
                        </div>
                      )}
                    </div>
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
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <div className="text-sm whitespace-pre-wrap">{version.contenu}</div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="shadow-soft">
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Aucune version historique disponible</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
