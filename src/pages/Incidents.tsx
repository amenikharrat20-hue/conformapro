import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Plus, Filter, TrendingDown } from "lucide-react";
import { AlertBadge } from "@/components/AlertBadge";

export default function Incidents() {
  const incidents = [
    {
      id: 1,
      titre: "Chute de plain-pied - Entrepôt",
      type: "Accident du travail",
      gravite: "Moyenne",
      date: "05/01/2025",
      site: "Site Sfax",
      statut: "en-cours" as const,
    },
    {
      id: 2,
      titre: "Fuite d'huile hydraulique",
      type: "Incident environnemental",
      gravite: "Faible",
      date: "03/01/2025",
      site: "Site Tunis",
      statut: "conforme" as const,
    },
    {
      id: 3,
      titre: "Début d'incendie - Machine",
      type: "Presqu'accident",
      gravite: "Élevée",
      date: "28/12/2024",
      site: "Site Sousse",
      statut: "en-cours" as const,
    },
  ];

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Incidents HSE</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">Déclaration et suivi des incidents, accidents et presqu'accidents</p>
        </div>
        <Button className="bg-gradient-primary shadow-medium w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Déclarer
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-soft border-l-4 border-l-destructive">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-destructive">3</div>
            <p className="text-sm text-muted-foreground mt-1">Incidents ce mois</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-l-4 border-l-warning">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-warning">12</div>
            <p className="text-sm text-muted-foreground mt-1">Actions en cours</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-l-4 border-l-success">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-success" />
              <div className="text-3xl font-bold text-success">-15%</div>
            </div>
            <p className="text-sm text-muted-foreground mt-1">vs. mois dernier</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-l-4 border-l-primary">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-primary">0.8</div>
            <p className="text-sm text-muted-foreground mt-1">Taux de fréquence</p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des incidents */}
      <Card className="shadow-medium">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Incidents récents
              </CardTitle>
              <CardDescription>Suivi des déclarations et actions correctives</CardDescription>
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtrer
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {incidents.map((incident) => (
              <div
                key={incident.id}
                className="flex items-center justify-between p-6 rounded-lg border border-border hover:bg-muted/50 transition-all shadow-soft"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 rounded-lg bg-destructive/10">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg text-foreground">{incident.titre}</h3>
                      <AlertBadge status={incident.statut}>
                        {incident.statut === "en-cours" ? "En cours" : "Clôturé"}
                      </AlertBadge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{incident.type}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-muted-foreground">📍 {incident.site}</span>
                      <span className="text-sm text-muted-foreground">📅 {incident.date}</span>
                      <span className={`text-sm font-medium ${
                        incident.gravite === "Élevée" ? "text-destructive" :
                        incident.gravite === "Moyenne" ? "text-warning" :
                        "text-success"
                      }`}>
                        Gravité : {incident.gravite}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Voir détails
                  </Button>
                  <Button variant="default" size="sm" className="bg-gradient-primary">
                    Actions
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
