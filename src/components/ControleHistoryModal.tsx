import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { fetchHistoriqueByEquipement, createHistoriqueControle, fetchOrganismesControle } from "@/lib/controles-queries";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, FileText, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface ControleHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipement?: any;
}

const RESULTAT_LABELS = {
  conforme: { label: "Conforme", icon: CheckCircle, color: "bg-green-500" },
  non_conforme: { label: "Non conforme", icon: XCircle, color: "bg-red-500" },
  conforme_avec_reserves: { label: "Conforme avec réserves", icon: AlertCircle, color: "bg-orange-500" },
  en_attente: { label: "En attente", icon: AlertCircle, color: "bg-yellow-500" },
};

export default function ControleHistoryModal({ open, onOpenChange, equipement }: ControleHistoryModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    date_controle: new Date(),
    organisme_controle_id: "",
    resultat: "conforme" as const,
    observations: "",
    controleur_nom: "",
    certificat_numero: "",
    non_conformites: [] as string[],
    actions_correctives: "",
  });

  const { data: historique, isLoading } = useQuery({
    queryKey: ["historique_controles", equipement?.id],
    queryFn: () => fetchHistoriqueByEquipement(equipement?.id),
    enabled: !!equipement?.id && open,
  });

  const { data: organismes } = useQuery({
    queryKey: ["organismes_controle"],
    queryFn: fetchOrganismesControle,
  });

  const createMutation = useMutation({
    mutationFn: createHistoriqueControle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["historique_controles"] });
      queryClient.invalidateQueries({ queryKey: ["equipements_controle"] });
      queryClient.invalidateQueries({ queryKey: ["equipement_stats"] });
      toast({
        title: "Contrôle enregistré",
        description: "Le contrôle a été ajouté avec succès.",
      });
      setShowAddForm(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      date_controle: new Date(),
      organisme_controle_id: "",
      resultat: "conforme",
      observations: "",
      controleur_nom: "",
      certificat_numero: "",
      non_conformites: [],
      actions_correctives: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      equipement_id: equipement.id,
      date_controle: formData.date_controle.toISOString().split('T')[0],
      organisme_controle_id: formData.organisme_controle_id || null,
      resultat: formData.resultat,
      observations: formData.observations,
      controleur_nom: formData.controleur_nom,
      certificat_numero: formData.certificat_numero,
      non_conformites: formData.non_conformites.length > 0 ? formData.non_conformites : null,
      actions_correctives: formData.actions_correctives,
      prochaine_echeance: null, // Will be auto-calculated by trigger
    };

    createMutation.mutate(submitData);
  };

  if (!equipement) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Historique des contrôles - {equipement.code_identification}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {equipement.type_equipement?.libelle} • {equipement.site?.nom_site}
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Equipment Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Résumé de l'équipement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Localisation</p>
                  <p className="font-medium">{equipement.localisation || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Périodicité</p>
                  <p className="font-medium">{equipement.periodicite_mois} mois</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Dernier contrôle</p>
                  <p className="font-medium">
                    {equipement.date_dernier_controle
                      ? format(new Date(equipement.date_dernier_controle), "dd/MM/yyyy", { locale: fr })
                      : "Jamais"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Prochaine échéance</p>
                  <p className="font-medium">
                    {equipement.prochaine_echeance
                      ? format(new Date(equipement.prochaine_echeance), "dd/MM/yyyy", { locale: fr })
                      : "-"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add Control Button */}
          {!showAddForm && (
            <Button onClick={() => setShowAddForm(true)} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Enregistrer un nouveau contrôle
            </Button>
          )}

          {/* Add Control Form */}
          {showAddForm && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="text-base">Nouveau contrôle</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Date */}
                    <div className="space-y-2">
                      <Label>Date du contrôle *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(formData.date_controle, "dd/MM/yyyy", { locale: fr })}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.date_controle}
                            onSelect={(date) => date && setFormData({ ...formData, date_controle: date })}
                            locale={fr}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Organisme */}
                    <div className="space-y-2">
                      <Label>Organisme de contrôle</Label>
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

                    {/* Résultat */}
                    <div className="space-y-2">
                      <Label>Résultat *</Label>
                      <Select
                        value={formData.resultat}
                        onValueChange={(value: any) => setFormData({ ...formData, resultat: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="conforme">Conforme</SelectItem>
                          <SelectItem value="non_conforme">Non conforme</SelectItem>
                          <SelectItem value="conforme_avec_reserves">Conforme avec réserves</SelectItem>
                          <SelectItem value="en_attente">En attente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Contrôleur */}
                    <div className="space-y-2">
                      <Label>Nom du contrôleur</Label>
                      <Input
                        value={formData.controleur_nom}
                        onChange={(e) => setFormData({ ...formData, controleur_nom: e.target.value })}
                      />
                    </div>

                    {/* Certificat */}
                    <div className="space-y-2 md:col-span-2">
                      <Label>Numéro de certificat</Label>
                      <Input
                        value={formData.certificat_numero}
                        onChange={(e) => setFormData({ ...formData, certificat_numero: e.target.value })}
                      />
                    </div>

                    {/* Observations */}
                    <div className="space-y-2 md:col-span-2">
                      <Label>Observations</Label>
                      <Textarea
                        value={formData.observations}
                        onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                        rows={2}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => { setShowAddForm(false); resetForm(); }}>
                      Annuler
                    </Button>
                    <Button type="submit">
                      Enregistrer
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* History List */}
          <div className="space-y-3">
            <h3 className="font-semibold">Historique ({historique?.length || 0})</h3>
            {isLoading ? (
              <div className="text-center py-8">Chargement...</div>
            ) : historique && historique.length > 0 ? (
              <div className="space-y-3">
                {historique.map((ctrl: any) => {
                  const resultatInfo = RESULTAT_LABELS[ctrl.resultat as keyof typeof RESULTAT_LABELS];
                  const ResultatIcon = resultatInfo.icon;
                  
                  return (
                    <Card key={ctrl.id}>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <Badge className={`${resultatInfo.color} text-white gap-1`}>
                              <ResultatIcon className="h-3 w-3" />
                              {resultatInfo.label}
                            </Badge>
                            <span className="font-medium">
                              {format(new Date(ctrl.date_controle), "dd MMMM yyyy", { locale: fr })}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                          {ctrl.organisme?.nom && (
                            <div>
                              <span className="font-medium">Organisme:</span> {ctrl.organisme.nom}
                            </div>
                          )}
                          {ctrl.controleur_nom && (
                            <div>
                              <span className="font-medium">Contrôleur:</span> {ctrl.controleur_nom}
                            </div>
                          )}
                          {ctrl.certificat_numero && (
                            <div className="col-span-2">
                              <span className="font-medium">Certificat:</span> {ctrl.certificat_numero}
                            </div>
                          )}
                          {ctrl.observations && (
                            <div className="col-span-2">
                              <span className="font-medium">Observations:</span> {ctrl.observations}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Aucun contrôle enregistré
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
