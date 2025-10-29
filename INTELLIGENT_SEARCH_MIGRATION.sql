/*
  # Enhanced Intelligent Search Infrastructure

  This migration adds intelligent search capabilities to the Bibliothèque Réglementaire.

  ## Features Added:
  1. Full-text search with French language support and ranking
  2. Search history tracking for users
  3. Saved/favorite searches
  4. Search analytics for popular queries
  5. Search suggestions and autocomplete
  6. Related documents recommendations

  ## Prerequisites:
  - Tables `textes_reglementaires` and `textes_articles` must exist
  - Function `update_updated_at_column()` must exist
  - Auth schema with users table must exist

  ## Manual Application:
  This file should be manually reviewed and applied to your Supabase database
  through the Supabase Dashboard SQL Editor or via migrations.
*/

-- ============================================================================
-- STEP 1: Add tsvector columns for full-text search
-- ============================================================================

-- Add search_vector column to textes_reglementaires if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'textes_reglementaires'
    AND column_name = 'search_vector'
  ) THEN
    ALTER TABLE public.textes_reglementaires ADD COLUMN search_vector tsvector;
  END IF;
END $$;

-- Add search_vector column to textes_articles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'textes_articles'
    AND column_name = 'search_vector'
  ) THEN
    ALTER TABLE public.textes_articles ADD COLUMN search_vector tsvector;
  END IF;
END $$;

-- Add missing columns to textes_articles (titre_court, reference)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'textes_articles'
    AND column_name = 'titre_court'
  ) THEN
    ALTER TABLE public.textes_articles ADD COLUMN titre_court text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'textes_articles'
    AND column_name = 'reference'
  ) THEN
    ALTER TABLE public.textes_articles ADD COLUMN reference text;
  END IF;
END $$;

-- ============================================================================
-- STEP 2: Create GIN indexes for fast full-text search
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_textes_search_vector
  ON public.textes_reglementaires USING GIN(search_vector);

CREATE INDEX IF NOT EXISTS idx_articles_search_vector
  ON public.textes_articles USING GIN(search_vector);

-- ============================================================================
-- STEP 3: Create functions to automatically update search vectors
-- ============================================================================

