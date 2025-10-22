import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { runIntegrityChecks } from "@/lib/multi-tenant-queries";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface IntegrityCheckerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface IntegrityResult {
  total_fixed: number;
  orphaned_sites?: { orphaned_sites_fixed: number };
  duplicate_sites?: Array<{ site_id: string; old_name: string; new_name: string }>;
  orphaned_users?: { orphaned_users_fixed: number };
  timestamp?: string;
}

export function IntegrityCheckerModal({ open, onOpenChange }: IntegrityCheckerModalProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<IntegrityResult | null>(null);
  const { toast } = useToast();

  const handleCheckIntegrity = async () => {
    setIsChecking(true);
    try {
      const data = await runIntegrityChecks() as unknown as IntegrityResult;
      setResults(data);
      toast({
        title: "Vérification terminée",
        description: `${data.total_fixed} problème(s) corrigé(s) automatiquement.`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'exécuter la vérification d'intégrité.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Vérification d'intégrité des données</DialogTitle>
          <DialogDescription>
            Analysez et corrigez automatiquement les incohérences dans la base de données.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Cet outil vérifie et corrige automatiquement :
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Sites orphelins (sans client valide)</li>
                <li>Doublons de noms de sites pour un même client</li>
                <li>Utilisateurs sans site affecté</li>
                <li>Relations de clés étrangères cassées</li>
              </ul>
            </AlertDescription>
          </Alert>

          {!results && (
            <Button 
              onClick={handleCheckIntegrity} 
              disabled={isChecking}
              className="w-full"
            >
              {isChecking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isChecking ? "Vérification en cours..." : "Lancer la vérification"}
            </Button>
          )}

          {results && (
            <div className="space-y-4">
              <Alert className="border-green-500 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-900">
                  <strong>Résultat de la vérification</strong>
                  <div className="mt-2 space-y-2">
                    <div className="text-sm">
                      <strong>Total des corrections :</strong> {results.total_fixed}
                    </div>
                    
                    {results.orphaned_sites?.orphaned_sites_fixed > 0 && (
                      <div className="text-sm">
                        <strong>Sites orphelins réassignés :</strong> {results.orphaned_sites.orphaned_sites_fixed}
                      </div>
                    )}
                    
                    {results.duplicate_sites && Array.isArray(results.duplicate_sites) && results.duplicate_sites.length > 0 && (
                      <div className="text-sm">
                        <strong>Sites renommés (doublons) :</strong>
                        <ul className="list-disc list-inside ml-4">
                          {results.duplicate_sites.map((site: any, idx: number) => (
                            <li key={idx}>
                              {site.old_name} → {site.new_name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {results.orphaned_users?.orphaned_users_fixed > 0 && (
                      <div className="text-sm">
                        <strong>Utilisateurs réaffectés :</strong> {results.orphaned_users.orphaned_users_fixed}
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button 
                  onClick={handleCheckIntegrity} 
                  disabled={isChecking}
                  variant="outline"
                  className="flex-1"
                >
                  Relancer la vérification
                </Button>
                <Button 
                  onClick={() => {
                    setResults(null);
                    onOpenChange(false);
                  }}
                  className="flex-1"
                >
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
