import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { createClient, updateClient, createSite, fetchSites, listSiteModules } from "@/lib/multi-tenant-queries";
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
import { Plus, X, Building2, Settings } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

type ClientRow = Database["public"]["Tables"]["clients"]["Row"];

const siteSchema = z.object({
  nom_site: z.string().min(1, "Le nom du site est requis"),
  code_site: z.string().min(1, "Le code site est requis"),
  adresse: z.string().optional(),
  gouvernorat: z.string().optional(),
});

const clientSchema = z.object({
  nom_legal: z.string().min(1, "Le nom légal est requis"),
  secteur: z.string().optional(),
  matricule_fiscal: z.string().optional(),
  rne_rc: z.string().optional(),
  telephone: z.string().optional(),
  email: z.string().email("Format email invalide").optional().or(z.literal("")),
  site_web: z.string().url("Format URL invalide").optional().or(z.literal("")),
  adresse_siege: z.string().optional(),
  gouvernorat: z.string().optional(),
  delegation: z.string().optional(),
  code_postal: z.string().optional(),
  statut: z.string().optional(),
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
  const navigate = useNavigate();

  const { data: clientSites } = useQuery({
    queryKey: ["sites", client?.id],
    queryFn: () => fetchSites().then(sites => sites.filter(s => s.client_id === client?.id)),
    enabled: !!client?.id,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setValue,
    watch,
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: client || { sites: [], statut: "actif" },
  });

  const gouvernoratValue = watch("gouvernorat");

  const { fields, append, remove } = useFieldArray({
    control,
    name: "sites",
  });

const createMutation = useMutation({
    mutationFn: async (data: ClientFormData) => {
      const { sites, ...clientData } = data;
      console.log("Creating client with data:", clientData);
      const newClient = await createClient(clientData as any);
      console.log("Client created successfully:", newClient);
      
      // Create sites if any
      if (sites && sites.length > 0) {
        console.log("Creating sites:", sites);
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
    onError: (error: any) => {
      console.error("Full error object:", error);
      console.error("Error message:", error?.message);
      console.error("Error details:", error?.details);
      console.error("Error hint:", error?.hint);
      console.error("Error code:", error?.code);
      
      const errorMessage = error?.message || error?.details || "Impossible de créer le client.";
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
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

  const gouvernorats = [
    "Ariana", "Béja", "Ben Arous", "Bizerte", "Gabès", "Gafsa", "Jendouba",
    "Kairouan", "Kasserine", "Kébili", "Le Kef", "Mahdia", "La Manouba",
    "Médenine", "Monastir", "Nabeul", "Sfax", "Sidi Bouzid", "Siliana",
    "Sousse", "Tataouine", "Tozeur", "Tunis", "Zaghouan"
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{client ? "Modifier le client" : "Nouveau client"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="identification" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="identification">
                <Building2 className="h-4 w-4 mr-2" />
                Identification & Adresse
              </TabsTrigger>
              <TabsTrigger value="configuration">
                <Settings className="h-4 w-4 mr-2" />
                Configuration & Modules
              </TabsTrigger>
            </TabsList>

            <TabsContent value="identification" className="space-y-6 mt-6">
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
                    <Label htmlFor="secteur">Secteur d'activité</Label>
                    <Select onValueChange={(value) => setValue("secteur", value)} defaultValue={client?.secteur || ""}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent className="bg-background border border-border z-50">
                        <SelectItem value="Industriel">Industriel</SelectItem>
                        <SelectItem value="Services">Services</SelectItem>
                        <SelectItem value="Commerce">Commerce</SelectItem>
                        <SelectItem value="Administration">Administration</SelectItem>
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

                  <div>
                    <Label htmlFor="telephone">Téléphone</Label>
                    <Input 
                      id="telephone" 
                      {...register("telephone")} 
                      placeholder="+216 xx xxx xxx"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email"
                      {...register("email")} 
                      placeholder="contact@entreprise.tn"
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="site_web">Site web</Label>
                    <Input 
                      id="site_web" 
                      {...register("site_web")} 
                      placeholder="https://www.entreprise.tn"
                    />
                    {errors.site_web && (
                      <p className="text-sm text-destructive mt-1">{errors.site_web.message}</p>
                    )}
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
                            <SelectContent className="bg-background border border-border z-50 max-h-60 overflow-y-auto">
                              {gouvernorats.map(gov => (
                                <SelectItem key={gov} value={gov}>{gov}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Adresse */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Adresse du siège social</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="adresse_siege">Adresse complète</Label>
                    <Textarea id="adresse_siege" {...register("adresse_siege")} rows={2} />
                  </div>

                  <div>
                    <Label htmlFor="gouvernorat">Gouvernorat *</Label>
                    <Select 
                      onValueChange={(value) => setValue("gouvernorat", value)} 
                      defaultValue={client?.gouvernorat || ""}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent className="bg-background border border-border z-50 max-h-60 overflow-y-auto">
                        {gouvernorats.map(gov => (
                          <SelectItem key={gov} value={gov}>{gov}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="delegation">Délégation</Label>
                    <Input 
                      id="delegation" 
                      {...register("delegation")} 
                      placeholder="Ex: La Marsa"
                    />
                  </div>

                  <div>
                    <Label htmlFor="code_postal">Code postal</Label>
                    <Input 
                      id="code_postal" 
                      {...register("code_postal")} 
                      placeholder="Ex: 2046"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="configuration" className="space-y-6 mt-6">
              {/* Configuration */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Configuration</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="statut">Statut</Label>
                    <Select onValueChange={(value) => setValue("statut", value)} defaultValue={client?.statut || "actif"}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background border border-border z-50">
                        <SelectItem value="actif">Actif</SelectItem>
                        <SelectItem value="suspendu">Suspendu</SelectItem>
                        <SelectItem value="archivé">Archivé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Résumé par site (read-only) */}
              {client && clientSites && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">Résumé par site</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onOpenChange(false);
                        navigate(`/sites?client=${client.id}`);
                      }}
                    >
                      Gérer les modules par site
                    </Button>
                  </div>

                  <Card className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Nombre de sites</span>
                        <Badge variant="secondary">{clientSites.length}</Badge>
                      </div>
                      
                      {clientSites.length > 0 && (
                        <div className="border-t pt-3 space-y-2">
                          <p className="text-sm text-muted-foreground">Sites:</p>
                          <div className="flex flex-wrap gap-2">
                            {clientSites.map(site => (
                              <Badge key={site.id} variant="outline">
                                {site.nom_site}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>

                  {clientSites.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Aucun site configuré. Créez des sites pour activer les modules.
                    </p>
                  )}
                </div>
              )}

              {!client && (
                <Card className="p-4 bg-muted/50">
                  <p className="text-sm text-muted-foreground">
                    La configuration des modules sera disponible après la création du client et de ses sites.
                  </p>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t">
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
