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
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  createSite, 
  updateSite,
  fetchClients,
  fetchClientById,
  listModulesSysteme,
  listSiteModules,
  toggleSiteModule,
  listDomaines,
  listSiteVeilleDomaines,
  toggleSiteVeilleDomaine,
  listGouvernorats,
  listDelegationsByGouvernorat,
  listLocalitesByDelegation,
} from "@/lib/multi-tenant-queries";
import { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Building2, Settings, AlertCircle, MapPin, Activity, Wrench } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

type SiteRow = Database["public"]["Tables"]["sites"]["Row"];

const siteSchema = z.object({
  client_id: z.string().min(1, "Le client est requis"),
  nom_site: z.string().min(1, "Le nom du site est requis"),
  code_site: z.string().min(1, "Le code site est requis"),
  classification: z.string().min(1, "La classification est requise"),
  secteur_activite: z.string().min(1, "Le secteur d'activité est requis"),
  est_siege: z.boolean().default(false),
  adresse: z.string().optional(),
  gouvernorat: z.string().min(1, "Le gouvernorat est requis"),
  delegation: z.string().min(1, "La délégation est requise"),
  localite: z.string().min(1, "La localité est requise"),
  code_postal: z.string().optional(),
  ville: z.string().optional(),
  coordonnees_gps_lat: z.coerce.number().optional().nullable(),
  coordonnees_gps_lng: z.coerce.number().optional().nullable(),
  effectif: z.coerce.number().int().min(0, "L'effectif doit être ≥ 0"),
  superficie: z.coerce.number().min(0, "La superficie doit être ≥ 0").optional().nullable(),
  activite: z.string().optional(),
});

type SiteFormData = z.infer<typeof siteSchema>;

interface SiteFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  site?: SiteRow;
  clientId?: string;
}

const CLASSIFICATIONS = [
  "1ère catégorie",
  "2ème catégorie",
  "3ème catégorie",
  "ERP",
  "EOP",
  "Non classé",
];

const SECTEURS = [
  "Chimique",
  "Pharmaceutique",
  "Agroalimentaire",
  "Pétrolière",
  "Logistique",
  "Tertiaire",
  "Énergie",
  "Autre",
];

const EQUIPEMENTS = [
  { key: "ria", label: "RIA (Robinets d'Incendie Armés)" },
  { key: "extincteurs", label: "Extincteurs" },
  { key: "ssi", label: "SSI (Système de Sécurité Incendie)" },
  { key: "electricite_bt", label: "Électricité BT" },
  { key: "electricite_ht", label: "Électricité HT" },
  { key: "monte_charge", label: "Monte-charge" },
  { key: "appareils_pression", label: "Appareils sous pression" },
  { key: "chaudiere", label: "Chaudière" },
  { key: "gaz", label: "Gaz" },
  { key: "froid", label: "Installation de froid" },
  { key: "levage", label: "Engins de levage" },
];

