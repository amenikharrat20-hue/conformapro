import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { intelligentSearchQueries, SearchSuggestion } from "@/lib/intelligent-search-queries";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { TrendingUp, FileText, Hash } from "lucide-react";

interface SearchSuggestionsDropdownProps {
  query: string;
  onSelectSuggestion: (suggestion: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function SearchSuggestionsDropdown({
  query,
  onSelectSuggestion,
  isOpen,
  onClose
}: SearchSuggestionsDropdownProps) {
  const { data: suggestions = [] } = useQuery({
    queryKey: ['search-suggestions', query],
    queryFn: () => intelligentSearchQueries.getSuggestions(query, 10),
    enabled: query.length >= 2 && isOpen,
  });

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'popular':
        return <TrendingUp className="h-4 w-4 text-primary" />;
      case 'titre':
        return <FileText className="h-4 w-4 text-muted-foreground" />;
      case 'reference':
        return <Hash className="h-4 w-4 text-muted-foreground" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getSuggestionLabel = (type: string) => {
    switch (type) {
      case 'popular':
        return 'Recherche populaire';
      case 'titre':
        return 'Titre';
      case 'reference':
        return 'Référence';
      default:
        return '';
    }
  };

  if (!isOpen || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="absolute z-50 top-full mt-1 w-full bg-background border rounded-md shadow-lg">
      <Command>
        <CommandList>
          <CommandEmpty>Aucune suggestion</CommandEmpty>
          <CommandGroup heading="Suggestions">
            {suggestions.map((suggestion, index) => (
              <CommandItem
                key={`${suggestion.suggestion}-${index}`}
                value={suggestion.suggestion}
                onSelect={() => {
                  onSelectSuggestion(suggestion.suggestion);
                  onClose();
                }}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-3 w-full">
                  {getSuggestionIcon(suggestion.source_type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{suggestion.suggestion}</p>
                    {suggestion.source_type === 'popular' && suggestion.frequency > 1 && (
                      <p className="text-xs text-muted-foreground">
                        {suggestion.frequency} recherches
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {getSuggestionLabel(suggestion.source_type)}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}
