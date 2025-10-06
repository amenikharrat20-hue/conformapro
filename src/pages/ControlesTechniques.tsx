import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ClipboardCheck, Plus, Bell, CheckCircle2 } from "lucide-react";

export default function ControlesTechniques() {
  const controles = [
    {
      id: 1,
      equipement: "Extincteurs",
      type: "Vérification annuelle",
      site: "Bâtiment A - Tunis",
      prochainControle: "15/01/2025",
      joursRestants: 5,
      statut: "urgent" as const,
    },
    {
      id: 2,
      equipement: "RIA (Robinets Incendie Armés)",
      type: "Vérification semestrielle",
      site: "Bâtiment B - Tunis",
      prochainControle: "28/01/2025",
      joursRestants: 18,
      statut: "attention" as const,
    },
    {
      id: 3,
      equipement: "Installation électrique",
      type: "Contrôle réglementaire",
      site: "Site Sfax",
      prochainControle: "10/02/2025",
      joursRestants: 31,
      statut: "planifie" as const,
    },
    {
      id: 4,
      equipement: "Appareils de levage",
      type: "Vérification annuelle",
      site: "Entrepôt - Sousse",
      prochainControle: "05/03/2025",
      joursRestants: 54,
      statut: "planifie" as const,
    },
    {
      id: 5,
      equipement: "Système de Sécurité Incendie (SSI)",
      type: "Vérification trimestrielle",
      site: "Bâtiment A - Tunis",
      prochainControle: "22/01/2025",
      joursRestants: 12,
      statut: "attention" as const,
    },
  ];

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case "urgent":
        return "bg-destructive text-destructive-foreground";
      case "attention":
        return "bg-warning text-warning-foreground";
      case "planifie":
        return "bg-success text-success-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (statut: string) => {
    switch (statut) {
      case "urgent":
        return "Urgent";
      case "attention":
        return "Attention";
      case "planifie":
        return "Planifié";
      default:
        return "En attente";
    }
  };

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Contrôles techniques</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">Calendrier des vérifications et maintenances réglementaires</p>
        </div>
        <Button className="bg-gradient-primary shadow-medium w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Planifier
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-soft border-l-4 border-l-destructive">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-destructive">3</div>
            <p className="text-sm text-muted-foreground mt-1">Contrôles urgents</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-l-4 border-l-warning">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-warning">8</div>
            <p className="text-sm text-muted-foreground mt-1">À planifier ce mois</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-l-4 border-l-success">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-success">42</div>
            <p className="text-sm text-muted-foreground mt-1">Contrôles conformes</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-l-4 border-l-primary">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-primary">95%</div>
            <p className="text-sm text-muted-foreground mt-1">Taux de réalisation</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendrier des contrôles */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Prochains contrôles
          </CardTitle>
          <CardDescription>Échéancier des vérifications techniques obligatoires</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {controles.map((controle) => (
              <div
                key={controle.id}
                className="flex items-center justify-between p-6 rounded-lg border border-border hover:bg-muted/50 transition-all shadow-soft"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <ClipboardCheck className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg text-foreground">{controle.equipement}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(controle.statut)}`}>
                        {getStatusLabel(controle.statut)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{controle.type}</p>
                    <p className="text-sm text-muted-foreground">📍 {controle.site}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-sm font-medium text-foreground">
                        Prochain contrôle : {controle.prochainControle}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({controle.joursRestants} jours restants)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Bell className="h-4 w-4 mr-2" />
                    Alerter
                  </Button>
                  <Button variant="default" size="sm" className="bg-gradient-primary">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Valider
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
