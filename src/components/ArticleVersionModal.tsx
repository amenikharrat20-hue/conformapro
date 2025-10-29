import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { textesArticlesVersionsQueries } from "@/lib/textes-queries";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ArticleVersionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articleId: string;
  version?: any | null;
  onSuccess?: () => void;
}

export function ArticleVersionModal({ 
  open, 
  onOpenChange, 
  articleId,
  version, 
  onSuccess 
}: ArticleVersionModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    version_label: "",
    contenu: "",
    date_effet: "",
    statut_vigueur: "en_vigueur" as any,
  });

  useEffect(() => {
    if (version) {
      setFormData({
        version_label: version.version_label || "",
        contenu: version.contenu || "",
        date_effet: version.date_effet || "",
        statut_vigueur: version.statut_vigueur || "en_vigueur",
      });
    } else {
      resetForm();
    }
  }, [version, open]);

  const resetForm = () => {
    setFormData({
      version_label: "",
      contenu: "",
      date_effet: "",
      statut_vigueur: "en_vigueur",
    });
  };

  const createMutation = useMutation({
    mutationFn: (data: any) => textesArticlesVersionsQueries.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["texte-article-versions"] });
      toast.success("Version créée avec succès");
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
      textesArticlesVersionsQueries.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["texte-article-versions"] });
      toast.success("Version modifiée avec succès");
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

    if (!formData.version_label.trim() || !formData.contenu.trim() || !formData.date_effet) {
      toast.error("Le numéro de version, le contenu et la date d'effet sont requis");
      return;
    }

    const cleanData = {
      article_id: articleId,
      version_label: formData.version_label.trim(),
      contenu: formData.contenu.trim(),
      date_effet: formData.date_effet,
      statut_vigueur: formData.statut_vigueur,
    };

    if (version) {
      updateMutation.mutate({ id: version.id, data: cleanData });
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
            {version ? "Modifier la version" : "Ajouter une nouvelle version"}
          </DialogTitle>
          <DialogDescription>
            Créez une nouvelle version de cet article pour suivre son évolution
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Numéro de version */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="version_label">Numéro de version *</Label>
              <Input
                id="version_label"
                value={formData.version_label}
                onChange={(e) => setFormData({ ...formData, version_label: e.target.value })}
                placeholder="Ex: v1.0, Version initiale, Modification 2024"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_effet">Date d'effet *</Label>
              <Input
                id="date_effet"
                type="date"
                value={formData.date_effet}
                onChange={(e) => setFormData({ ...formData, date_effet: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Statut */}
          <div className="space-y-2">
            <Label htmlFor="statut_vigueur">Statut *</Label>
            <Select 
              value={formData.statut_vigueur} 
              onValueChange={(val) => setFormData({ ...formData, statut_vigueur: val })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en_vigueur">En vigueur</SelectItem>
                <SelectItem value="modifie">Modifié</SelectItem>
                <SelectItem value="abroge">Abrogé</SelectItem>
                <SelectItem value="suspendu">Suspendu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Contenu de la version */}
          <div className="space-y-2">
            <Label htmlFor="contenu">Contenu de la version *</Label>
            <RichTextEditor
              value={formData.contenu}
              onChange={(value) => setFormData({ ...formData, contenu: value })}
              placeholder="Contenu complet de cette version de l'article..."
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
              {version ? "Enregistrer" : "Créer la version"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
