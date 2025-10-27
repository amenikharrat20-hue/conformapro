import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { createEquipement, updateEquipement, fetchTypesEquipement, fetchOrganismesControle } from "@/lib/controles-queries";
import { fetchSites, fetchUtilisateurs } from "@/lib/multi-tenant-queries";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface EquipementFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipement?: any;
}

export default function EquipementFormModal({ open, onOpenChange, equipement }: EquipementFormModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    site_id: "",
    type_equipement_id: "",
    code_identification: "",
    localisation: "",
    batiment: "",
    etage: "",
    marque: "",
    modele: "",
    numero_serie: "",
    date_mise_en_service: null as Date | null,
    date_dernier_controle: null as Date | null,
    organisme_controle_id: "",
    periodicite_mois: 12,
    statut_conformite: "a_controler" as const,
    resultat_dernier_controle: null as string | null,
    statut_operationnel: "en_service" as const,
    observations: "",
    responsable_hse_id: "",
  });

  const { data: sites } = useQuery({
    queryKey: ["sites"],
    queryFn: fetchSites,
  });

  const { data: types } = useQuery({
    queryKey: ["types_equipement"],
    queryFn: fetchTypesEquipement,
  });

  const { data: organismes } = useQuery({
    queryKey: ["organismes_controle"],
    queryFn: fetchOrganismesControle,
  });

  const { data: utilisateurs } = useQuery({
    queryKey: ["utilisateurs"],
    queryFn: fetchUtilisateurs,
  });

  useEffect(() => {
    if (equipement) {
      setFormData({
        site_id: equipement.site_id || "",
        type_equipement_id: equipement.type_equipement_id || "",
        code_identification: equipement.code_identification || "",
        localisation: equipement.localisation || "",
        batiment: equipement.batiment || "",
        etage: equipement.etage || "",
        marque: equipement.marque || "",
        modele: equipement.modele || "",
        numero_serie: equipement.numero_serie || "",
        date_mise_en_service: equipement.date_mise_en_service ? new Date(equipement.date_mise_en_service) : null,
        date_dernier_controle: equipement.date_dernier_controle ? new Date(equipement.date_dernier_controle) : null,
        organisme_controle_id: equipement.organisme_controle_id || "",
        periodicite_mois: equipement.periodicite_mois || 12,
        statut_conformite: equipement.statut_conformite || "a_controler",
        resultat_dernier_controle: equipement.resultat_dernier_controle,
        statut_operationnel: equipement.statut_operationnel || "en_service",
        observations: equipement.observations || "",
        responsable_hse_id: equipement.responsable_hse_id || "",
      });
    } else {
      setFormData({
        site_id: "",
        type_equipement_id: "",
        code_identification: "",
        localisation: "",
        batiment: "",
        etage: "",
        marque: "",
        modele: "",
        numero_serie: "",
        date_mise_en_service: null,
        date_dernier_controle: null,
        organisme_controle_id: "",
        periodicite_mois: 12,
        statut_conformite: "a_controler",
        resultat_dernier_controle: null,
        statut_operationnel: "en_service",
        observations: "",
        responsable_hse_id: "",
      });
    }
  }, [equipement, open]);

  const createMutation = useMutation({
    mutationFn: createEquipement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipements_controle"] });
      queryClient.invalidateQueries({ queryKey: ["equipement_stats"] });
      toast({
        title: "Équipement créé",
        description: "L'équipement a été ajouté avec succès.",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => updateEquipement(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipements_controle"] });
      queryClient.invalidateQueries({ queryKey: ["equipement_stats"] });
      toast({
        title: "Équipement modifié",
        description: "L'équipement a été mis à jour avec succès.",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData: any = {
      ...formData,
      date_mise_en_service: formData.date_mise_en_service?.toISOString().split('T')[0] || null,
      date_dernier_controle: formData.date_dernier_controle?.toISOString().split('T')[0] || null,
      organisme_controle_id: formData.organisme_controle_id || null,
      responsable_hse_id: formData.responsable_hse_id || null,
      resultat_dernier_controle: formData.resultat_dernier_controle || null,
    };

    if (equipement) {
      updateMutation.mutate({ id: equipement.id, updates: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  // Auto-update periodicity when type changes
  useEffect(() => {
    if (formData.type_equipement_id && types) {
      const selectedType = types.find(t => t.id === formData.type_equipement_id);
      if (selectedType) {
        setFormData(prev => ({ ...prev, periodicite_mois: selectedType.periodicite_mois }));
      }
    }
  }, [formData.type_equipement_id, types]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{equipement ? "Modifier l'équipement" : "Nouvel équipement"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Site */}
            <div className="space-y-2">
              <Label htmlFor="site_id">Site *</Label>
              <Select
                value={formData.site_id}
                onValueChange={(value) => setFormData({ ...formData, site_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un site" />
                </SelectTrigger>
                <SelectContent>
                  {sites?.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.nom_site}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="type_equipement_id">Type d'équipement *</Label>
              <Select
                value={formData.type_equipement_id}
                onValueChange={(value) => setFormData({ ...formData, type_equipement_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  {types?.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.libelle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Code */}
            <div className="space-y-2">
              <Label htmlFor="code_identification">Code / Identifiant *</Label>
              <Input
                id="code_identification"
                value={formData.code_identification}
                onChange={(e) => setFormData({ ...formData, code_identification: e.target.value })}
                required
              />
            </div>

            {/* Localisation */}
            <div className="space-y-2">
              <Label htmlFor="localisation">Localisation</Label>
              <Input
                id="localisation"
                value={formData.localisation}
                onChange={(e) => setFormData({ ...formData, localisation: e.target.value })}
              />
            </div>

            {/* Bâtiment */}
            <div className="space-y-2">
              <Label htmlFor="batiment">Bâtiment</Label>
              <Input
                id="batiment"
                value={formData.batiment}
                onChange={(e) => setFormData({ ...formData, batiment: e.target.value })}
              />
            </div>

            {/* Étage */}
            <div className="space-y-2">
              <Label htmlFor="etage">Étage</Label>
              <Input
                id="etage"
                value={formData.etage}
                onChange={(e) => setFormData({ ...formData, etage: e.target.value })}
              />
            </div>

            {/* Marque */}
            <div className="space-y-2">
              <Label htmlFor="marque">Marque</Label>
              <Input
                id="marque"
                value={formData.marque}
                onChange={(e) => setFormData({ ...formData, marque: e.target.value })}
              />
            </div>

            {/* Modèle */}
            <div className="space-y-2">
              <Label htmlFor="modele">Modèle</Label>
              <Input
                id="modele"
                value={formData.modele}
                onChange={(e) => setFormData({ ...formData, modele: e.target.value })}
              />
            </div>

            {/* Numéro de série */}
            <div className="space-y-2">
              <Label htmlFor="numero_serie">Numéro de série</Label>
              <Input
                id="numero_serie"
                value={formData.numero_serie}
                onChange={(e) => setFormData({ ...formData, numero_serie: e.target.value })}
              />
            </div>

            {/* Date de mise en service */}
            <div className="space-y-2">
              <Label>Date de mise en service</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !formData.date_mise_en_service && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date_mise_en_service ? format(formData.date_mise_en_service, "dd/MM/yyyy", { locale: fr }) : "Sélectionner"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.date_mise_en_service || undefined}
                    onSelect={(date) => setFormData({ ...formData, date_mise_en_service: date || null })}
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Date dernier contrôle */}
            <div className="space-y-2">
              <Label>Date dernier contrôle</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !formData.date_dernier_controle && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date_dernier_controle ? format(formData.date_dernier_controle, "dd/MM/yyyy", { locale: fr }) : "Sélectionner"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.date_dernier_controle || undefined}
                    onSelect={(date) => setFormData({ ...formData, date_dernier_controle: date || null })}
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Organisme */}
            <div className="space-y-2">
              <Label htmlFor="organisme_controle_id">Organisme de contrôle</Label>
              <Select
                value={formData.organisme_controle_id}
                onValueChange={(value) => setFormData({ ...formData, organisme_controle_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {organismes?.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Périodicité */}
            <div className="space-y-2">
              <Label htmlFor="periodicite_mois">Périodicité (mois) *</Label>
              <Input
                id="periodicite_mois"
                type="number"
                value={formData.periodicite_mois}
                onChange={(e) => setFormData({ ...formData, periodicite_mois: parseInt(e.target.value) || 12 })}
                required
              />
            </div>

            {/* Statut conformité */}
            <div className="space-y-2">
              <Label htmlFor="statut_conformite">Statut de conformité</Label>
              <Select
                value={formData.statut_conformite}
                onValueChange={(value: any) => setFormData({ ...formData, statut_conformite: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conforme">Conforme</SelectItem>
                  <SelectItem value="non_conforme">Non conforme</SelectItem>
                  <SelectItem value="a_controler">À contrôler</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Statut opérationnel */}
            <div className="space-y-2">
              <Label htmlFor="statut_operationnel">Statut opérationnel</Label>
              <Select
                value={formData.statut_operationnel}
                onValueChange={(value: any) => setFormData({ ...formData, statut_operationnel: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en_service">En service</SelectItem>
                  <SelectItem value="hors_service">Hors service</SelectItem>
                  <SelectItem value="arret_technique">Arrêt technique</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Responsable HSE */}
            <div className="space-y-2">
              <Label htmlFor="responsable_hse_id">Responsable HSE</Label>
              <Select
                value={formData.responsable_hse_id}
                onValueChange={(value) => setFormData({ ...formData, responsable_hse_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {utilisateurs?.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.nom} {user.prenom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Observations */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="observations">Observations</Label>
              <Textarea
                id="observations"
                value={formData.observations}
                onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">
              {equipement ? "Modifier" : "Créer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