export function SiteFormModal({ open, onOpenChange, site, clientId }: SiteFormModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [selectedGouvernoratId, setSelectedGouvernoratId] = useState<string | null>(null);
  const [selectedDelegationId, setSelectedDelegationId] = useState<string | null>(null);
  const [equipements, setEquipements] = useState<Record<string, boolean>>({});

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

  // Load equipements from site data
  useEffect(() => {
    if (site?.equipements_critiques) {
      setEquipements(site.equipements_critiques as Record<string, boolean>);
    }
  }, [site]);

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: fetchClients,
  });

  const { data: clientData } = useQuery({
    queryKey: ["client", site?.client_id || clientId],
    queryFn: () => fetchClientById(site?.client_id || clientId || ""),
    enabled: !!(site?.client_id || clientId),
  });

  const { data: gouvernorats = [] } = useQuery({
    queryKey: ["gouvernorats"],
    queryFn: listGouvernorats,
  });

  const { data: delegations = [] } = useQuery({
    queryKey: ["delegations", selectedGouvernoratId],
    queryFn: () => listDelegationsByGouvernorat(selectedGouvernoratId!),
    enabled: !!selectedGouvernoratId,
  });

  const { data: localites = [] } = useQuery({
    queryKey: ["localites", selectedDelegationId],
    queryFn: () => listLocalitesByDelegation(selectedDelegationId!),
    enabled: !!selectedDelegationId,
  });

  const { data: modulesSysteme = [] } = useQuery({
    queryKey: ["modules-systeme"],
    queryFn: listModulesSysteme,
  });

  const { data: siteModules = [], refetch: refetchSiteModules } = useQuery({
    queryKey: ["site-modules", site?.id],
    queryFn: () => site?.id ? listSiteModules(site.id) : Promise.resolve([]),
    enabled: !!site?.id,
  });

  const { data: domaines = [] } = useQuery({
    queryKey: ["domaines"],
    queryFn: listDomaines,
  });

  const { data: siteVeilleDomaines = [], refetch: refetchVeilleDomaines } = useQuery({
    queryKey: ["site-veille-domaines", site?.id],
    queryFn: () => site?.id ? listSiteVeilleDomaines(site.id) : Promise.resolve([]),
    enabled: !!site?.id,
  });

  const veilleModule = siteModules.find((sm: any) => sm.modules_systeme?.code === 'VEILLE');
  const isVeilleEnabled = veilleModule?.enabled || false;
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    control,
  } = useForm<SiteFormData>({
    resolver: zodResolver(siteSchema),
    defaultValues: site ? {
      client_id: site.client_id,
      nom_site: site.nom_site,
      code_site: site.code_site,
      classification: site.classification || "",
      secteur_activite: site.secteur_activite || "",
      est_siege: site.est_siege || false,
      adresse: site.adresse || "",
      gouvernorat: site.gouvernorat || "",
      delegation: site.delegation || "",
      localite: site.localite || "",
      code_postal: site.code_postal || "",
      ville: site.ville || "",
      coordonnees_gps_lat: site.coordonnees_gps_lat || null,
      coordonnees_gps_lng: site.coordonnees_gps_lng || null,
      effectif: site.effectif || 0,
      superficie: site.superficie || null,
      activite: site.activite || "",
    } : {
      client_id: clientId || "",
      est_siege: false,
      effectif: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: SiteFormData) => {
      const siteData = {
        ...data,
        equipements_critiques: equipements,
      };
      return createSite(siteData as any);
    },
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
    mutationFn: async ({ id, data }: { id: string; data: SiteFormData }) => {
      const siteData = {
        ...data,
        equipements_critiques: equipements,
      };
      return updateSite(id, siteData as any);
    },
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
      createMutation.mutate(data);
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
          title: "Module désactivé pour ce site",
          description: "Les domaines de veille ont été désactivés (VEILLE OFF).",
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

  const handleGouvernoratChange = async (gouvernoratNom: string) => {
    setValue("gouvernorat", gouvernoratNom);
    setValue("delegation", "");
    setValue("localite", "");
    setValue("code_postal", "");
    
    const gov = gouvernorats.find((g: any) => g.nom === gouvernoratNom);
    setSelectedGouvernoratId(gov?.id || null);
    setSelectedDelegationId(null);
  };

  const handleDelegationChange = async (delegationNom: string) => {
    setValue("delegation", delegationNom);
    setValue("localite", "");
    setValue("code_postal", "");
    
    const deleg = delegations.find((d: any) => d.nom === delegationNom);
    setSelectedDelegationId(deleg?.id || null);
  };

  const handleLocaliteChange = (localiteNom: string) => {
    setValue("localite", localiteNom);
    
    const loc = localites.find((l: any) => l.nom === localiteNom);
    if (loc?.code_postal) {
      setValue("code_postal", loc.code_postal);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{site ? "Modifier le site" : "Nouveau site"}</DialogTitle>
        </DialogHeader>

        {(site || clientId) && clientData && (
          <div className="mb-4 p-3 bg-muted rounded-md flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              <strong>Client:</strong> {clientData.nom_legal}
            </span>
            {clientData.statut && (
              <Badge variant="outline">{clientData.statut}</Badge>
            )}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="adresse">Adresse</TabsTrigger>
            <TabsTrigger value="activite">Activité</TabsTrigger>
            <TabsTrigger value="equipements">Équipements</TabsTrigger>
            {site && <TabsTrigger value="modules">Modules</TabsTrigger>}
          </TabsList>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
            {/* Tab 1: Général */}
            <TabsContent value="general" className="space-y-4">
              {!site && !clientId && (
                <div>
                  <Label htmlFor="client_id">Client *</Label>
                  <Controller
                    name="client_id"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un client..." />
                        </SelectTrigger>
                        <SelectContent className="bg-background border border-border z-50 max-h-60 overflow-y-auto">
                          {clients.map((client: any) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.nom_legal}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.client_id && (
                    <p className="text-sm text-destructive mt-1">{errors.client_id.message}</p>
                  )}
                </div>
              )}

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
                  <Input id="code_site" {...register("code_site")} placeholder="SITE-001" />
                  {errors.code_site && (
                    <p className="text-sm text-destructive mt-1">{errors.code_site.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="classification">Classification *</Label>
                  <Controller
                    name="classification"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner..." />
                        </SelectTrigger>
                        <SelectContent className="bg-background border border-border z-50">
                          {CLASSIFICATIONS.map((classif) => (
                            <SelectItem key={classif} value={classif}>
                              {classif}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.classification && (
                    <p className="text-sm text-destructive mt-1">{errors.classification.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="secteur_activite">Secteur d'activité *</Label>
                  <Controller
                    name="secteur_activite"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner..." />
                        </SelectTrigger>
                        <SelectContent className="bg-background border border-border z-50">
                          {SECTEURS.map((secteur) => (
                            <SelectItem key={secteur} value={secteur}>
                              {secteur}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.secteur_activite && (
                    <p className="text-sm text-destructive mt-1">{errors.secteur_activite.message}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Controller
                  name="est_siege"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="est_siege"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor="est_siege" className="cursor-pointer">
                  Est siège social
                  <span className="text-xs text-muted-foreground ml-2">
                    (un seul siège par client)
                  </span>
                </Label>
              </div>
            </TabsContent>

            {/* Tab 2: Adresse */}
            <TabsContent value="adresse" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="adresse">Adresse</Label>
                  <Textarea id="adresse" {...register("adresse")} rows={2} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="gouvernorat">Gouvernorat *</Label>
                    <Controller
                      name="gouvernorat"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleGouvernoratChange(value);
                          }}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner..." />
                          </SelectTrigger>
                          <SelectContent className="bg-background border border-border z-50 max-h-60 overflow-y-auto">
                            {gouvernorats.map((gov: any) => (
                              <SelectItem key={gov.id} value={gov.nom}>
                                {gov.nom}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.gouvernorat && (
                      <p className="text-sm text-destructive mt-1">{errors.gouvernorat.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="delegation">Délégation *</Label>
                    <Controller
                      name="delegation"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleDelegationChange(value);
                          }}
                          value={field.value}
                          disabled={!selectedGouvernoratId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner..." />
                          </SelectTrigger>
                          <SelectContent className="bg-background border border-border z-50 max-h-60 overflow-y-auto">
                            {delegations.map((deleg: any) => (
                              <SelectItem key={deleg.id} value={deleg.nom}>
                                {deleg.nom}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.delegation && (
                      <p className="text-sm text-destructive mt-1">{errors.delegation.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="localite">Localité *</Label>
                    <Controller
                      name="localite"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleLocaliteChange(value);
                          }}
                          value={field.value}
                          disabled={!selectedDelegationId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner..." />
                          </SelectTrigger>
                          <SelectContent className="bg-background border border-border z-50 max-h-60 overflow-y-auto">
                            {localites.map((loc: any) => (
                              <SelectItem key={loc.id} value={loc.nom}>
                                {loc.nom}
                                {loc.code_postal && (
                                  <span className="text-muted-foreground ml-2">
                                    ({loc.code_postal})
                                  </span>
                                )}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.localite && (
                      <p className="text-sm text-destructive mt-1">{errors.localite.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="code_postal">Code postal</Label>
                    <Input id="code_postal" {...register("code_postal")} placeholder="Auto depuis localité" />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="ville">Ville</Label>
                    <Input id="ville" {...register("ville")} />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <Label className="text-sm font-medium mb-2 block">
                    Coordonnées GPS (optionnel)
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="coordonnees_gps_lat" className="text-xs">Latitude</Label>
                      <Input
                        id="coordonnees_gps_lat"
                        type="number"
                        step="any"
                        {...register("coordonnees_gps_lat")}
                        placeholder="Ex: 36.8065"
                      />
                    </div>
                    <div>
                      <Label htmlFor="coordonnees_gps_lng" className="text-xs">Longitude</Label>
                      <Input
                        id="coordonnees_gps_lng"
                        type="number"
                        step="any"
                        {...register("coordonnees_gps_lng")}
                        placeholder="Ex: 10.1815"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab 3: Activité & Risques */}
            <TabsContent value="activite" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="effectif">Effectif *</Label>
                  <Input
                    id="effectif"
                    type="number"
                    min="0"
                    {...register("effectif")}
                  />
                  {errors.effectif && (
                    <p className="text-sm text-destructive mt-1">{errors.effectif.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="superficie">Superficie (m²)</Label>
                  <Input
                    id="superficie"
                    type="number"
                    min="0"
                    step="0.01"
                    {...register("superficie")}
                  />
                  {errors.superficie && (
                    <p className="text-sm text-destructive mt-1">{errors.superficie.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="activite">Activités</Label>
                <Textarea
                  id="activite"
                  {...register("activite")}
                  rows={4}
                  placeholder="Décrivez les activités principales du site..."
                />
              </div>
            </TabsContent>

            {/* Tab 4: Équipements critiques */}
            <TabsContent value="equipements" className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg mb-4">
                <p className="text-sm text-muted-foreground flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>
                    Cochez les équipements présents sur le site pour activer les contrôles 
                    techniques réglementaires associés.
                  </span>
                </p>
              </div>

              <Card className="p-4">
                <div className="space-y-3">
                  {EQUIPEMENTS.map((equip) => (
                    <div key={equip.key} className="flex items-start space-x-3 py-2">
                      <Checkbox
                        id={`equip-${equip.key}`}
                        checked={equipements[equip.key] || false}
                        onCheckedChange={(checked) => {
                          setEquipements(prev => ({
                            ...prev,
                            [equip.key]: checked as boolean,
                          }));
                        }}
                      />
                      <Label
                        htmlFor={`equip-${equip.key}`}
                        className="text-sm font-normal cursor-pointer leading-tight"
                      >
                        {equip.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* Tab 5: Modules & Domaines (only for editing) */}
            {site && (
              <TabsContent value="modules" className="space-y-6">
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
                  
                  <Card className="p-4">
                    <div className="space-y-3">
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
                  </Card>
                </div>

                {/* Domaines de veille (only visible if VEILLE module is enabled) */}
                {isVeilleEnabled && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      <h3 className="font-semibold">Domaines de la veille réglementaire</h3>
                    </div>
                    
                    <Card className="p-4">
                      <div className="space-y-3">
                        {domaines.map((domaine: any) => (
                          <div key={domaine.id} className="flex items-start gap-3 py-2">
                            <Checkbox
                              id={`domaine-${domaine.id}`}
                              checked={isDomaineEnabled(domaine.id)}
                              onCheckedChange={(checked) => handleToggleDomaine(domaine.id, checked as boolean)}
                              disabled={!isAdmin}
                              className="mt-1"
                            />
                            <Label
                              htmlFor={`domaine-${domaine.id}`}
                              className="flex-1 cursor-pointer leading-tight"
                            >
                              <span className="font-medium">{domaine.libelle}</span>
                              {domaine.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {domaine.description}
                                </p>
                              )}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}

                {!isVeilleEnabled && (
                  <div className="bg-muted/50 border border-border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">
                      Activez le module "Veille réglementaire" pour configurer les domaines.
                    </p>
                  </div>
                )}
              </TabsContent>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {site ? "Modifier" : "Créer"}
              </Button>
            </div>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
