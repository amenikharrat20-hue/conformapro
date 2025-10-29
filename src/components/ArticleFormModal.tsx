import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { textesArticlesQueries } from "@/lib/textes-queries";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ArticleFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  texteId: string;
  article?: any | null;
  onSuccess?: () => void;
}

export function ArticleFormModal({ 
  open, 
  onOpenChange, 
  texteId,
  article, 
  onSuccess 
}: ArticleFormModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    numero: "",
    reference: "",
    titre_court: "",
    contenu: "",
    ordre: 0,
  });

  useEffect(() => {
    if (article) {
      setFormData({
        numero: article.numero || "",
        reference: article.reference || "",
        titre_court: article.titre_court || "",
        contenu: article.contenu || "",
        ordre: article.ordre || 0,
      });
    } else {
      resetForm();
    }
  }, [article, open]);

  const resetForm = () => {
    setFormData({
      numero: "",
      reference: "",
      titre_court: "",
      contenu: "",
      ordre: 0,
    });
  };

  const createMutation = useMutation({
    mutationFn: (data: any) => textesArticlesQueries.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["texte-articles"] });
      toast.success("Article créé avec succès");
      onOpenChange(false);
      resetForm();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erreur lors de la création");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      textesArticlesQueries.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["texte-articles"] });
      toast.success("Article modifié avec succès");
      onOpenChange(false);
      resetForm();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erreur lors de la modification");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.numero.trim()) {
      toast.error("La référence de l'article est requise");
      return;
    }

    if (!formData.contenu.trim() && !article) {
      toast.error("Le contenu de l'article est requis");
      return;
    }

    const cleanData = {
      texte_id: texteId,
      numero: formData.numero.trim(),
      reference: formData.reference.trim() || null,
      titre_court: formData.titre_court.trim() || null,
      contenu: formData.contenu.trim() || null,
      ordre: formData.ordre,
    };

    if (article) {
      updateMutation.mutate({ id: article.id, data: cleanData });
    } else {
      createMutation.mutate(cleanData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {article ? "Modifier l'article" : "Ajouter un article"}
          </DialogTitle>
          <DialogDescription>
            Remplissez les informations de l'article réglementaire
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Référence de l'article */}
          <div className="space-y-2">
            <Label htmlFor="numero">Référence de l'article *</Label>
            <Input
              id="numero"
              value={formData.numero}
              onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
              placeholder="Ex: Article 1, Art. 3 bis"
              required
            />
          </div>

          {/* Référence alternative */}
          <div className="space-y-2">
            <Label htmlFor="reference">Référence alternative</Label>
            <Input
              id="reference"
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              placeholder="Ex: Art. 1"
            />
          </div>

          {/* Titre court */}
          <div className="space-y-2">
            <Label htmlFor="titre_court">Titre court</Label>
            <Input
              id="titre_court"
              value={formData.titre_court}
              onChange={(e) => setFormData({ ...formData, titre_court: e.target.value })}
              placeholder="Titre descriptif de l'article"
            />
          </div>

          {/* Contenu */}
          <div className="space-y-2">
            <Label htmlFor="contenu">Contenu de l'article</Label>
            <RichTextEditor
              value={formData.contenu}
              onChange={(value) => setFormData({ ...formData, contenu: value })}
              placeholder="Contenu complet de l'article..."
            />
            <p className="text-xs text-muted-foreground">
              Le contenu peut être modifié ultérieurement via le système de versions
            </p>
          </div>

          {/* Ordre d'affichage */}
          <div className="space-y-2">
            <Label htmlFor="ordre">Ordre d'affichage</Label>
            <Input
              id="ordre"
              type="number"
              value={formData.ordre}
              onChange={(e) => setFormData({ ...formData, ordre: parseInt(e.target.value) || 0 })}
              min={0}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                onOpenChange(false);
                resetForm();
              }}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {article ? "Enregistrer" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
