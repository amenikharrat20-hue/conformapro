import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText, 
  Calendar, 
  ExternalLink,
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  History
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { textesReglementairesQueries, textesArticlesQueries } from "@/lib/textes-queries";
import { toast } from "sonner";
import { useState } from "react";

export default function BibliothequeTexteDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showArticleDialog, setShowArticleDialog] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const [deleteArticleId, setDeleteArticleId] = useState<string | null>(null);
  const [articleForm, setArticleForm] = useState({
    numero: "",
    reference: "",
    titre_court: "",
    contenu: "",
    ordre: 0,
  });

  const { data: texte, isLoading, error } = useQuery({
    queryKey: ["texte-detail", id],
    queryFn: () => textesReglementairesQueries.getById(id!),
    enabled: !!id,
  });

  const { data: articles, isLoading: articlesLoading } = useQuery({
    queryKey: ["texte-articles", id],
    queryFn: () => textesArticlesQueries.getByTexteId(id!),
    enabled: !!id,
  });

  // Show error toast if query fails
  if (error) {
    toast.error("Erreur lors du chargement du texte");
  }

  const createArticleMutation = useMutation({
    mutationFn: (data: any) => textesArticlesQueries.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["texte-articles"] });
      toast.success("Article créé avec succès");
      resetArticleForm();
    },
    onError: () => {
      toast.error("Erreur lors de la création");
    },
  });

  const updateArticleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      textesArticlesQueries.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["texte-articles"] });
      toast.success("Article modifié avec succès");
      resetArticleForm();
    },
    onError: () => {
      toast.error("Erreur lors de la modification");
    },
  });

  const deleteArticleMutation = useMutation({
    mutationFn: (id: string) => textesArticlesQueries.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["texte-articles"] });
      toast.success("Article supprimé avec succès");
      setDeleteArticleId(null);
    },
    onError: () => {
      toast.error("Erreur lors de la suppression");
    },
  });

  const resetArticleForm = () => {
    setArticleForm({
      numero: "",
      reference: "",
      titre_court: "",
      contenu: "",
      ordre: 0,
    });
    setEditingArticle(null);
    setShowArticleDialog(false);
  };

  const handleEditArticle = (article: any) => {
    setEditingArticle(article);
    setArticleForm({
      numero: article.numero,
      reference: article.reference || "",
      titre_court: article.titre_court || "",
      contenu: article.contenu || "",
      ordre: article.ordre,
    });
    setShowArticleDialog(true);
  };

  const handleSubmitArticle = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!articleForm.numero.trim()) {
      toast.error("Le numéro est requis");
      return;
    }

    const data = {
      texte_id: id,
      ...articleForm,
    };

    if (editingArticle) {
      updateArticleMutation.mutate({ id: editingArticle.id, data });
    } else {
      createArticleMutation.mutate(data);
    }
  };

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

  if (isLoading || articlesLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Chargement du texte...</p>
      </div>
    );
  }

  if (error || !texte) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <FileText className="h-16 w-16 text-destructive" />
        <p className="text-destructive font-medium">
          {error ? "Erreur lors du chargement" : "Texte non trouvé"}
        </p>
        <Button variant="outline" onClick={() => navigate("/veille/bibliotheque")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à la bibliothèque
        </Button>
      </div>
    );
  }

  const statutInfo = getStatutBadge(texte.statut_vigueur);

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate("/veille/bibliotheque")}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour à la bibliothèque
      </Button>

      <Card className="shadow-medium">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{texte.reference_officielle}</Badge>
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
              <CardTitle className="text-2xl">{texte.titre}</CardTitle>
              {texte.resume && (
                <CardDescription className="mt-2">{texte.resume}</CardDescription>
              )}
            </div>
            {texte.fichier_pdf_url && (
              <Button
                variant="outline"
                onClick={() => window.open(texte.fichier_pdf_url!, "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                PDF
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {texte.date_signature && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">Date de signature</div>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {new Date(texte.date_signature).toLocaleDateString("fr-TN")}
                </div>
              </div>
            )}
            {texte.date_publication && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">Date de publication</div>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {new Date(texte.date_publication).toLocaleDateString("fr-TN")}
                </div>
              </div>
            )}
            {texte.autorite && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">Autorité</div>
                <div className="mt-1">{texte.autorite}</div>
              </div>
            )}
            {texte.annee && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">Année</div>
                <div className="mt-1">{texte.annee}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="articles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="articles">Articles</TabsTrigger>
          <TabsTrigger value="info">Informations</TabsTrigger>
        </TabsList>

        <TabsContent value="articles" className="space-y-4">
          <div className="flex justify-between items-center gap-4">
            <h2 className="text-xl font-semibold">Articles ({articles?.length || 0})</h2>
            <Button onClick={() => setShowArticleDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un article
            </Button>
          </div>

          {articlesLoading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                <p className="text-muted-foreground">Chargement des articles...</p>
              </CardContent>
            </Card>
          ) : articles && articles.length > 0 ? (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numéro</TableHead>
                    <TableHead>Référence</TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead>Ordre</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell className="font-medium">{article.numero}</TableCell>
                      <TableCell>{article.reference || "-"}</TableCell>
                      <TableCell className="max-w-xs">
                        <div className="line-clamp-2">{article.titre_court || "-"}</div>
                      </TableCell>
                      <TableCell>{article.ordre}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/veille/bibliotheque/articles/${article.id}/versions`)}
                            title="Voir les versions"
                          >
                            <History className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditArticle(article)}
                            title="Modifier"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteArticleId(article.id)}
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Aucun article pour ce texte</p>
                <Button variant="outline" size="sm" onClick={() => setShowArticleDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter le premier article
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="info">
          <Card>
            <CardContent className="pt-6 space-y-4">
              {texte.code && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Code</div>
                  <div className="mt-1">{texte.code.titre}</div>
                  {texte.code.description && (
                    <div className="text-sm text-muted-foreground mt-1">{texte.code.description}</div>
                  )}
                </div>
              )}
              {texte.domaines && Array.isArray(texte.domaines) && texte.domaines.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">Domaines d'application</div>
                  <div className="flex flex-wrap gap-2">
                    {texte.domaines
                      .filter((item: any) => item.domaine)
                      .map((item: any, idx: number) => (
                        <Badge key={item.domaine.id || idx} variant="outline">
                          {item.domaine.libelle}
                        </Badge>
                      ))}
                  </div>
                </div>
              )}
              {texte.sous_domaines && Array.isArray(texte.sous_domaines) && texte.sous_domaines.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">Sous-domaines</div>
                  <div className="flex flex-wrap gap-2">
                    {texte.sous_domaines
                      .filter((item: any) => item.sous_domaine)
                      .map((item: any, idx: number) => (
                        <Badge key={item.sous_domaine.id || idx} variant="secondary">
                          {item.sous_domaine.libelle}
                        </Badge>
                      ))}
                  </div>
                </div>
              )}
              <div>
                <div className="text-sm font-medium text-muted-foreground">Type de texte</div>
                <div className="mt-1">
                  <Badge variant="outline">
                    {texte.type === 'LOI' ? 'Loi' : 
                     texte.type === 'DECRET' ? 'Décret' :
                     texte.type === 'ARRETE' ? 'Arrêté' :
                     texte.type === 'CIRCULAIRE' ? 'Circulaire' : texte.type}
                  </Badge>
                </div>
              </div>
              {texte.created_at && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Date de création</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {new Date(texte.created_at).toLocaleDateString("fr-FR", {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Article Dialog */}
      <Dialog open={showArticleDialog} onOpenChange={setShowArticleDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingArticle ? "Modifier l'article" : "Ajouter un article"}
            </DialogTitle>
            <DialogDescription>
              Remplissez les informations de l'article
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitArticle}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numero">Numéro *</Label>
                  <Input
                    id="numero"
                    value={articleForm.numero}
                    onChange={(e) => setArticleForm({ ...articleForm, numero: e.target.value })}
                    placeholder="Ex: 1, 2, 3..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reference">Référence</Label>
                  <Input
                    id="reference"
                    value={articleForm.reference}
                    onChange={(e) => setArticleForm({ ...articleForm, reference: e.target.value })}
                    placeholder="Ex: Art. 1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="titre_court">Titre court</Label>
                <Input
                  id="titre_court"
                  value={articleForm.titre_court}
                  onChange={(e) => setArticleForm({ ...articleForm, titre_court: e.target.value })}
                  placeholder="Titre descriptif de l'article"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contenu">Contenu</Label>
                <Textarea
                  id="contenu"
                  value={articleForm.contenu}
                  onChange={(e) => setArticleForm({ ...articleForm, contenu: e.target.value })}
                  placeholder="Contenu de l'article"
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ordre">Ordre</Label>
                <Input
                  id="ordre"
                  type="number"
                  value={articleForm.ordre}
                  onChange={(e) => setArticleForm({ ...articleForm, ordre: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={resetArticleForm}>
                Annuler
              </Button>
              <Button type="submit">
                {editingArticle ? "Modifier" : "Créer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteArticleId} onOpenChange={() => setDeleteArticleId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cet article ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteArticleId(null)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteArticleId && deleteArticleMutation.mutate(deleteArticleId)}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
