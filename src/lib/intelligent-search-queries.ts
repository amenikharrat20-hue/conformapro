import { supabase } from "@/integrations/supabase/client";

export interface SearchFilters {
  searchTerm?: string;
  typeFilter?: string;
  statutFilter?: string;
  domaineFilter?: string;
  anneeMin?: number;
  anneeMax?: number;
  page?: number;
  pageSize?: number;
}

export interface SearchResult {
  type: 'texte' | 'article';
  id: string;
  data: any;
  relevanceScore?: number;
}

export interface SearchSuggestion {
  suggestion: string;
  source_type: 'titre' | 'reference' | 'popular';
  frequency: number;
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: any;
  created_at: string;
  updated_at: string;
}

export interface SearchHistoryEntry {
  id: string;
  query: string;
  filters: any;
  results_count: number;
  created_at: string;
}

export interface RelatedDocument {
  id: string;
  titre: string;
  reference_officielle: string;
  type: string;
  similarity_score: number;
}

export const intelligentSearchQueries = {
  async fullTextSearch(filters: SearchFilters) {
    const {
      searchTerm = '',
      typeFilter,
      statutFilter,
      domaineFilter,
      anneeMin,
      anneeMax,
      pageSize = 50
    } = filters;

    if (searchTerm.length < 2) {
      return { results: [], totalCount: 0 };
    }

    try {
      const { data, error } = await supabase.rpc('intelligent_search', {
        search_query: searchTerm,
        type_filter: typeFilter && typeFilter !== 'all' ? typeFilter : null,
        statut_filter: statutFilter && statutFilter !== 'all' ? statutFilter : null,
        domaine_filter: domaineFilter && domaineFilter !== 'all' ? domaineFilter : null,
        annee_min: anneeMin || null,
        annee_max: anneeMax || null,
        limit_count: pageSize
      });

      if (error) {
        console.error('Full-text search error:', error);
        throw error;
      }

      const results: SearchResult[] = (data || []).map((item: any) => ({
        type: item.result_type as 'texte' | 'article',
        id: item.result_id,
        data: item.result_data,
        relevanceScore: item.relevance_score
      }));

      return {
        results,
        totalCount: results.length
      };
    } catch (error) {
      console.error('Search failed, falling back to basic search:', error);
      return this.fallbackSearch(filters);
    }
  },

  async fallbackSearch(filters: SearchFilters) {
    const {
      searchTerm = '',
      typeFilter,
      statutFilter,
      domaineFilter,
      anneeMin,
      anneeMax,
      pageSize = 50
    } = filters;

    let textesQuery = supabase
      .from("textes_reglementaires")
      .select(`
        *,
        domaines:textes_reglementaires_domaines(
          domaine:domaines_application(id, libelle)
        )
      `)
      .is("deleted_at", null);

    if (searchTerm) {
      textesQuery = textesQuery.or(
        `titre.ilike.%${searchTerm}%,reference_officielle.ilike.%${searchTerm}%,resume.ilike.%${searchTerm}%,autorite.ilike.%${searchTerm}%`
      );
    }

    if (typeFilter && typeFilter !== "all") {
      textesQuery = textesQuery.eq("type", typeFilter);
    }

    if (statutFilter && statutFilter !== "all") {
      textesQuery = textesQuery.eq("statut_vigueur", statutFilter);
    }

    if (anneeMin) {
      textesQuery = textesQuery.gte("annee", anneeMin);
    }

    if (anneeMax) {
      textesQuery = textesQuery.lte("annee", anneeMax);
    }

    let articlesQuery = supabase
      .from("textes_articles")
      .select(`
        *,
        texte:textes_reglementaires!inner(
          id, titre, reference_officielle, type, statut_vigueur, date_publication, annee,
          domaines:textes_reglementaires_domaines(
            domaine:domaines_application(id, libelle)
          )
        )
      `)
      .is("texte.deleted_at", null);

    if (searchTerm) {
      articlesQuery = articlesQuery.or(
        `numero.ilike.%${searchTerm}%,titre_court.ilike.%${searchTerm}%,contenu.ilike.%${searchTerm}%,reference.ilike.%${searchTerm}%`
      );
    }

    const [textesResult, articlesResult] = await Promise.all([
      textesQuery.limit(pageSize),
      articlesQuery.limit(Math.floor(pageSize / 2))
    ]);

    if (textesResult.error) throw textesResult.error;
    if (articlesResult.error) throw articlesResult.error;

    const results: SearchResult[] = [
      ...(textesResult.data || []).map((t: any) => ({
        type: 'texte' as const,
        id: t.id,
        data: t
      })),
      ...(articlesResult.data || []).map((a: any) => ({
        type: 'article' as const,
        id: a.id,
        data: a
      }))
    ];

    return {
      results,
      totalCount: results.length
    };
  },

  async getSuggestions(partialQuery: string, limit: number = 10): Promise<SearchSuggestion[]> {
    if (partialQuery.length < 2) return [];

    try {
      const { data, error } = await supabase.rpc('get_search_suggestions', {
        partial_query: partialQuery,
        limit_count: limit
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get suggestions:', error);

      const { data: textes } = await supabase
        .from('textes_reglementaires')
        .select('titre, reference_officielle')
        .or(`titre.ilike.%${partialQuery}%,reference_officielle.ilike.%${partialQuery}%`)
        .is('deleted_at', null)
        .limit(limit);

      return (textes || []).map((t: any) => ({
        suggestion: t.titre || t.reference_officielle,
        source_type: 'titre' as const,
        frequency: 1
      }));
    }
  },

  async trackSearch(query: string, filters: any, resultsCount: number) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.rpc('track_search', {
        user_id_param: user.id,
        query_param: query,
        filters_param: filters,
        results_count_param: resultsCount
      });
    } catch (error) {
      console.error('Failed to track search:', error);
    }
  },

  async getSearchHistory(limit: number = 20): Promise<SearchHistoryEntry[]> {
    const { data, error } = await supabase
      .from('search_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to get search history:', error);
      return [];
    }

    return data || [];
  },

  async clearSearchHistory() {
    const { error } = await supabase
      .from('search_history')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) throw error;
  },

  async getSavedSearches(): Promise<SavedSearch[]> {
    const { data, error } = await supabase
      .from('saved_searches')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Failed to get saved searches:', error);
      return [];
    }

    return data || [];
  },

  async saveSearch(name: string, query: string, filters: any): Promise<SavedSearch | null> {
    const { data, error } = await supabase
      .from('saved_searches')
      .insert([{ name, query, filters }])
      .select()
      .single();

    if (error) {
      console.error('Failed to save search:', error);
      return null;
    }

    return data;
  },

  async updateSavedSearch(id: string, name: string, query: string, filters: any) {
    const { error } = await supabase
      .from('saved_searches')
      .update({ name, query, filters, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  },

  async deleteSavedSearch(id: string) {
    const { error } = await supabase
      .from('saved_searches')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getPopularSearches(limit: number = 10) {
    const { data, error } = await supabase
      .from('search_analytics')
      .select('query, search_count, last_searched_at')
      .order('search_count', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to get popular searches:', error);
      return [];
    }

    return data || [];
  },

  async getRelatedDocuments(texteId: string, limit: number = 5): Promise<RelatedDocument[]> {
    try {
      const { data, error } = await supabase.rpc('get_related_textes', {
        texte_id_param: texteId,
        limit_count: limit
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get related documents:', error);

      const { data: currentTexte } = await supabase
        .from('textes_reglementaires')
        .select('type, textes_reglementaires_domaines(domaine_id)')
        .eq('id', texteId)
        .single();

      if (!currentTexte) return [];

      const domaineIds = (currentTexte.textes_reglementaires_domaines || []).map((d: any) => d.domaine_id);

      const { data: related } = await supabase
        .from('textes_reglementaires')
        .select('id, titre, reference_officielle, type')
        .eq('type', currentTexte.type)
        .neq('id', texteId)
        .is('deleted_at', null)
        .limit(limit);

      return (related || []).map((t: any) => ({
        ...t,
        similarity_score: 0.5
      }));
    }
  }
};
