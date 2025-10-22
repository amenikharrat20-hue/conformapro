import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient, updateClient, createSite } from "@/lib/multi-tenant-queries";
import { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { Card } from "@/components/ui/card";

type ClientRow = Database["public"]["Tables"]["clients"]["Row"];

const siteSchema = z.object({
  nom_site: z.string().min(1, "Le nom du site est requis"),
  code_site: z.string().min(1, "Le code site est requis"),
  adresse: z.string().optional(),
  gouvernorat: z.string().optional(),
});

const clientSchema = z.object({
  nom_legal: z.string().min(1, "Le nom légal est requis"),
  nature: z.string().optional(),
  matricule_fiscal: z.string().optional(),
  rne_rc: z.string().optional(),
  secteur: z.string().optional(),
  adresse_siege: z.string().optional(),
  gouvernorat: z.string().optional(),
  logo_url: z.string().optional(),
  couleur_primaire: z.string().optional(),
  couleur_secondaire: z.string().optional(),
  statut: z.string().optional(),
  abonnement_type: z.string().optional(),
  contrat_sla: z.string().optional(),
  notes: z.string().optional(),
  sites: z.array(siteSchema).optional(),
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
    control,
    setValue,
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: client || { sites: [], statut: "actif", abonnement_type: "standard" },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "sites",
  });

const createMutation = useMutation({
    mutationFn: async (data: ClientFormData) => {
      const { sites, ...clientData } = data;
      const newClient = await createClient(clientData as any);
      
      // Create sites if any
      if (sites && sites.length > 0) {
        await Promise.all(
          sites.map(site => 
            createSite({ ...site, client_id: newClient.id, nom_site: site.nom_site, code_site: site.code_site } as any)
          )
        );
      }
      
      return newClient;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["sites"] });
      toast({
        title: "Client créé",
        description: "Le client et ses sites ont été créés avec succès.",
      });
      reset();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer le client.",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ clientId, updates }: { clientId: string; updates: any }) => 
      updateClient(clientId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast({
        title: "Client modifié",
        description: "Le client a été modifié avec succès.",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le client.",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  const onSubmit = async (data: ClientFormData) => {
    if (client) {
      const { sites, ...clientData } = data;
      updateMutation.mutate({ clientId: client.id, updates: clientData as any });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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

          {/* Sites (only when creating new client) */}
          {!client && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Sites</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ nom_site: "", code_site: "", adresse: "", gouvernorat: "" })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un site
                </Button>
              </div>

              {fields.length === 0 && (
                <p className="text-sm text-muted-foreground">Aucun site ajouté. Cliquez sur "Ajouter un site" pour commencer.</p>
              )}

              {fields.map((field, index) => (
                <Card key={field.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium text-sm">Site {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor={`sites.${index}.nom_site`}>Nom du site *</Label>
                      <Input {...register(`sites.${index}.nom_site` as const)} />
                      {errors.sites?.[index]?.nom_site && (
                        <p className="text-sm text-destructive mt-1">{errors.sites[index]?.nom_site?.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor={`sites.${index}.code_site`}>Code site *</Label>
                      <Input {...register(`sites.${index}.code_site` as const)} />
                      {errors.sites?.[index]?.code_site && (
                        <p className="text-sm text-destructive mt-1">{errors.sites[index]?.code_site?.message}</p>
                      )}
                    </div>

                    <div className="col-span-2">
                      <Label htmlFor={`sites.${index}.adresse`}>Adresse</Label>
                      <Input {...register(`sites.${index}.adresse` as const)} />
                    </div>

                    <div>
                      <Label htmlFor={`sites.${index}.gouvernorat`}>Gouvernorat</Label>
                      <Select onValueChange={(value) => setValue(`sites.${index}.gouvernorat` as const, value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner..." />
                        </SelectTrigger>
                        <SelectContent className="bg-background border border-border z-50">
                          <SelectItem value="Ariana">Ariana</SelectItem>
                          <SelectItem value="Tunis">Tunis</SelectItem>
                          <SelectItem value="Sousse">Sousse</SelectItem>
                          <SelectItem value="Sfax">Sfax</SelectItem>
                          <SelectItem value="Monastir">Monastir</SelectItem>
                          <SelectItem value="Nabeul">Nabeul</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

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
