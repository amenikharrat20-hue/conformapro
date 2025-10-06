import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, Building2, MapPin, Phone, Mail, FileText, 
  Factory, Users, AlertTriangle, TrendingUp, Edit, Plus
} from "lucide-react";

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data - will be replaced with real Supabase query
  const client = {
    id: "00000000-0000-0000-0000-000000000001",
    nom_legal: "ConformaTech Industries",
    rne_rc: "B123456782023",
    matricule_fiscal: "1234567/A/M/000",
    secteur: "Automobile",
    gouvernorat: "Sousse",
    adresse_siege: "Zone Industrielle Kheireddine, Rue de l'Innovation",
    conformity_score: 87,
    contacts: [
      { nom: "Ahmed Benali", fonction: "Directeur Général", email: "a.benali@conformatech.tn", telephone: "+216 73 100 200" },
      { nom: "Sara Trabelsi", fonction: "Responsable HSE", email: "s.trabelsi@conformatech.tn", telephone: "+216 73 100 201" }
    ],
    notes: "Client démo - Industrie automobile spécialisée en composants électroniques"
  };

  const sites = [
    {
      id: "site-1",
      code_site: "SITE-SSE-001",
      nom_site: "Usine Sousse",
      gouvernorat: "Sousse",
      effectif: 150,
      conformity_score: 92
    },
    {
      id: "site-2",
      code_site: "SITE-SFX-002",
      nom_site: "Entrepôt Sfax",
      gouvernorat: "Sfax",
      effectif: 45,
      conformity_score: 78
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate("/clients")}
          className="w-fit"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux clients
        </Button>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                {client.nom_legal}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant="outline">{client.secteur}</Badge>
                <Badge variant="outline">{client.gouvernorat}</Badge>
                <Badge variant={client.conformity_score >= 80 ? "default" : "secondary"}>
                  {client.conformity_score}% conforme
                </Badge>
              </div>
            </div>
          </div>
          <Button className="bg-gradient-primary shadow-medium w-full sm:w-auto">
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardDescription>Sites</CardDescription>
            <CardTitle className="text-3xl">{sites.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardDescription>Effectif total</CardDescription>
            <CardTitle className="text-3xl">195</CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardDescription>Alertes actives</CardDescription>
            <CardTitle className="text-3xl text-warning">8</CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardDescription>Score conformité</CardDescription>
            <CardTitle className="text-3xl text-success">{client.conformity_score}%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="apercu" className="space-y-6">
        <TabsList className="w-full sm:w-auto grid grid-cols-4 sm:inline-grid">
          <TabsTrigger value="apercu">Aperçu</TabsTrigger>
          <TabsTrigger value="sites">Sites</TabsTrigger>
          <TabsTrigger value="utilisateurs">Utilisateurs</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="apercu" className="space-y-6">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">RNE / RC</p>
                  <p className="text-sm mt-1">{client.rne_rc}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Matricule fiscal</p>
                  <p className="text-sm mt-1">{client.matricule_fiscal}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Secteur d'activité</p>
                  <p className="text-sm mt-1">{client.secteur}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Gouvernorat</p>
                  <p className="text-sm mt-1">{client.gouvernorat}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Adresse siège social</p>
                  <p className="text-sm mt-1">{client.adresse_siege}</p>
                </div>
              </div>
              {client.notes && (
                <div className="pt-4 border-t border-border">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Notes</p>
                  <p className="text-sm">{client.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Contacts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {client.contacts.map((contact, index) => (
                  <div key={index} className="p-4 rounded-lg border border-border">
                    <p className="font-medium">{contact.nom}</p>
                    <p className="text-sm text-muted-foreground">{contact.fonction}</p>
                    <div className="flex flex-col sm:flex-row gap-2 mt-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{contact.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{contact.telephone}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sites" className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">{sites.length} site(s) enregistré(s)</p>
            <Button size="sm" className="bg-gradient-primary">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un site
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {sites.map((site) => (
              <Card 
                key={site.id}
                className="shadow-soft hover:shadow-medium transition-shadow cursor-pointer"
                onClick={() => navigate(`/sites/${site.id}`)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge variant="outline" className="text-xs mb-2">{site.code_site}</Badge>
                      <CardTitle className="text-lg">{site.nom_site}</CardTitle>
                    </div>
                    <Factory className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{site.gouvernorat}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{site.effectif} employés</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="text-sm text-muted-foreground">Conformité</span>
                      <Badge variant={site.conformity_score >= 80 ? "default" : "secondary"}>
                        {site.conformity_score}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="utilisateurs">
          <Card className="shadow-soft">
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Gestion des utilisateurs à venir</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card className="shadow-soft">
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Gestion des documents à venir</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
