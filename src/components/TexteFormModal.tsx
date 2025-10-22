import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { textesReglementairesQueries, codesQueries, TexteReglementaire } from "@/lib/textes-queries";
import { domainesQueries, sousDomainesQueries } from "@/lib/actes-queries";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

interface TexteFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  texte?: TexteReglementaire | null;
  onSuccess?: () => void;
}

export function TexteFormModal({ open, onOpenChange, texte, onSuccess }: TexteFormModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    type: "LOI" as "LOI" | "ARRETE" | "DECRET" | "CIRCULAIRE",
    code_id: "",
    reference_officielle: "",
    titre: "",
    autorite: "",
    date_signature: "",
    date_publication: "",
    statut_vigueur: "en_vigueur" as "en_vigueur" | "abroge" | "suspendu" | "modifie",
    resume: "",
    fichier_pdf_url: "",
    annee: new Date().getFullYear(),
  });
  const [selectedDomaines, setSelectedDomaines] = useState<string[]>([]);
  const [selectedSousDomaines, setSelectedSousDomaines] = useState<string[]>([]);

  const { data: codes } = useQuery({
    queryKey: ["codes"],
    queryFn: () => codesQueries.getAll(),
  });

  const { data: domaines } = useQuery({
    queryKey: ["domaines"],
    queryFn: () => domainesQueries.getActive(),
  });

  const { data: sousDomaines } = useQuery({
    queryKey: ["sous-domaines"],
    queryFn: () => sousDomainesQueries.getActive(),
  });

  useEffect(() => {
    if (texte) {
      setFormData({
        type: texte.type,
        code_id: texte.code_id || "",
        reference_officielle: texte.reference_officielle,
        titre: texte.titre,
        autorite: texte.autorite || "",
        date_signature: texte.date_signature || "",
        date_publication: texte.date_publication || "",
        statut_vigueur: texte.statut_vigueur,
        resume: texte.resume || "",
        fichier_pdf_url: texte.fichier_pdf_url || "",
        annee: texte.annee || new Date().getFullYear(),
      });
      // TODO: Load existing domaines/sous-domaines for edit mode
    } else {
      setFormData({
        type: "LOI",
        code_id: "",
        reference_officielle: "",
        titre: "",
        autorite: "",
        date_signature: "",
        date_publication: "",
        statut_vigueur: "en_vigueur",
        resume: "",
        fichier_pdf_url: "",
        annee: new Date().getFullYear(),
      });
      setSelectedDomaines([]);
      setSelectedSousDomaines([]);
    }
  }, [texte, open]);

  const createMutation = useMutation({
    mutationFn: (data: any) => textesReglementairesQueries.create(data, selectedDomaines, selectedSousDomaines),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["textes-reglementaires"] });
      toast.success("Texte créé avec succès");
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erreur lors de la création");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      textesReglementairesQueries.update(id, data, selectedDomaines, selectedSousDomaines),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["textes-reglementaires"] });
      toast.success("Texte modifié avec succès");
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erreur lors de la modification");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (texte) {
      updateMutation.mutate({ id: texte.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{texte ? "Modifier le texte" : "Créer un texte réglementaire"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select value={formData.type} onValueChange={(val: any) => setFormData({ ...formData, type: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOI">Loi</SelectItem>
                  <SelectItem value="ARRETE">Arrêté</SelectItem>
                  <SelectItem value="DECRET">Décret</SelectItem>
                  <SelectItem value="CIRCULAIRE">Circulaire</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="code_id">Code (optionnel)</Label>
              <Select value={formData.code_id || undefined} onValueChange={(val) => setFormData({ ...formData, code_id: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un code" />
                </SelectTrigger>
                <SelectContent>
                  {codes?.map((code) => (
                    <SelectItem key={code.id} value={code.id}>
                      {code.titre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference_officielle">Référence officielle *</Label>
            <Input
              id="reference_officielle"
              value={formData.reference_officielle}
              onChange={(e) => setFormData({ ...formData, reference_officielle: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="titre">Titre *</Label>
            <Input
              id="titre"
              value={formData.titre}
              onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="autorite">Autorité émettrice</Label>
              <Input
                id="autorite"
                value={formData.autorite}
                onChange={(e) => setFormData({ ...formData, autorite: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="annee">Année</Label>
              <Input
                id="annee"
                type="number"
                value={formData.annee}
                onChange={(e) => setFormData({ ...formData, annee: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_signature">Date de signature</Label>
              <Input
                id="date_signature"
                type="date"
                value={formData.date_signature}
                onChange={(e) => setFormData({ ...formData, date_signature: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_publication">Date de publication</Label>
              <Input
                id="date_publication"
                type="date"
                value={formData.date_publication}
                onChange={(e) => setFormData({ ...formData, date_publication: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="statut_vigueur">Statut *</Label>
            <Select value={formData.statut_vigueur} onValueChange={(val: any) => setFormData({ ...formData, statut_vigueur: val })}>
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

          <div className="space-y-2">
            <Label htmlFor="resume">Résumé</Label>
            <Textarea
              id="resume"
              value={formData.resume}
              onChange={(e) => setFormData({ ...formData, resume: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fichier_pdf_url">URL du fichier PDF</Label>
            <Input
              id="fichier_pdf_url"
              value={formData.fichier_pdf_url}
              onChange={(e) => setFormData({ ...formData, fichier_pdf_url: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label>Domaines d'application</Label>
            <div className="border rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
              {domaines?.map((domaine) => (
                <div key={domaine.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`domaine-${domaine.id}`}
                    checked={selectedDomaines.includes(domaine.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedDomaines([...selectedDomaines, domaine.id]);
                      } else {
                        setSelectedDomaines(selectedDomaines.filter((id) => id !== domaine.id));
                      }
                    }}
                  />
                  <label htmlFor={`domaine-${domaine.id}`} className="text-sm cursor-pointer">
                    {domaine.libelle}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Sous-domaines d'application</Label>
            <div className="border rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
              {sousDomaines?.map((sd) => (
                <div key={sd.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`sd-${sd.id}`}
                    checked={selectedSousDomaines.includes(sd.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedSousDomaines([...selectedSousDomaines, sd.id]);
                      } else {
                        setSelectedSousDomaines(selectedSousDomaines.filter((id) => id !== sd.id));
                      }
                    }}
                  />
                  <label htmlFor={`sd-${sd.id}`} className="text-sm cursor-pointer">
                    {sd.libelle}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? "Enregistrement..." : texte ? "Modifier" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
