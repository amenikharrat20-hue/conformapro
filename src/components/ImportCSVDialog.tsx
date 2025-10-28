import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { importHelpers } from "@/lib/bibliotheque-queries";

interface ImportCSVDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ImportCSVDialog({ open, onOpenChange, onSuccess }: ImportCSVDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<any>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(fileExt || '')) {
      toast.error("Format non supporté. Utilisez CSV ou XLSX.");
      return;
    }

    setFile(selectedFile);
    setImportResults(null);

    // Parse and preview
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        let workbook;

        if (fileExt === 'csv') {
          workbook = XLSX.read(data, { type: 'string' });
        } else {
          workbook = XLSX.read(data, { type: 'binary' });
        }

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        setPreview(jsonData.slice(0, 20)); // Preview first 20
      } catch (error) {
        toast.error("Erreur lors de la lecture du fichier");
        console.error(error);
      }
    };

    if (fileExt === 'csv') {
      reader.readAsText(selectedFile);
    } else {
      reader.readAsBinaryString(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!file || preview.length === 0) {
      toast.error("Aucune donnée à importer");
      return;
    }

    setIsImporting(true);
    try {
      // Full parse for import
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = event.target?.result;
          const fileExt = file.name.split('.').pop()?.toLowerCase();
          let workbook;

          if (fileExt === 'csv') {
            workbook = XLSX.read(data, { type: 'string' });
          } else {
            workbook = XLSX.read(data, { type: 'binary' });
          }

          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' });

          const results = await importHelpers.importActesFromCSV(jsonData);
          setImportResults(results);

          if (results.errors.length === 0) {
            toast.success(`${results.success} textes importés avec succès`);
            onSuccess?.();
          } else {
            toast.warning(`${results.success} importés, ${results.errors.length} erreurs`);
          }
        } catch (error: any) {
          toast.error("Erreur lors de l'import: " + error.message);
        } finally {
          setIsImporting(false);
        }
      };

      if (file.name.endsWith('.csv')) {
        reader.readAsText(file);
      } else {
        reader.readAsBinaryString(file);
      }
    } catch (error: any) {
      toast.error("Erreur: " + error.message);
      setIsImporting(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview([]);
    setImportResults(null);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { onOpenChange(val); if (!val) reset(); }}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importer des textes réglementaires</DialogTitle>
          <DialogDescription>
            Importez des textes depuis un fichier CSV ou Excel. Format attendu : type_acte, reference_officielle, intitule, autorite_emettrice, date_publication_jort, statut_vigueur, tags (séparés par ;)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File upload */}
          {!file && (
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <input
                id="file-upload"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
              <Label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm font-medium">Cliquez pour sélectionner un fichier</p>
                <p className="text-xs text-muted-foreground mt-2">CSV, XLSX ou XLS</p>
              </Label>
            </div>
          )}

          {/* Preview */}
          {file && !importResults && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <span className="font-medium">{file.name}</span>
                <span className="text-sm text-muted-foreground">
                  ({preview.length} ligne{preview.length > 1 ? 's' : ''} prévisualisée{preview.length > 1 ? 's' : ''})
                </span>
              </div>

              <Alert>
                <AlertDescription>
                  Prévisualisation des 20 premières lignes. Vérifiez que le mapping est correct avant d'importer.
                </AlertDescription>
              </Alert>

              <div className="border rounded-lg overflow-auto max-h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {preview[0] && Object.keys(preview[0]).map((key) => (
                        <TableHead key={key}>{key}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.map((row, idx) => (
                      <TableRow key={idx}>
                        {Object.values(row).map((val: any, cellIdx) => (
                          <TableCell key={cellIdx} className="max-w-xs truncate">
                            {String(val || '—')}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Results */}
          {importResults && (
            <div className="space-y-3">
              <Alert className="border-success bg-success/10">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <AlertDescription>
                  {importResults.success} texte(s) importé(s) avec succès
                </AlertDescription>
              </Alert>

              {importResults.errors.length > 0 && (
                <Alert className="border-destructive bg-destructive/10">
                  <XCircle className="h-4 w-4 text-destructive" />
                  <AlertDescription>
                    <div className="font-medium mb-2">{importResults.errors.length} erreur(s) détectée(s)</div>
                    <div className="space-y-1 text-xs max-h-[200px] overflow-y-auto">
                      {importResults.errors.map((err: any, idx: number) => (
                        <div key={idx}>
                          Ligne {err.line}: {err.error}
                        </div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => { onOpenChange(false); reset(); }}>
            {importResults ? 'Fermer' : 'Annuler'}
          </Button>
          {!importResults && file && (
            <Button onClick={handleImport} disabled={isImporting}>
              {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Importer ({preview.length} lignes)
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
