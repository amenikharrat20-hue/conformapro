import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  createSite, 
  updateSite, 
  fetchClientById,
  listModulesSysteme,
  listSiteModules,
  toggleSiteModule,
  listDomaines,
  listSiteVeilleDomaines,
  toggleSiteVeilleDomaine
} from "@/lib/multi-tenant-queries";
import { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Building2, Settings, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

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
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("info");

  // Check user role
  useEffect(() => {
    const checkRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      const hasAdminRole = roles?.some(r => 
        r.role === 'admin_global' || r.role === 'admin_client'
      );
      setIsAdmin(hasAdminRole || false);
    };
    checkRole();
  }, []);

  // Fetch client details if we have a site
  const { data: clientData } = useQuery({
    queryKey: ["client", site?.client_id],
    queryFn: () => site ? fetchClientById(site.client_id) : Promise.resolve(null),
    enabled: !!site?.client_id,
  });

  // Fetch modules system
  const { data: modulesSysteme = [] } = useQuery({
    queryKey: ["modules-systeme"],
    queryFn: listModulesSysteme,
  });

  // Fetch site modules
  const { data: siteModules = [], refetch: refetchSiteModules } = useQuery({
    queryKey: ["site-modules", site?.id],
    queryFn: () => site?.id ? listSiteModules(site.id) : Promise.resolve([]),
    enabled: !!site?.id,
  });

  // Fetch domaines
  const { data: domaines = [] } = useQuery({
    queryKey: ["domaines"],
    queryFn: listDomaines,
  });

  // Fetch site veille domaines
  const { data: siteVeilleDomaines = [], refetch: refetchVeilleDomaines } = useQuery({
    queryKey: ["site-veille-domaines", site?.id],
    queryFn: () => site?.id ? listSiteVeilleDomaines(site.id) : Promise.resolve([]),
    enabled: !!site?.id,
  });

  // Check if VEILLE module is enabled
  const veilleModule = siteModules.find((sm: any) => sm.modules_systeme?.code === 'VEILLE');
  const isVeilleEnabled = veilleModule?.enabled || false;
  
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

  const handleToggleModule = async (moduleCode: string, enabled: boolean) => {
    if (!site?.id || !isAdmin) {
      toast({
        title: "Non autorisé",
        description: "Vous n'avez pas l'autorisation de modifier les modules de ce site.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      await toggleSiteModule(site.id, moduleCode, enabled, user?.id);
      await refetchSiteModules();
      
      if (moduleCode === 'VEILLE' && !enabled) {
        await refetchVeilleDomaines();
        toast({
          title: enabled ? "Module activé" : "Module désactivé",
          description: "Les domaines de veille ont été désactivés car le module Veille réglementaire est OFF.",
        });
      } else {
        toast({
          title: enabled ? "Module activé pour ce site" : "Module désactivé pour ce site",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleDomaine = async (domaineId: string, enabled: boolean) => {
    if (!site?.id || !isAdmin) {
      toast({
        title: "Non autorisé",
        description: "Vous n'avez pas l'autorisation de modifier les domaines de ce site.",
        variant: "destructive",
      });
      return;
    }

    try {
      await toggleSiteVeilleDomaine(site.id, domaineId, enabled);
      await refetchVeilleDomaines();
      toast({
        title: enabled ? "Domaine activé" : "Domaine désactivé",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const isModuleEnabled = (moduleCode: string) => {
    return siteModules.find((sm: any) => 
      sm.modules_systeme?.code === moduleCode
    )?.enabled || false;
  };

  const isDomaineEnabled = (domaineId: string) => {
    return siteVeilleDomaines.find((svd: any) => 
      svd.domaine_id === domaineId
    )?.enabled || false;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{site ? "Modifier le site" : "Nouveau site"}</DialogTitle>
        </DialogHeader>

        {/* Show parent client info when editing */}
        {site && clientData && (
          <div className="mb-4 p-3 bg-muted rounded-md flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              <strong>Client:</strong> {clientData.nom_legal}
            </span>
            <Badge variant="outline">{clientData.statut}</Badge>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Informations</TabsTrigger>
            {site && <TabsTrigger value="modules">Modules & Domaines</TabsTrigger>}
          </TabsList>

          <TabsContent value="info">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Show parent client info when editing */}
          {site && clientData && (
            <div className="mb-4 p-3 bg-muted rounded-md flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>Client:</strong> {clientData.nom_legal}
              </span>
              <Badge variant="outline">{clientData.statut}</Badge>
            </div>
          )}

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
          </TabsContent>

          {site && (
            <TabsContent value="modules" className="space-y-6 mt-4">
              {!isAdmin && (
                <div className="bg-muted/50 border border-border rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    Vous n'avez pas l'autorisation de modifier les modules de ce site.
                  </p>
                </div>
              )}

              {/* Modules du site */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  <h3 className="font-semibold">Modules du site</h3>
                </div>
                
                <div className="space-y-3 bg-muted/30 rounded-lg p-4">
                  {modulesSysteme.map((module: any) => (
                    <div key={module.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div className="flex-1">
                        <p className="font-medium">{module.libelle}</p>
                        {module.description && (
                          <p className="text-sm text-muted-foreground">{module.description}</p>
                        )}
                      </div>
                      <Switch
                        checked={isModuleEnabled(module.code)}
                        onCheckedChange={(checked) => handleToggleModule(module.code, checked)}
                        disabled={!isAdmin}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Domaines de veille (only visible if VEILLE module is enabled) */}
              {isVeilleEnabled && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    <h3 className="font-semibold">Domaines de la veille réglementaire</h3>
                  </div>
                  
                  <div className="space-y-3 bg-muted/30 rounded-lg p-4">
                    {domaines.map((domaine: any) => (
                      <div key={domaine.id} className="flex items-start gap-3 py-2">
                        <Checkbox
                          id={`domaine-${domaine.id}`}
                          checked={isDomaineEnabled(domaine.id)}
                          onCheckedChange={(checked) => handleToggleDomaine(domaine.id, checked as boolean)}
                          disabled={!isAdmin}
                          className="mt-1"
                        />
                        <label
                          htmlFor={`domaine-${domaine.id}`}
                          className="flex-1 cursor-pointer"
                        >
                          <p className="font-medium">{domaine.libelle}</p>
                          {domaine.description && (
                            <p className="text-sm text-muted-foreground">{domaine.description}</p>
                          )}
                          <Badge variant="outline" className="mt-1">{domaine.code}</Badge>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!isVeilleEnabled && (
                <div className="bg-muted/50 border border-border rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Module Veille réglementaire désactivé</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Activez le module "Veille réglementaire" pour configurer les domaines applicables à ce site.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Fermer
                </Button>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
