import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { intelligentSearchQueries, SavedSearch } from "@/lib/intelligent-search-queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Star, Search, Trash2, Edit2, Plus } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface SavedSearchesPanelProps {
  onSelectSearch: (query: string, filters: any) => void;
  currentQuery?: string;
  currentFilters?: any;
}

export function SavedSearchesPanel({ onSelectSearch, currentQuery, currentFilters }: SavedSearchesPanelProps) {
  const queryClient = useQueryClient();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [searchName, setSearchName] = useState('');

  const { data: savedSearches = [], isLoading } = useQuery({
    queryKey: ['saved-searches'],
    queryFn: () => intelligentSearchQueries.getSavedSearches(),
  });

  const saveSearchMutation = useMutation({
    mutationFn: (name: string) => intelligentSearchQueries.saveSearch(
      name,
      currentQuery || '',
      currentFilters || {}
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
      toast.success('Recherche sauvegardée');
      setSaveDialogOpen(false);
      setSearchName('');
    },
    onError: () => {
      toast.error('Erreur lors de la sauvegarde');
    }
  });

  const deleteSearchMutation = useMutation({
    mutationFn: (id: string) => intelligentSearchQueries.deleteSavedSearch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
      toast.success('Recherche supprimée');
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    }
  });

  const handleSave = () => {
    if (!searchName.trim()) {
      toast.error('Veuillez entrer un nom');
      return;
    }
    if (!currentQuery || currentQuery.length < 2) {
      toast.error('Aucune recherche active à sauvegarder');
      return;
    }
    saveSearchMutation.mutate(searchName);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg">Recherches sauvegardées</CardTitle>
              <CardDescription className="text-sm">
                {savedSearches.length} recherche{savedSearches.length > 1 ? 's' : ''} favorite{savedSearches.length > 1 ? 's' : ''}
              </CardDescription>
            </div>
          </div>
          <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                disabled={!currentQuery || currentQuery.length < 2}
              >
                <Plus className="h-4 w-4 mr-2" />
                Sauvegarder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Sauvegarder la recherche</DialogTitle>
                <DialogDescription>
                  Donnez un nom à cette recherche pour la retrouver facilement
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nom de la recherche</label>
                  <Input
                    placeholder="Ex: Lois sécurité 2023"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Requête</label>
                  <p className="text-sm bg-muted p-2 rounded">{currentQuery}</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleSave} disabled={saveSearchMutation.isPending}>
                  Sauvegarder
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {savedSearches.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Star className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Aucune recherche sauvegardée</p>
            <p className="text-sm mt-1">Cliquez sur "Sauvegarder" après une recherche</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {savedSearches.map((search) => (
                <div
                  key={search.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors group"
                >
                  <Star className="h-4 w-4 mt-1 text-primary flex-shrink-0 fill-primary" />
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => onSelectSearch(search.query, search.filters)}
                  >
                    <p className="font-medium text-sm">{search.name}</p>
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {search.query}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Modifié {formatDistanceToNow(new Date(search.updated_at), {
                        addSuffix: true,
                        locale: fr
                      })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => deleteSearchMutation.mutate(search.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
