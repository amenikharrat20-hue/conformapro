import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { intelligentSearchQueries, SearchHistoryEntry } from "@/lib/intelligent-search-queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface SearchHistoryPanelProps {
  onSelectSearch: (query: string, filters: any) => void;
}

export function SearchHistoryPanel({ onSelectSearch }: SearchHistoryPanelProps) {
  const queryClient = useQueryClient();

  const { data: history = [], isLoading } = useQuery({
    queryKey: ['search-history'],
    queryFn: () => intelligentSearchQueries.getSearchHistory(20),
  });

  const clearHistoryMutation = useMutation({
    mutationFn: () => intelligentSearchQueries.clearSearchHistory(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search-history'] });
      toast.success('Historique supprimé');
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    }
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-lg">Historique de recherche</CardTitle>
              <CardDescription className="text-sm">
                Vos {history.length} dernières recherches
              </CardDescription>
            </div>
          </div>
          {history.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => clearHistoryMutation.mutate()}
              disabled={clearHistoryMutation.isPending}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Effacer tout
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Aucun historique de recherche</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => onSelectSearch(entry.query, entry.filters)}
                >
                  <Search className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{entry.query}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>
                        {formatDistanceToNow(new Date(entry.created_at), {
                          addSuffix: true,
                          locale: fr
                        })}
                      </span>
                      {entry.results_count > 0 && (
                        <>
                          <span>•</span>
                          <Badge variant="secondary" className="text-xs">
                            {entry.results_count} résultat{entry.results_count > 1 ? 's' : ''}
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