-- Function for textes_reglementaires search vector
CREATE OR REPLACE FUNCTION update_textes_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('french', coalesce(NEW.titre, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(NEW.reference_officielle, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(NEW.resume, '')), 'B') ||
    setweight(to_tsvector('french', coalesce(NEW.autorite, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function for textes_articles search vector
CREATE OR REPLACE FUNCTION update_articles_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('french', coalesce(NEW.numero, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(NEW.titre_court, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(NEW.contenu, '')), 'B') ||
    setweight(to_tsvector('french', coalesce(NEW.reference, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 4: Create triggers for automatic search vector updates
-- ============================================================================

DROP TRIGGER IF EXISTS textes_search_vector_update ON public.textes_reglementaires;
CREATE TRIGGER textes_search_vector_update
  BEFORE INSERT OR UPDATE ON public.textes_reglementaires
  FOR EACH ROW
  EXECUTE FUNCTION update_textes_search_vector();

DROP TRIGGER IF EXISTS articles_search_vector_update ON public.textes_articles;
CREATE TRIGGER articles_search_vector_update
  BEFORE INSERT OR UPDATE ON public.textes_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_articles_search_vector();

-- ============================================================================
-- STEP 5: Create new tables for intelligent search features
-- ============================================================================

-- Search history table
CREATE TABLE IF NOT EXISTS public.search_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  query text NOT NULL,
  filters jsonb DEFAULT '{}'::jsonb,
  results_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Saved searches table
CREATE TABLE IF NOT EXISTS public.saved_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  query text NOT NULL,
  filters jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Search analytics table
CREATE TABLE IF NOT EXISTS public.search_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query text NOT NULL,
  search_count integer DEFAULT 1,
  last_searched_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(query)
);

-- ============================================================================
-- STEP 6: Enable RLS on new tables
-- ============================================================================

ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_analytics ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 7: Create RLS policies
-- ============================================================================

-- Search history policies
CREATE POLICY "Users can view own search history"
  ON public.search_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own search history"
  ON public.search_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own search history"
  ON public.search_history FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Saved searches policies
CREATE POLICY "Users can manage own saved searches"
  ON public.saved_searches FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Search analytics policies
CREATE POLICY "Authenticated users can view analytics"
  ON public.search_analytics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert analytics"
  ON public.search_analytics FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can update analytics counts"
  ON public.search_analytics FOR UPDATE
  TO authenticated
  USING (true);

-- ============================================================================
-- STEP 8: Create indexes for new tables
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_search_history_user
  ON public.search_history(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_saved_searches_user
  ON public.saved_searches(user_id);

CREATE INDEX IF NOT EXISTS idx_search_analytics_count
  ON public.search_analytics(search_count DESC);

CREATE INDEX IF NOT EXISTS idx_search_analytics_query
  ON public.search_analytics(query);

-- ============================================================================
-- STEP 9: Create trigger for saved_searches updated_at
-- ============================================================================

DROP TRIGGER IF EXISTS update_saved_searches_updated_at ON public.saved_searches;
CREATE TRIGGER update_saved_searches_updated_at
  BEFORE UPDATE ON public.saved_searches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- STEP 10: Create advanced search function with ranking
-- ============================================================================

CREATE OR REPLACE FUNCTION intelligent_search(
  search_query text,
  type_filter text DEFAULT NULL,
  statut_filter text DEFAULT NULL,
  domaine_filter uuid DEFAULT NULL,
  annee_min integer DEFAULT NULL,
  annee_max integer DEFAULT NULL,
  limit_count integer DEFAULT 50
)
RETURNS TABLE (
  result_type text,
  result_id uuid,
  result_data jsonb,
  relevance_score real
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ts_query tsquery;
BEGIN
  -- Parse query with French dictionary for better stemming
  ts_query := websearch_to_tsquery('french', search_query);

  RETURN QUERY
  WITH texte_results AS (
    SELECT
      'texte'::text as result_type,
      t.id as result_id,
      jsonb_build_object(
        'id', t.id,
        'type', t.type,
        'titre', t.titre,
        'reference_officielle', t.reference_officielle,
        'autorite', t.autorite,
        'date_publication', t.date_publication,
        'statut_vigueur', t.statut_vigueur,
        'resume', t.resume,
        'annee', t.annee
      ) as result_data,
      ts_rank(t.search_vector, ts_query) as relevance_score
    FROM public.textes_reglementaires t
    WHERE t.deleted_at IS NULL
      AND t.search_vector @@ ts_query
      AND (type_filter IS NULL OR t.type::text = type_filter)
      AND (statut_filter IS NULL OR t.statut_vigueur::text = statut_filter)
      AND (annee_min IS NULL OR t.annee >= annee_min)
      AND (annee_max IS NULL OR t.annee <= annee_max)
      AND (domaine_filter IS NULL OR EXISTS (
        SELECT 1 FROM textes_reglementaires_domaines trd
        WHERE trd.texte_id = t.id AND trd.domaine_id = domaine_filter
      ))
  ),
  article_results AS (
    SELECT
      'article'::text as result_type,
      a.id as result_id,
      jsonb_build_object(
        'id', a.id,
        'numero', a.numero,
        'titre_court', a.titre_court,
        'contenu', a.contenu,
        'reference', a.reference,
        'texte_id', a.texte_id
      ) as result_data,
      ts_rank(a.search_vector, ts_query) * 0.8 as relevance_score
    FROM public.textes_articles a
    INNER JOIN public.textes_reglementaires t ON t.id = a.texte_id
    WHERE t.deleted_at IS NULL
      AND a.search_vector @@ ts_query
      AND (type_filter IS NULL OR t.type::text = type_filter)
      AND (statut_filter IS NULL OR t.statut_vigueur::text = statut_filter)
      AND (annee_min IS NULL OR t.annee >= annee_min)
      AND (annee_max IS NULL OR t.annee <= annee_max)
      AND (domaine_filter IS NULL OR EXISTS (
        SELECT 1 FROM textes_reglementaires_domaines trd
        WHERE trd.texte_id = t.id AND trd.domaine_id = domaine_filter
      ))
  )
  SELECT * FROM (
    SELECT * FROM texte_results
    UNION ALL
    SELECT * FROM article_results
  ) combined
  ORDER BY relevance_score DESC
  LIMIT limit_count;
END;
$$;

-- ============================================================================
-- STEP 11: Create search suggestions function
-- ============================================================================

CREATE OR REPLACE FUNCTION get_search_suggestions(
  partial_query text,
  limit_count integer DEFAULT 10
)
RETURNS TABLE (
  suggestion text,
  source_type text,
  frequency integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH title_suggestions AS (
    SELECT
      titre as suggestion,
      'titre'::text as source_type,
      1 as frequency
    FROM public.textes_reglementaires
    WHERE deleted_at IS NULL
      AND titre ILIKE '%' || partial_query || '%'
    LIMIT 5
  ),
  reference_suggestions AS (
    SELECT
      reference_officielle as suggestion,
      'reference'::text as source_type,
      1 as frequency
    FROM public.textes_reglementaires
    WHERE deleted_at IS NULL
      AND reference_officielle ILIKE '%' || partial_query || '%'
    LIMIT 5
  ),
  popular_searches AS (
    SELECT
      query as suggestion,
      'popular'::text as source_type,
      search_count as frequency
    FROM public.search_analytics
    WHERE query ILIKE '%' || partial_query || '%'
    ORDER BY search_count DESC
    LIMIT 5
  )
  SELECT * FROM (
    SELECT * FROM title_suggestions
    UNION ALL
    SELECT * FROM reference_suggestions
    UNION ALL
    SELECT * FROM popular_searches
  ) combined
  ORDER BY frequency DESC, suggestion
  LIMIT limit_count;
END;
$$;

-- ============================================================================
-- STEP 12: Create function to track searches and update analytics
-- ============================================================================

CREATE OR REPLACE FUNCTION track_search(
  user_id_param uuid,
  query_param text,
  filters_param jsonb,
  results_count_param integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into search history
  INSERT INTO public.search_history (user_id, query, filters, results_count)
  VALUES (user_id_param, query_param, filters_param, results_count_param);

  -- Update search analytics
  INSERT INTO public.search_analytics (query, search_count, last_searched_at)
  VALUES (query_param, 1, now())
  ON CONFLICT (query)
  DO UPDATE SET
    search_count = search_analytics.search_count + 1,
    last_searched_at = now();
END;
$$;

-- ============================================================================
-- STEP 13: Create function to get related documents
-- ============================================================================

CREATE OR REPLACE FUNCTION get_related_textes(
  texte_id_param uuid,
  limit_count integer DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  titre text,
  reference_officielle text,
  type text,
  similarity_score real
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  source_vector tsvector;
  source_domaines uuid[];
BEGIN
  -- Get search vector and domains of source document
  SELECT t.search_vector, ARRAY_AGG(trd.domaine_id)
  INTO source_vector, source_domaines
  FROM public.textes_reglementaires t
  LEFT JOIN textes_reglementaires_domaines trd ON trd.texte_id = t.id
  WHERE t.id = texte_id_param
  GROUP BY t.search_vector;

  -- Return related documents based on domain overlap
  RETURN QUERY
  SELECT
    t.id,
    t.titre,
    t.reference_officielle,
    t.type::text,
    (
      CASE
        WHEN EXISTS (
          SELECT 1 FROM textes_reglementaires_domaines trd2
          WHERE trd2.texte_id = t.id
          AND trd2.domaine_id = ANY(source_domaines)
        ) THEN 0.9
        ELSE 0.3
      END
    ) as similarity_score
  FROM public.textes_reglementaires t
  WHERE t.id != texte_id_param
    AND t.deleted_at IS NULL
  ORDER BY similarity_score DESC, t.created_at DESC
  LIMIT limit_count;
END;
$$;

-- ============================================================================
-- STEP 14: Initialize search vectors for existing data
-- ============================================================================

-- Update existing textes_reglementaires records to generate search vectors
UPDATE public.textes_reglementaires
SET updated_at = updated_at
WHERE search_vector IS NULL;

-- Update existing textes_articles records to generate search vectors
UPDATE public.textes_articles
SET updated_at = updated_at
WHERE search_vector IS NULL;

-- ============================================================================
-- Migration Complete!
-- ============================================================================

/*
  ## Post-Migration Checklist:

  1. ✅ Full-text search enabled on textes_reglementaires and textes_articles
  2. ✅ Search history tracking implemented
  3. ✅ Saved searches functionality added
  4. ✅ Search analytics for popular queries
  5. ✅ Autocomplete and search suggestions
  6. ✅ Related documents recommendations
  7. ✅ RLS policies properly configured
  8. ✅ Indexes created for performance

  ## Next Steps:

  - The frontend components are already implemented in:
    * src/lib/intelligent-search-queries.ts
    * src/components/SearchHistoryPanel.tsx
    * src/components/SavedSearchesPanel.tsx
    * src/components/SearchSuggestionsDropdown.tsx
    * src/components/RelatedDocumentsPanel.tsx
    * src/pages/BibliothequeRechercheIntelligente.tsx (enhanced)

  - Test the intelligent search by visiting /veille/bibliotheque/recherche

  - Monitor search_analytics table to see popular queries
*/
