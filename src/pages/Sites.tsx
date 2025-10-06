import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, Search, Factory, Users, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Sites() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - will be replaced with real Supabase queries
  const sites = [
    {
      id: "site-1",
      code_site: "SITE-SSE-001",
      nom_site: "Usine Sousse",
      client: "ConformaTech Industries",
      adresse: "Zone Industrielle Kheireddine, Sousse",
      gouvernorat: "Sousse",
      responsable_site: "Mohamed Ben Ali",
      effectif: 150,
      activite: "Fabrication de composants automobiles",
      niveau_risque: "Élevé",
      conformity_score: 92
    },
    {
      id: "site-2",
      code_site: "SITE-SFX-002",
      nom_site: "Entrepôt Sfax",
      client: "ConformaTech Industries",
      adresse: "Zone Logistique Thyna, Sfax",
      gouvernorat: "Sfax",
      responsable_site: "Fatma Kallel",
      effectif: 45,
      activite: "Stockage et distribution",
      niveau_risque: "Moyen",
      conformity_score: 78
    }
  ];

  const filteredSites = sites.filter(site =>
    site.nom_site.toLowerCase().includes(searchQuery.toLowerCase()) ||
    site.code_site.toLowerCase().includes(searchQuery.toLowerCase()) ||
    site.gouvernorat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRisqueBadgeVariant = (risque: string) => {
    switch (risque) {
      case "Critique": return "destructive";
      case "Élevé": return "destructive";
      case "Moyen": return "secondary";
      case "Faible": return "default";
      default: return "default";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Sites</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Gestion des sites et établissements
          </p>
        </div>
        <Button className="bg-gradient-primary shadow-medium w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un site
        </Button>
      </div>

      {/* Search */}
      <Card className="shadow-soft">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, code ou gouvernorat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardDescription>Total sites</CardDescription>
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
            <CardDescription>Sites à risque élevé</CardDescription>
            <CardTitle className="text-3xl text-destructive">1</CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardDescription>Conformité moyenne</CardDescription>
            <CardTitle className="text-3xl text-success">85%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Sites list */}
      <div className="grid gap-6 md:grid-cols-2">
        {filteredSites.map((site) => (
          <Card 
            key={site.id} 
            className="shadow-soft hover:shadow-medium transition-shadow cursor-pointer"
            onClick={() => navigate(`/sites/${site.id}`)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs font-mono">
                      {site.code_site}
                    </Badge>
                    <Badge variant={getRisqueBadgeVariant(site.niveau_risque)} className="text-xs">
                      {site.niveau_risque}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{site.nom_site}</CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {site.client}
                  </CardDescription>
                </div>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Factory className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground line-clamp-1">{site.adresse}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{site.effectif} employés</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Factory className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground line-clamp-1">{site.activite}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-sm font-medium text-muted-foreground">
                    Responsable: {site.responsable_site}
                  </span>
                  <Badge 
                    variant={site.conformity_score >= 80 ? "default" : site.conformity_score >= 60 ? "secondary" : "destructive"}
                    className="text-xs"
                  >
                    {site.conformity_score}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSites.length === 0 && (
        <Card className="shadow-soft">
          <CardContent className="py-12 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? "Aucun site trouvé" : "Aucun site enregistré"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
