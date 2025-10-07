import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  ExternalLink,
  Building2,
  BarChart3,
  Upload,
  FileCheck
} from "lucide-react";
import { AlertBadge } from "@/components/AlertBadge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type TexteReglementaire = Database["public"]["Tables"]["textes_reglementaires"]["Row"];
type Article = Database["public"]["Tables"]["articles"]["Row"];
type Applicabilite = Database["public"]["Tables"]["applicabilite"]["Row"];
type Conformite = Database["public"]["Tables"]["conformite"]["Row"];
type ActionCorrective = Database["public"]["Tables"]["actions_correctives"]["Row"];
type Site = Database["public"]["Tables"]["sites"]["Row"];

interface TexteWithArticles extends TexteReglementaire {
  articles?: Article[];
}

interface ApplicabiliteWithDetails extends Applicabilite {
  textes_reglementaires?: TexteReglementaire;
  articles?: Article;
  sites?: Site;
  conformite?: Conformite[];
}

interface ConformiteWithDetails extends Conformite {
  applicabilite?: ApplicabiliteWithDetails;
  preuves?: any[];
}

interface ActionWithDetails extends ActionCorrective {
  conformite?: ConformiteWithDetails;
}

export default function VeilleReglementaire() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDomaine, setSelectedDomaine] = useState<string>("all");
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [textes, setTextes] = useState<TexteWithArticles[]>([]);
  const [applicabilites, setApplicabilites] = useState<ApplicabiliteWithDetails[]>([]);
  const [actions, setActions] = useState<ActionWithDetails[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [stats, setStats] = useState({
    textesTotal: 0,
    textesConformes: 0,
    actionsEnCours: 0,
    actionsRetard: 0,
    conformiteGlobale: 0,
  });

  // Fetch data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Fetch regulatory texts with articles
      const { data: textesData, error: textesError } = await supabase
        .from("textes_reglementaires")
        .select(`
          *,
          articles (*)
        `)
        .order("date_publication", { ascending: false });

      if (textesError) throw textesError;
      setTextes(textesData || []);

      // Fetch applicability with details
      const { data: applicabiliteData, error: applicabiliteError } = await supabase
        .from("applicabilite")
        .select(`
          *,
          textes_reglementaires (*),
          articles (*),
          sites (*),
          conformite (*)
        `);

      if (applicabiliteError) throw applicabiliteError;
      setApplicabilites(applicabiliteData || []);

      // Fetch actions with details
      const { data: actionsData, error: actionsError } = await supabase
        .from("actions_correctives")
        .select(`
          *,
          conformite (
            *,
            applicabilite (
              *,
              textes_reglementaires (*),
              articles (*),
              sites (*)
            )
          )
        `)
        .order("echeance", { ascending: true });

      if (actionsError) throw actionsError;
      setActions(actionsData || []);

      // Fetch sites
      const { data: sitesData, error: sitesError } = await supabase
        .from("sites")
        .select("*")
        .order("nom_site");

      if (sitesError) throw sitesError;
      setSites(sitesData || []);

      // Calculate statistics
      calculateStats(textesData || [], applicabiliteData || [], actionsData || []);

    } catch (error: any) {
      console.error("Error loading data:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données réglementaires.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (
    textesData: TexteWithArticles[],
    applicabiliteData: ApplicabiliteWithDetails[],
    actionsData: ActionWithDetails[]
  ) => {
    const totalTextes = textesData.length;
    
    // Count texts with good compliance (>= 70%)
    const conformeCount = applicabiliteData.filter(a => {
      const conf = a.conformite?.[0];
      return conf && (conf.etat === "Conforme" || (conf.score && conf.score >= 70));
    }).length;

    // Count actions in progress
    const actionsEnCours = actionsData.filter(a => 
      a.statut === "En_cours" || a.statut === "A_faire"
    ).length;

    // Count overdue actions
    const today = new Date();
    const actionsRetard = actionsData.filter(a => {
      if (!a.echeance) return false;
      const echeanceDate = new Date(a.echeance);
      return echeanceDate < today && (a.statut === "En_cours" || a.statut === "A_faire");
    }).length;

    // Calculate global compliance
    const totalScore = applicabiliteData.reduce((sum, a) => {
      const conf = a.conformite?.[0];
      if (!conf) return sum;
      
      let score = 0;
      if (conf.etat === "Conforme") score = 100;
      else if (conf.etat === "Partiel") score = conf.score || 50;
      else if (conf.etat === "Non_conforme") score = conf.score || 20;
      
      return sum + score;
    }, 0);

    const avgCompliance = applicabiliteData.length > 0 
      ? Math.round(totalScore / applicabiliteData.length) 
      : 0;

    setStats({
      textesTotal: totalTextes,
      textesConformes: conformeCount,
      actionsEnCours,
      actionsRetard,
      conformiteGlobale: avgCompliance,
    });
  };

  const getConformiteColor = (etat: string) => {
    switch (etat) {
      case "Conforme": return "text-success";
      case "Partiel": return "text-warning";
      case "Non_conforme": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const getStatutActionColor = (statut: string) => {
    switch (statut) {
      case "Termine": return "text-success";
      case "En_cours": return "text-primary";
      case "Bloque": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const getPrioriteColor = (priorite: string) => {
    switch (priorite) {
      case "Critique": return "text-destructive";
      case "Haute": return "text-warning";
      case "Moyenne": return "text-primary";
      default: return "text-muted-foreground";
    }
  };

  const filteredTextes = textes.filter(texte => {
    const matchesSearch = searchTerm === "" || 
      texte.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      texte.reference.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDomaine = selectedDomaine === "all" || texte.domaine === selectedDomaine;
    
    return matchesSearch && matchesDomaine;
  });

  const filteredActions = actions.filter(action => {
    const matchesSearch = searchTerm === "" || 
      action.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.manquement.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Chargement des données réglementaires...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Veille réglementaire</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Suivi, analyse et mise en conformité avec la réglementation HSE tunisienne
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="w-full sm:w-auto">
            <Upload className="h-4 w-4 mr-2" />
            Importer
          </Button>
          <Button className="bg-gradient-primary shadow-medium w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </div>
      </div>

      {/* Score de conformité légale */}
      <Card className="shadow-medium border-l-4 border-l-primary bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Score de conformité légale
          </CardTitle>
          <CardDescription>Évaluation globale de la conformité réglementaire HSE</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-5xl font-bold text-primary">{stats.conformiteGlobale}%</span>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                stats.conformiteGlobale >= 90 ? "bg-success/20 text-success" :
                stats.conformiteGlobale >= 70 ? "bg-warning/20 text-warning" :
                "bg-destructive/20 text-destructive"
              }`}>
                {stats.conformiteGlobale >= 90 ? <CheckCircle2 className="h-8 w-8" /> :
                 stats.conformiteGlobale >= 70 ? <AlertCircle className="h-8 w-8" /> :
                 <AlertCircle className="h-8 w-8" />}
                <span className="font-bold">
                  {stats.conformiteGlobale >= 90 ? "Conforme" :
                   stats.conformiteGlobale >= 70 ? "Attention requise" :
                   "Non conforme"}
                </span>
              </div>
            </div>
            <Progress value={stats.conformiteGlobale} className="h-3" />
            <p className="text-sm text-muted-foreground">
              Basé sur {applicabilites.length} exigences applicables
            </p>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-soft border-l-4 border-l-primary">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div className="text-3xl font-bold text-primary">{stats.textesTotal}</div>
            <p className="text-sm text-muted-foreground mt-1">Textes réglementaires</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft border-l-4 border-l-success">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <div className="text-3xl font-bold text-success">{stats.textesConformes}</div>
            <p className="text-sm text-muted-foreground mt-1">Exigences conformes</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft border-l-4 border-l-warning">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <ClipboardList className="h-5 w-5 text-warning" />
            </div>
            <div className="text-3xl font-bold text-warning">{stats.actionsEnCours}</div>
            <p className="text-sm text-muted-foreground mt-1">Actions en cours</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft border-l-4 border-l-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-5 w-5 text-destructive" />
            </div>
            <div className="text-3xl font-bold text-destructive">{stats.actionsRetard}</div>
            <p className="text-sm text-muted-foreground mt-1">Actions en retard</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principales */}
      <Tabs defaultValue="veille" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="veille" className="text-xs sm:text-sm">
            <BookOpen className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Textes légaux</span>
            <span className="sm:hidden">Textes</span>
          </TabsTrigger>
          <TabsTrigger value="applicabilite" className="text-xs sm:text-sm">
            <Target className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Applicabilité</span>
            <span className="sm:hidden">Applic.</span>
          </TabsTrigger>
          <TabsTrigger value="conformite" className="text-xs sm:text-sm">
            <FileCheck className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Conformité</span>
            <span className="sm:hidden">Conf.</span>
          </TabsTrigger>
          <TabsTrigger value="actions" className="text-xs sm:text-sm">
            <ClipboardList className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Actions</span>
            <span className="sm:hidden">Actions</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab Textes légaux */}
        <TabsContent value="veille" className="space-y-6">
          {/* Filtres */}
          <Card className="shadow-soft">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par titre ou référence..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedDomaine} onValueChange={setSelectedDomaine}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Domaine" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les domaines</SelectItem>
                    <SelectItem value="Incendie">Incendie</SelectItem>
                    <SelectItem value="Sécurité du travail">Sécurité du travail</SelectItem>
                    <SelectItem value="Environnement">Environnement</SelectItem>
                    <SelectItem value="RH">RH</SelectItem>
                    <SelectItem value="Hygiène">Hygiène</SelectItem>
                    <SelectItem value="Autres">Autres</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Liste des textes */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <FileText className="h-5 w-5 text-primary" />
                Base de textes réglementaires
              </CardTitle>
              <CardDescription className="text-sm">
                Législation HSE, Sécurité, Environnement et RH applicable en Tunisie
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Version mobile - Cards */}
              <div className="block lg:hidden space-y-4">
                {filteredTextes.map((texte) => (
                  <div
                    key={texte.id}
                    className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-3">
                      <div>
                        <div className="font-semibold text-foreground mb-1">{texte.titre}</div>
                        <div className="text-sm text-muted-foreground">{texte.resume || "Pas de résumé disponible"}</div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          {texte.domaine}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {texte.statut === "en_vigueur" ? "En vigueur" : texte.statut === "abroge" ? "Abrogé" : "Modifié"}
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        <div>{texte.source || "Source inconnue"}</div>
                        <div>{texte.date_publication ? new Date(texte.date_publication).toLocaleDateString("fr-FR") : "Date inconnue"}</div>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-2" />
                          Voir
                        </Button>
                        {texte.lien_pdf && (
                          <Button variant="outline" size="sm" className="flex-1" asChild>
                            <a href={texte.lien_pdf} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              PDF
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Version desktop - Table */}
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Texte réglementaire</TableHead>
                      <TableHead>Domaine</TableHead>
                      <TableHead>Source & Date</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTextes.map((texte) => (
                      <TableRow key={texte.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div>
                            <div className="font-medium text-foreground">{texte.titre}</div>
                            <div className="text-sm text-muted-foreground mt-1">{texte.resume || "Pas de résumé"}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-medium">
                            {texte.domaine}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          <div className="text-sm">{texte.source || "Source inconnue"}</div>
                          <div className="text-xs text-muted-foreground">
                            {texte.date_publication ? new Date(texte.date_publication).toLocaleDateString("fr-FR") : "Date inconnue"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={texte.statut === "en_vigueur" ? "default" : "secondary"}>
                            {texte.statut === "en_vigueur" ? "En vigueur" : texte.statut === "abroge" ? "Abrogé" : "Modifié"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">v{texte.version}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {texte.lien_pdf && (
                              <Button variant="ghost" size="sm" asChild>
                                <a href={texte.lien_pdf} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Applicabilité */}
        <TabsContent value="applicabilite" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
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

        {/* Tab Conformité - Matrice détaillée */}
        <TabsContent value="conformite" className="space-y-6">
          {/* Filtres */}
          <Card className="shadow-soft">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Select value={selectedSite} onValueChange={setSelectedSite}>
                  <SelectTrigger className="w-full sm:w-[250px]">
                    <SelectValue placeholder="Tous les sites" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les sites</SelectItem>
                    {sites.map(site => (
                      <SelectItem key={site.id} value={site.id}>{site.nom_site}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedDomaine} onValueChange={setSelectedDomaine}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Domaine" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les domaines</SelectItem>
                    <SelectItem value="Incendie">Incendie</SelectItem>
                    <SelectItem value="Sécurité du travail">Sécurité du travail</SelectItem>
                    <SelectItem value="Environnement">Environnement</SelectItem>
                    <SelectItem value="RH">RH</SelectItem>
                    <SelectItem value="Hygiène">Hygiène</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="w-full sm:w-auto ml-auto">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter matrice
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Matrice de conformité */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-primary" />
                Matrice de conformité détaillée
              </CardTitle>
              <CardDescription>
                Suivi article par article de la conformité réglementaire
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Texte / Article</TableHead>
                      <TableHead>Site</TableHead>
                      <TableHead>Exigence</TableHead>
                      <TableHead>État</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Dernière MAJ</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applicabilites
                      .filter(a => selectedSite === "all" || a.site_id === selectedSite)
                      .filter(a => selectedDomaine === "all" || a.textes_reglementaires?.domaine === selectedDomaine)
                      .map((appli) => {
                        const conf = appli.conformite?.[0];
                        return (
                          <TableRow key={appli.id} className="hover:bg-muted/50">
                            <TableCell>
                              <div>
                                <div className="font-medium text-sm">
                                  {appli.textes_reglementaires?.titre}
                                </div>
                                {appli.articles && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {appli.articles.numero} - {appli.articles.resume_article}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{appli.sites?.nom_site || "N/A"}</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm max-w-xs">
                                {appli.articles?.exigences?.slice(0, 2).join(", ") || "N/A"}
                              </div>
                            </TableCell>
                            <TableCell>
                              {conf ? (
                                <Badge className={getConformiteColor(conf.etat)}>
                                  {conf.etat === "Conforme" && "✓ Conforme"}
                                  {conf.etat === "Partiel" && "⚠ Partiel"}
                                  {conf.etat === "Non_conforme" && "✗ Non conforme"}
                                  {conf.etat === "Non_evalue" && "— Non évalué"}
                                </Badge>
                              ) : (
                                <Badge variant="outline">Non évalué</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {conf?.score ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">{conf.score}%</span>
                                  <Progress value={conf.score} className="h-2 w-16" />
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {conf?.derniere_mise_a_jour ? (
                                <span className="text-xs text-muted-foreground">
                                  {new Date(conf.derniere_mise_a_jour).toLocaleDateString("fr-FR")}
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Upload className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </div>
              {applicabilites.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune applicabilité définie</p>
                  <p className="text-sm mt-2">Commencez par définir les textes applicables à vos sites</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Plan d'action */}
        <TabsContent value="actions" className="space-y-6">
          <Card className="shadow-medium">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <ClipboardList className="h-5 w-5 text-primary" />
                    Plan d'action de mise en conformité
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Actions correctives pour atteindre la conformité légale complète
                  </CardDescription>
                </div>
                <Button className="bg-gradient-primary w-full sm:w-auto">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredActions.map((action) => (
                  <div
                    key={action.id}
                    className="p-4 sm:p-6 rounded-lg border border-border hover:bg-muted/50 transition-all shadow-soft"
                  >
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                        <h3 className="font-semibold text-base sm:text-lg text-foreground flex-1">
                          {action.conformite?.applicabilite?.textes_reglementaires?.titre || "Texte réglementaire"}
                        </h3>
                        <Badge className={getStatutActionColor(action.statut)}>
                          {action.statut === "En_cours" && "En cours"}
                          {action.statut === "A_faire" && "À faire"}
                          {action.statut === "Termine" && "Terminé"}
                          {action.statut === "Bloque" && "Bloqué"}
                        </Badge>
                        <Badge className={getPrioriteColor(action.priorite || "Moyenne")}>
                          {action.priorite}
                        </Badge>
                      </div>
                      
                      <div className="space-y-3 text-sm">
                        <div className="space-y-1">
                          <span className="text-muted-foreground font-medium block">Manquement identifié :</span>
                          <span className="text-destructive block">{action.manquement}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-muted-foreground font-medium block">Action corrective :</span>
                          <span className="text-foreground block">{action.action}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:gap-4 gap-2 mt-3">
                          {action.echeance && (
                            <div className="flex gap-2">
                              <span className="text-muted-foreground">📅 Échéance :</span>
                              <span className={`font-medium ${
                                new Date(action.echeance) < new Date() && 
                                (action.statut === "En_cours" || action.statut === "A_faire") 
                                  ? "text-destructive" 
                                  : ""
                              }`}>
                                {new Date(action.echeance).toLocaleDateString("fr-FR")}
                              </span>
                            </div>
                          )}
                          {action.cout_estime && (
                            <div className="flex gap-2">
                              <span className="text-muted-foreground">💰 Coût estimé :</span>
                              <span className="font-medium">{action.cout_estime.toFixed(2)} TND</span>
                            </div>
                          )}
                        </div>
                        {action.conformite?.applicabilite?.sites?.nom_site && (
                          <div className="flex gap-2 items-center pt-2 border-t border-border">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              Site: {action.conformite.applicabilite.sites.nom_site}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2 justify-end mt-4 pt-4 border-t border-border">
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        <Upload className="h-4 w-4 mr-2" />
                        Ajouter preuve
                      </Button>
                      {action.statut !== "Termine" && (
                        <Button variant="default" size="sm" className="bg-gradient-primary w-full sm:w-auto">
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Marquer terminé
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {filteredActions.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucune action corrective à afficher</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
