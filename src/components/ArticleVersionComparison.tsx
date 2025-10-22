import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import ReactDiffViewer from 'react-diff-viewer-continued';

interface ArticleVersionComparisonProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  versions: any[];
  currentVersion: any;
}

export function ArticleVersionComparison({ 
  open, 
  onOpenChange, 
  versions,
  currentVersion
}: ArticleVersionComparisonProps) {
  const [selectedVersion, setSelectedVersion] = useState<string>("");

  const compareVersion = versions.find(v => v.id === selectedVersion);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Comparaison de versions</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Comparer avec la version:</Label>
            <Select value={selectedVersion} onValueChange={setSelectedVersion}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une version" />
              </SelectTrigger>
              <SelectContent>
                {versions.map((version) => (
                  <SelectItem key={version.id} value={version.id}>
                    {version.version_label} - {version.date_effet ? new Date(version.date_effet).toLocaleDateString("fr-TN") : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {compareVersion && currentVersion && (
            <div className="border rounded-lg overflow-hidden">
              <ReactDiffViewer
                oldValue={compareVersion.contenu}
                newValue={currentVersion.contenu}
                splitView={true}
                leftTitle={`${compareVersion.version_label} (${compareVersion.date_effet ? new Date(compareVersion.date_effet).toLocaleDateString("fr-TN") : ""})`}
                rightTitle={`Version actuelle`}
                styles={{
                  diffContainer: {
                    fontSize: '0.875rem',
                  },
                  contentText: {
                    fontFamily: 'monospace',
                  },
                }}
                useDarkTheme={false}
              />
            </div>
          )}

          {!selectedVersion && (
            <div className="text-center py-12 text-muted-foreground">
              Sélectionnez une version pour comparer
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
