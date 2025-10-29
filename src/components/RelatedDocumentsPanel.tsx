import { useQuery } from "@tanstack/react-query";
import { intelligentSearchQueries, RelatedDocument } from "@/lib/intelligent-search-queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Link as LinkIcon, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RelatedDocumentsPanelProps {
  texteId: string;
}

const TYPE_LABELS: Record<string, string> = {
  LOI: "Loi",
  ARRETE: "Arrêté",
  DECRET: "Décret",
  CIRCULAIRE: "Circulaire"
};

export function RelatedDocumentsPanel({ texteId }: RelatedDocumentsPanelProps) {
  const navigate = useNavigate();

  const { data: relatedDocs = [], isLoading } = useQuery({
    queryKey: ['related-documents', texteId],
    queryFn: () => intelligentSearchQueries.getRelatedDocuments(texteId, 5),
    enabled: !!texteId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (relatedDocs.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <LinkIcon className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-lg">Documents connexes</CardTitle>
            <CardDescription className="text-sm">
              Documents similaires ou liés
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-3">
            {relatedDocs.map((doc) => (
              <div
                key={doc.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors group"
                onClick={() => navigate(`/veille/bibliotheque/textes/${doc.id}`)}
              >
                <FileText className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {TYPE_LABELS[doc.type] || doc.type}
                    </Badge>
                    {doc.similarity_score > 0.7 && (
                      <Badge variant="secondary" className="text-xs">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Très pertinent
                      </Badge>
                    )}
                  </div>
                  <p className="font-medium text-sm line-clamp-2">{doc.titre}</p>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {doc.reference_officielle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
