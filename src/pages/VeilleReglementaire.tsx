import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  TrendingUp,
  BookOpen,
  Target,
  ClipboardList,
  Plus,
  ExternalLink
} from "lucide-react";
import { AlertBadge } from "@/components/AlertBadge";

export default function VeilleReglementaire() {
  const [searchTerm, setSearchTerm] = useState("");

  // Données des textes réglementaires
  const textesReglementaires = [
    {
      id: 1,
      titre: "Loi 2025-9 relative à la sous-traitance",
      source: "JORT n°15 - 2025",
      date: "15/02/2025",
      domaine: "RH / Travail",
      applicable: true,
      conformite: "conforme" as const,
      resume: "Interdiction de la sous-traitance de main d'œuvre pour travaux permanents",
    },
    {
      id: 2,
      titre: "Arrêté du 11 juin 2003 - Formation agents de sécurité",
      source: "Ministère de l'Intérieur",
      date: "11/06/2003",
      domaine: "Sécurité",
      applicable: true,
      conformite: "expire-bientot" as const,
      resume: "Obligation de formation initiale et continue pour agents de sécurité privée",
    },
    {
      id: 3,
      titre: "Décret relatif aux installations classées dangereuses",
      source: "JORT n°8 - 2024",
      date: "20/11/2024",
      domaine: "Environnement",
      applicable: true,
      conformite: "expire" as const,
      resume: "Réglementation des activités industrielles présentant des risques environnementaux",
    },
    {
      id: 4,
      titre: "Norme ONPC - Prévention incendie établissements recevant du public",
      source: "ONPC",
      date: "05/03/2023",
      domaine: "Incendie",
      applicable: true,
      conformite: "conforme" as const,
      resume: "Exigences de sécurité incendie pour ERP",
    },
    {
      id: 5,
      titre: "Code du travail - Articles 150 à 170 (SST)",
      source: "Code du travail",
      date: "01/01/2023",
      domaine: "Santé / Sécurité",
      applicable: true,
      conformite: "expire-bientot" as const,
      resume: "Obligations employeur en matière de santé et sécurité au travail",
    },
  ];

  // Données des actions correctives
  const actionsCorrectives = [
    {
      id: 1,
      texte: "Loi 2025-9 sous-traitance",
      manquement: "Contrats de prestation non conformes - risque requalification",
      action: "Réviser tous les contrats de prestation et exclure la fourniture de main d'œuvre",
      responsable: "Direction RH",
      echeance: "30/03/2025",
      statut: "en-cours" as const,
    },
    {
      id: 2,
      texte: "Installations classées",
      manquement: "Rapport annuel environnemental non transmis",
      action: "Préparer et soumettre le rapport annuel à l'ANPE",
      responsable: "Responsable HSE",
      echeance: "15/02/2025",
      statut: "expire" as const,
    },
    {
      id: 3,
      texte: "Formation agents sécurité",
      manquement: "3 agents sans recyclage depuis 2022",
      action: "Organiser session de formation continue conforme arrêté 2003",
      responsable: "RH / Formation",
      echeance: "28/02/2025",
      statut: "en-cours" as const,
    },
  ];

  const conformiteGlobale = 78;

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Veille réglementaire</h1>
          <p className="text-muted-foreground mt-2">
            Suivi, analyse et mise en conformité avec la réglementation HSE tunisienne
          </p>
        </div>
        <Button className="bg-gradient-primary shadow-medium">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un texte
        </Button>
      </div>

      {/* Score de conformité légale */}
      <Card className="shadow-medium border-l-4 border-l-primary bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Conformité légale HSE
          </CardTitle>
          <CardDescription>Tous textes applicables confondus</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-5xl font-bold text-primary">{conformiteGlobale}%</span>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                conformiteGlobale >= 90 ? "bg-success/20 text-success" :
                conformiteGlobale >= 70 ? "bg-warning/20 text-warning" :
                "bg-destructive/20 text-destructive"
              }`}>
                {conformiteGlobale >= 90 ? <CheckCircle2 className="h-8 w-8" /> :
                 conformiteGlobale >= 70 ? <AlertCircle className="h-8 w-8" /> :
                 <AlertCircle className="h-8 w-8" />}
                <span className="font-bold">
                  {conformiteGlobale >= 90 ? "Conforme" :
                   conformiteGlobale >= 70 ? "Attention" :
                   "Non conforme"}
                </span>
              </div>
            </div>
            <Progress value={conformiteGlobale} className="h-3" />
            <p className="text-sm text-muted-foreground">
              +3% par rapport au trimestre dernier
            </p>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="shadow-soft border-l-4 border-l-primary">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
            <div className="text-3xl font-bold text-primary">142</div>
            <p className="text-sm text-muted-foreground mt-1">Textes suivis</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft border-l-4 border-l-success">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <div className="text-3xl font-bold text-success">89</div>
            <p className="text-sm text-muted-foreground mt-1">Textes conformes</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft border-l-4 border-l-warning">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="h-5 w-5 text-warning" />
            </div>
            <div className="text-3xl font-bold text-warning">15</div>
            <p className="text-sm text-muted-foreground mt-1">Actions en cours</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft border-l-4 border-l-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-5 w-5 text-destructive" />
            </div>
            <div className="text-3xl font-bold text-destructive">3</div>
            <p className="text-sm text-muted-foreground mt-1">Actions en retard</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principales */}
      <Tabs defaultValue="veille" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="veille">
            <BookOpen className="h-4 w-4 mr-2" />
            Veille légale
          </TabsTrigger>
          <TabsTrigger value="applicabilite">
            <Target className="h-4 w-4 mr-2" />
            Applicabilité
          </TabsTrigger>
          <TabsTrigger value="actions">
            <ClipboardList className="h-4 w-4 mr-2" />
            Plan d'action
          </TabsTrigger>
        </TabsList>

        {/* Tab Veille légale */}
        <TabsContent value="veille" className="space-y-6">
          {/* Barre de recherche */}
          <Card className="shadow-soft">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un texte, domaine, source..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrer par domaine
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Liste des textes */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Base de textes réglementaires
              </CardTitle>
              <CardDescription>
                Législation HSE, Sécurité, Environnement et RH applicable en Tunisie
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Texte réglementaire</TableHead>
                    <TableHead>Domaine</TableHead>
                    <TableHead>Source & Date</TableHead>
                    <TableHead>Applicabilité</TableHead>
                    <TableHead>État conformité</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {textesReglementaires.map((texte) => (
                    <TableRow key={texte.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <div className="font-medium text-foreground">{texte.titre}</div>
                          <div className="text-sm text-muted-foreground mt-1">{texte.resume}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-medium">
                          {texte.domaine}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="text-sm">{texte.source}</div>
                        <div className="text-xs text-muted-foreground">{texte.date}</div>
                      </TableCell>
                      <TableCell>
                        {texte.applicable ? (
                          <Badge className="bg-primary text-primary-foreground">
                            Applicable
                          </Badge>
                        ) : (
                          <Badge variant="outline">Non applicable</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <AlertBadge status={texte.conformite}>
                          {texte.conformite === "conforme" && "Conforme"}
                          {texte.conformite === "expire-bientot" && "À surveiller"}
                          {texte.conformite === "expire" && "Non conforme"}
                        </AlertBadge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Applicabilité */}
        <TabsContent value="applicabilite" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Conformité par domaine */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Conformité par domaine</CardTitle>
                <CardDescription>État de conformité selon les thématiques HSE</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Sécurité incendie</span>
                    <span className="text-sm text-success font-medium">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Santé & Sécurité au travail</span>
                    <span className="text-sm text-warning font-medium">78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Environnement</span>
                    <span className="text-sm text-warning font-medium">72%</span>
                  </div>
                  <Progress value={72} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Droit du travail / RH</span>
                    <span className="text-sm text-success font-medium">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Équipements & Installations</span>
                    <span className="text-sm text-destructive font-medium">65%</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Applicabilité par site */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Applicabilité par site</CardTitle>
                <CardDescription>Nombre de textes applicables selon les sites</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div>
                    <div className="font-medium text-foreground">Site Tunis - Siège</div>
                    <div className="text-sm text-muted-foreground">Bureau administratif</div>
                  </div>
                  <div className="text-2xl font-bold text-primary">87</div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div>
                    <div className="font-medium text-foreground">Site Sfax - Production</div>
                    <div className="text-sm text-muted-foreground">Industrie manufacturière</div>
                  </div>
                  <div className="text-2xl font-bold text-primary">124</div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div>
                    <div className="font-medium text-foreground">Site Sousse - Entrepôt</div>
                    <div className="text-sm text-muted-foreground">Logistique</div>
                  </div>
                  <div className="text-2xl font-bold text-primary">65</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Plan d'action */}
        <TabsContent value="actions" className="space-y-6">
          <Card className="shadow-medium">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-primary" />
                    Plan d'action de mise en conformité
                  </CardTitle>
                  <CardDescription>
                    Actions correctives pour atteindre la conformité légale complète
                  </CardDescription>
                </div>
                <Button className="bg-gradient-primary">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter le plan
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {actionsCorrectives.map((action) => (
                  <div
                    key={action.id}
                    className="p-6 rounded-lg border border-border hover:bg-muted/50 transition-all shadow-soft"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg text-foreground">{action.texte}</h3>
                          <AlertBadge status={action.statut}>
                            {action.statut === "en-cours" && "En cours"}
                            {action.statut === "expire" && "En retard"}
                          </AlertBadge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex gap-2">
                            <span className="text-muted-foreground font-medium">Manquement :</span>
                            <span className="text-destructive">{action.manquement}</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-muted-foreground font-medium">Action corrective :</span>
                            <span className="text-foreground">{action.action}</span>
                          </div>
                          <div className="flex gap-4 mt-3">
                            <div className="flex gap-2">
                              <span className="text-muted-foreground">👤 Responsable :</span>
                              <span className="font-medium">{action.responsable}</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-muted-foreground">📅 Échéance :</span>
                              <span className="font-medium">{action.echeance}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm">
                        Ajouter preuve
                      </Button>
                      <Button variant="default" size="sm" className="bg-gradient-primary">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Clôturer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
