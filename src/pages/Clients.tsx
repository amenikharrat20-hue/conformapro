import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus, Search, MapPin, Factory } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Clients() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - will be replaced with real Supabase queries
  const clients = [
    {
      id: "00000000-0000-0000-0000-000000000001",
      nom_legal: "ConformaTech Industries",
      rne_rc: "B123456782023",
      matricule_fiscal: "1234567/A/M/000",
      secteur: "Automobile",
      gouvernorat: "Sousse",
      sites_count: 2,
      conformity_score: 87
    }
  ];

  const filteredClients = clients.filter(client =>
    client.nom_legal.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.secteur.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Clients</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Gestion des clients et organisations
          </p>
        </div>
        <Button className="bg-gradient-primary shadow-medium w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un client
        </Button>
      </div>

      {/* Search and filters */}
      <Card className="shadow-soft">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou secteur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardDescription>Total clients</CardDescription>
            <CardTitle className="text-3xl">{clients.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardDescription>Sites actifs</CardDescription>
            <CardTitle className="text-3xl">2</CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardDescription>Conformité moyenne</CardDescription>
            <CardTitle className="text-3xl text-success">87%</CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardDescription>Alertes actives</CardDescription>
            <CardTitle className="text-3xl text-warning">12</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Clients list */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredClients.map((client) => (
          <Card 
            key={client.id} 
            className="shadow-soft hover:shadow-medium transition-shadow cursor-pointer"
            onClick={() => navigate(`/clients/${client.id}`)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{client.nom_legal}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      RNE: {client.rne_rc}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Factory className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{client.secteur}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{client.gouvernorat}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-sm text-muted-foreground">
                    {client.sites_count} site{client.sites_count > 1 ? 's' : ''}
                  </span>
                  <Badge 
                    variant={client.conformity_score >= 80 ? "default" : client.conformity_score >= 60 ? "secondary" : "destructive"}
                    className="text-xs"
                  >
                    {client.conformity_score}% conforme
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <Card className="shadow-soft">
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? "Aucun client trouvé" : "Aucun client enregistré"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
