import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient, updateClient } from "@/lib/multi-tenant-queries";
import { Database } from "@/integrations/supabase/types";

type ClientRow = Database["public"]["Tables"]["clients"]["Row"];

const clientSchema = z.object({
  nom_legal: z.string().min(1, "Le nom est requis"),
  nature: z.string().optional(),
  secteur: z.string().optional(),
  gouvernorat: z.string().optional(),
  matricule_fiscal: z.string().optional(),
  rne_rc: z.string().optional(),
  adresse_siege: z.string().optional(),
  couleur_primaire: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Format couleur invalide").optional(),
  couleur_secondaire: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Format couleur invalide").optional(),
  abonnement_type: z.string().optional(),
  statut: z.string().optional(),
  notes: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: ClientRow;
}

export function ClientFormModal({ open, onOpenChange, client }: ClientFormModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: client ? {
      nom_legal: client.nom_legal,
      nature: client.nature || "",
      secteur: client.secteur || "",
      gouvernorat: client.gouvernorat || "",
      matricule_fiscal: client.matricule_fiscal || "",
      rne_rc: client.rne_rc || "",
      adresse_siege: client.adresse_siege || "",
      couleur_primaire: client.couleur_primaire || "#0066CC",
      couleur_secondaire: client.couleur_secondaire || "#00CC66",
      abonnement_type: client.abonnement_type || "standard",
      statut: client.statut || "actif",
      notes: client.notes || "",
    } : {
      couleur_primaire: "#0066CC",
      couleur_secondaire: "#00CC66",
      abonnement_type: "standard",
      statut: "actif",
    },
  });

  const createMutation = useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast({ title: "Client créé avec succès" });
      reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erreur lors de la création",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateClient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast({ title: "Client modifié avec succès" });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erreur lors de la modification",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ClientFormData) => {
    if (client) {
      updateMutation.mutate({ id: client.id, data });
    } else {
      createMutation.mutate(data as any);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{client ? "Modifier le client" : "Nouveau client"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Identification */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Identification</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="nom_legal">Nom légal *</Label>
                <Input id="nom_legal" {...register("nom_legal")} />
                {errors.nom_legal && (
                  <p className="text-sm text-destructive mt-1">{errors.nom_legal.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="nature">Nature</Label>
                <Input id="nature" {...register("nature")} placeholder="SARL, SA, Entreprise individuelle..." />
              </div>

              <div>
                <Label htmlFor="secteur">Secteur</Label>
                <Select onValueChange={(value) => setValue("secteur", value)} defaultValue={client?.secteur || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border z-50">
                    <SelectItem value="Agroalimentaire">Agroalimentaire</SelectItem>
                    <SelectItem value="Automobile">Automobile</SelectItem>
                    <SelectItem value="Chimie">Chimie</SelectItem>
                    <SelectItem value="Construction">Construction</SelectItem>
                    <SelectItem value="Logistique">Logistique</SelectItem>
                    <SelectItem value="Pharmaceutique">Pharmaceutique</SelectItem>
                    <SelectItem value="Textile">Textile</SelectItem>
                    <SelectItem value="Autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="matricule_fiscal">Matricule fiscal</Label>
                <Input id="matricule_fiscal" {...register("matricule_fiscal")} />
              </div>

              <div>
                <Label htmlFor="rne_rc">RNE / RC</Label>
                <Input id="rne_rc" {...register("rne_rc")} />
              </div>
            </div>
          </div>

          {/* Localisation */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Localisation</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gouvernorat">Gouvernorat</Label>
                <Select onValueChange={(value) => setValue("gouvernorat", value)} defaultValue={client?.gouvernorat || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border z-50 max-h-60 overflow-y-auto">
                    <SelectItem value="Ariana">Ariana</SelectItem>
                    <SelectItem value="Tunis">Tunis</SelectItem>
                    <SelectItem value="Sousse">Sousse</SelectItem>
                    <SelectItem value="Sfax">Sfax</SelectItem>
                    <SelectItem value="Monastir">Monastir</SelectItem>
                    <SelectItem value="Nabeul">Nabeul</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2">
                <Label htmlFor="adresse_siege">Adresse siège social</Label>
                <Textarea id="adresse_siege" {...register("adresse_siege")} rows={2} />
              </div>
            </div>
          </div>

          {/* Configuration */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Configuration</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="abonnement_type">Type d'abonnement</Label>
                <Select onValueChange={(value) => setValue("abonnement_type", value)} defaultValue={client?.abonnement_type || "standard"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border z-50">
                    <SelectItem value="essentiel">Essentiel</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="entreprise">Entreprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="statut">Statut</Label>
                <Select onValueChange={(value) => setValue("statut", value)} defaultValue={client?.statut || "actif"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border z-50">
                    <SelectItem value="actif">Actif</SelectItem>
                    <SelectItem value="inactif">Inactif</SelectItem>
                    <SelectItem value="suspendu">Suspendu</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="couleur_primaire">Couleur primaire</Label>
                <div className="flex gap-2">
                  <Input type="color" {...register("couleur_primaire")} className="w-16 h-10 p-1" />
                  <Input {...register("couleur_primaire")} placeholder="#0066CC" className="flex-1" />
                </div>
                {errors.couleur_primaire && (
                  <p className="text-sm text-destructive mt-1">{errors.couleur_primaire.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="couleur_secondaire">Couleur secondaire</Label>
                <div className="flex gap-2">
                  <Input type="color" {...register("couleur_secondaire")} className="w-16 h-10 p-1" />
                  <Input {...register("couleur_secondaire")} placeholder="#00CC66" className="flex-1" />
                </div>
                {errors.couleur_secondaire && (
                  <p className="text-sm text-destructive mt-1">{errors.couleur_secondaire.message}</p>
                )}
              </div>

              <div className="col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" {...register("notes")} rows={3} />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {client ? "Modifier" : "Créer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
