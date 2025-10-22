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
import { createSite, updateSite } from "@/lib/multi-tenant-queries";
import { Database } from "@/integrations/supabase/types";

type SiteRow = Database["public"]["Tables"]["sites"]["Row"];

const siteSchema = z.object({
  client_id: z.string().min(1, "Le client est requis"),
  nom_site: z.string().min(1, "Le nom du site est requis"),
  code_site: z.string().min(1, "Le code site est requis"),
  adresse: z.string().optional(),
  gouvernorat: z.string().optional(),
  classification: z.string().optional(),
  effectif: z.coerce.number().int().min(0).optional(),
  activite: z.string().optional(),
  superficie: z.coerce.number().min(0).optional(),
  responsable_site: z.string().optional(),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  telephone: z.string().optional(),
});

type SiteFormData = z.infer<typeof siteSchema>;

interface SiteFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  site?: SiteRow;
  clientId?: string;
}

export function SiteFormModal({ open, onOpenChange, site, clientId }: SiteFormModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<SiteFormData>({
    resolver: zodResolver(siteSchema),
    defaultValues: site ? {
      client_id: site.client_id,
      nom_site: site.nom_site,
      code_site: site.code_site,
      adresse: site.adresse || "",
      gouvernorat: site.gouvernorat || "",
      classification: site.classification || "",
      effectif: site.effectif || undefined,
      activite: site.activite || "",
      superficie: site.superficie || undefined,
      responsable_site: site.responsable_site || "",
      email: site.email || "",
      telephone: site.telephone || "",
    } : {
      client_id: clientId || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: createSite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sites"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast({ title: "Site créé avec succès" });
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
    mutationFn: ({ id, data }: { id: string; data: any }) => updateSite(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sites"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast({ title: "Site modifié avec succès" });
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

  const onSubmit = (data: SiteFormData) => {
    if (site) {
      updateMutation.mutate({ id: site.id, data });
    } else {
      createMutation.mutate(data as any);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{site ? "Modifier le site" : "Nouveau site"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Identification */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Identification</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nom_site">Nom du site *</Label>
                <Input id="nom_site" {...register("nom_site")} />
                {errors.nom_site && (
                  <p className="text-sm text-destructive mt-1">{errors.nom_site.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="code_site">Code site *</Label>
                <Input id="code_site" {...register("code_site")} placeholder="SITE-XXX-001" />
                {errors.code_site && (
                  <p className="text-sm text-destructive mt-1">{errors.code_site.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="classification">Classification</Label>
                <Input id="classification" {...register("classification")} placeholder="ICPE, Seveso..." />
              </div>

              <div>
                <Label htmlFor="activite">Activité</Label>
                <Input id="activite" {...register("activite")} />
              </div>
            </div>
          </div>

          {/* Localisation */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Localisation</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gouvernorat">Gouvernorat</Label>
                <Select onValueChange={(value) => setValue("gouvernorat", value)} defaultValue={site?.gouvernorat || ""}>
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
                <Label htmlFor="adresse">Adresse</Label>
                <Textarea id="adresse" {...register("adresse")} rows={2} />
              </div>
            </div>
          </div>

          {/* Caractéristiques */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Caractéristiques</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="effectif">Effectif</Label>
                <Input id="effectif" type="number" {...register("effectif")} />
                {errors.effectif && (
                  <p className="text-sm text-destructive mt-1">{errors.effectif.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="superficie">Superficie (m²)</Label>
                <Input id="superficie" type="number" {...register("superficie")} />
                {errors.superficie && (
                  <p className="text-sm text-destructive mt-1">{errors.superficie.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Responsable du site</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="responsable_site">Nom du responsable</Label>
                <Input id="responsable_site" {...register("responsable_site")} />
              </div>

              <div>
                <Label htmlFor="telephone">Téléphone</Label>
                <Input id="telephone" {...register("telephone")} />
              </div>

              <div className="col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {site ? "Modifier" : "Créer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
