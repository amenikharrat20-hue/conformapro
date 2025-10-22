import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { textesReglementairesQueries, domainesQueries, TexteReglementaire } from "@/lib/textes-queries";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, X, FileText, Loader2 } from "lucide-react";

interface TexteReglementaireFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  texte?: TexteReglementaire | null;
  onSuccess?: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  LOI_ORDINAIRE: "Loi ordinaire",
  LOI_ORGANIQUE: "Loi organique",
  DECRET_LOI: "Décret-loi",
  DECRET_PRESIDENTIEL: "Décret présidentiel",
  DECRET_GOUVERNEMENTAL: "Décret gouvernemental",
  ARRETE_MINISTERIEL: "Arrêté ministériel",
  ARRETE_INTERMINISTERIEL: "Arrêté interministériel",
  CIRCULAIRE: "Circulaire"
};

export function TexteReglementaireFormModal({ open, onOpenChange, texte, onSuccess }: TexteReglementaireFormModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    type: "LOI_ORDINAIRE" as TexteReglementaire['type'],
    reference_officielle: "",
    titre: "",
    autorite: "",
    date_publication: "",
    statut_vigueur: "en_vigueur" as TexteReglementaire['statut_vigueur'],
    resume: "",
    annee: new Date().getFullYear(),
  });
  
  const [selectedDomaines, setSelectedDomaines] = useState<string[]>([]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [existingPdfUrl, setExistingPdfUrl] = useState<string>("");

  const { data: domaines } = useQuery({
    queryKey: ["domaines"],
    queryFn: () => domainesQueries.getActive(),
  });

  useEffect(() => {
    if (texte && open) {
      setFormData({
        type: texte.type,
        reference_officielle: texte.reference_officielle,
        titre: texte.titre,
        autorite: texte.autorite || "",
        date_publication: texte.date_publication || "",
        statut_vigueur: texte.statut_vigueur,
        resume: texte.resume || "",
        annee: texte.annee || new Date().getFullYear(),
      });
      setExistingPdfUrl(texte.fichier_pdf_url || "");
      
      // Load existing domaines
      if ((texte as any).domaines) {
        const domaineIds = (texte as any).domaines
          .filter((d: any) => d.domaine?.id)
          .map((d: any) => d.domaine.id);
        setSelectedDomaines(domaineIds);
      }
    } else if (open) {
      // Reset form for new entry
      setFormData({
        type: "LOI_ORDINAIRE",
        reference_officielle: "",
        titre: "",
        autorite: "",
        date_publication: "",
        statut_vigueur: "en_vigueur",
        resume: "",
        annee: new Date().getFullYear(),
      });
      setSelectedDomaines([]);
      setPdfFile(null);
      setExistingPdfUrl("");
    }
  }, [texte, open]);

  const handleDomainToggle = (domaineId: string) => {
    setSelectedDomaines(prev =>
      prev.includes(domaineId)
        ? prev.filter(id => id !== domaineId)
        : [...prev, domaineId]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Seuls les fichiers PDF sont acceptés");
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB max
        toast.error("Le fichier ne doit pas dépasser 10 Mo");
        return;
      }
      setPdfFile(file);
    }
  };

  const uploadPdf = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('textes_pdf')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('textes_pdf')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      let pdfUrl = existingPdfUrl;
      
      if (pdfFile) {
        setUploadingPdf(true);
        try {
          pdfUrl = await uploadPdf(pdfFile);
        } catch (error) {
          throw new Error("Erreur lors de l'upload du PDF");
        } finally {
          setUploadingPdf(false);
        }
      }

      return textesReglementairesQueries.create(
        { ...data, fichier_pdf_url: pdfUrl },
        selectedDomaines,
        []
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["textes-reglementaires"] });
      queryClient.invalidateQueries({ queryKey: ["bibliotheque-navigation-tree"] });
      toast.success("✅ Texte réglementaire ajouté avec succès");
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      if (error.message.includes("duplicate") || error.message.includes("unique")) {
        toast.error("Cette référence officielle existe déjà");
      } else {
        toast.error(error.message || "Erreur lors de la création");
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      let pdfUrl = existingPdfUrl;
      
      if (pdfFile) {
        setUploadingPdf(true);
        try {
          pdfUrl = await uploadPdf(pdfFile);
          
          // Delete old PDF if exists
          if (existingPdfUrl) {
            const oldPath = existingPdfUrl.split('/').pop();
            if (oldPath) {
              await supabase.storage.from('textes_pdf').remove([oldPath]);
            }
          }
        } catch (error) {
          throw new Error("Erreur lors de l'upload du PDF");
        } finally {
          setUploadingPdf(false);
        }
      }

      return textesReglementairesQueries.update(
        id,
        { ...data, fichier_pdf_url: pdfUrl },
        selectedDomaines,
        []
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["textes-reglementaires"] });
      queryClient.invalidateQueries({ queryKey: ["bibliotheque-navigation-tree"] });
      queryClient.invalidateQueries({ queryKey: ["texte-detail"] });
      toast.success("✅ Modifications enregistrées");
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      if (error.message.includes("duplicate") || error.message.includes("unique")) {
        toast.error("Cette référence officielle existe déjà");
      } else {
        toast.error(error.message || "Erreur lors de la modification");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.titre.trim()) {
      toast.error("Le titre officiel est requis");
      return;
    }
    if (!formData.reference_officielle.trim()) {
      toast.error("La référence officielle est requise");
      return;
    }
    if (!formData.autorite.trim()) {
      toast.error("L'autorité émettrice est requise");
      return;
    }
    if (!formData.date_publication) {
      toast.error("La date de publication est requise");
      return;
    }
    if (selectedDomaines.length === 0) {
      toast.error("Veuillez sélectionner au moins un domaine d'application");
      return;
    }

    const cleanedData = {
      ...formData,
      titre: formData.titre.trim(),
      reference_officielle: formData.reference_officielle.trim(),
      autorite: formData.autorite.trim(),
      resume: formData.resume?.trim() || null,
    };

    if (texte) {
      updateMutation.mutate({ id: texte.id, data: cleanedData });
    } else {
      createMutation.mutate(cleanedData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending || uploadingPdf;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {texte ? "Modifier le texte réglementaire" : "Ajouter un texte réglementaire"}
          </DialogTitle>
          <DialogDescription>
            Remplissez les informations du texte réglementaire. Les champs marqués d'un * sont obligatoires.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type et Référence */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type de texte *</Label>
              <Select
                value={formData.type}
                onValueChange={(val: any) => setFormData({ ...formData, type: val })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference_officielle">Référence officielle *</Label>
              <Input
                id="reference_officielle"
                value={formData.reference_officielle}
                onChange={(e) => setFormData({ ...formData, reference_officielle: e.target.value })}
                placeholder="Ex: Loi n° 2023-42"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {/* Titre */}
          <div className="space-y-2">
            <Label htmlFor="titre">Titre officiel *</Label>
            <Input
              id="titre"
              value={formData.titre}
              onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
              placeholder="Titre complet du texte réglementaire"
              disabled={isLoading}
              required
            />
          </div>

          {/* Autorité et Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="autorite">Autorité émettrice *</Label>
              <Input
                id="autorite"
                value={formData.autorite}
                onChange={(e) => setFormData({ ...formData, autorite: e.target.value })}
                placeholder="Ex: Ministère du Travail"
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_publication">Date de publication *</Label>
              <Input
                id="date_publication"
                type="date"
                value={formData.date_publication}
                onChange={(e) => {
                  setFormData({ 
                    ...formData, 
                    date_publication: e.target.value,
                    annee: new Date(e.target.value).getFullYear()
                  });
                }}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {/* Statut */}
          <div className="space-y-2">
            <Label htmlFor="statut_vigueur">Statut de vigueur *</Label>
            <Select
              value={formData.statut_vigueur}
              onValueChange={(val: any) => setFormData({ ...formData, statut_vigueur: val })}
              disabled={isLoading}
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

          {/* Résumé */}
          <div className="space-y-2">
            <Label htmlFor="resume">Résumé</Label>
            <Textarea
              id="resume"
              value={formData.resume}
              onChange={(e) => setFormData({ ...formData, resume: e.target.value })}
              placeholder="Brève description du texte réglementaire (optionnel)"
              rows={3}
              disabled={isLoading}
            />
          </div>

          {/* Domaines d'application */}
          <div className="space-y-2">
            <Label>Domaine(s) d'application *</Label>
            <div className="border border-input rounded-md p-4 max-h-48 overflow-y-auto">
              {domaines && domaines.length > 0 ? (
                <div className="space-y-2">
                  {domaines.map((domaine) => (
                    <div key={domaine.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`domaine-${domaine.id}`}
                        checked={selectedDomaines.includes(domaine.id)}
                        onCheckedChange={() => handleDomainToggle(domaine.id)}
                        disabled={isLoading}
                      />
                      <Label
                        htmlFor={`domaine-${domaine.id}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {domaine.libelle}
                      </Label>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Aucun domaine disponible</p>
              )}
            </div>
            {selectedDomaines.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {selectedDomaines.length} domaine(s) sélectionné(s)
              </p>
            )}
          </div>

          {/* PDF Upload */}
          <div className="space-y-2">
            <Label htmlFor="pdf">Pièce jointe PDF</Label>
            <div className="space-y-2">
              {existingPdfUrl && !pdfFile && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="text-sm flex-1">PDF actuel</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(existingPdfUrl, '_blank')}
                  >
                    Voir
                  </Button>
                </div>
              )}
              
              {pdfFile ? (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="text-sm flex-1">{pdfFile.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setPdfFile(null)}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    id="pdf"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    disabled={isLoading}
                    className="cursor-pointer"
                  />
                  <Upload className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Format accepté: PDF (max 10 Mo)
              </p>
            </div>
          </div>

          {/* Buttons */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {texte ? "Enregistrer" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
