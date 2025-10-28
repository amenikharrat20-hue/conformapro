-- =====================================================
-- MIGRATION: Compléter Bibliothèque Réglementaire (FIXED)
-- Ajoute les champs et tables manquants sans toucher aux données existantes
-- =====================================================

-- 1. Ajouter colonnes manquantes sur actes_reglementaires
ALTER TABLE public.actes_reglementaires
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS applicability jsonb DEFAULT '{"establishment_types": [], "sectors": [], "risk_classes": []}'::jsonb,
  ADD COLUMN IF NOT EXISTS content text,
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS version integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS previous_version_id uuid REFERENCES public.actes_reglementaires(id);

-- 2. Créer table annexes (documents multiples par texte)
CREATE TABLE IF NOT EXISTS public.actes_annexes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  acte_id uuid NOT NULL REFERENCES public.actes_reglementaires(id) ON DELETE CASCADE,
  label text NOT NULL,
  file_url text NOT NULL,
  file_size bigint,
  file_type text,
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Créer table mapping applicabilité (pour suggestions intelligentes)
CREATE TABLE IF NOT EXISTS public.actes_applicabilite_mapping (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  acte_id uuid NOT NULL REFERENCES public.actes_reglementaires(id) ON DELETE CASCADE,
  establishment_type text NOT NULL,
  risk_class text,
  sector text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(acte_id, establishment_type, sector, risk_class)
);

-- 4. Créer indexes pour performance
CREATE INDEX IF NOT EXISTS idx_actes_tags ON public.actes_reglementaires USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_actes_applicability ON public.actes_reglementaires USING GIN(applicability);
CREATE INDEX IF NOT EXISTS idx_actes_version ON public.actes_reglementaires(version);
CREATE INDEX IF NOT EXISTS idx_annexes_acte_id ON public.actes_annexes(acte_id);
CREATE INDEX IF NOT EXISTS idx_mapping_acte_id ON public.actes_applicabilite_mapping(acte_id);
CREATE INDEX IF NOT EXISTS idx_mapping_establishment ON public.actes_applicabilite_mapping(establishment_type);
CREATE INDEX IF NOT EXISTS idx_mapping_sector ON public.actes_applicabilite_mapping(sector);

-- 5. Créer extension pg_trgm pour recherche full-text si pas déjà existante
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 6. Créer index full-text avec tsvector pour recherche performante
ALTER TABLE public.actes_reglementaires
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('french', coalesce(intitule, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(reference_officielle, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(numero_officiel, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(objet_resume, '')), 'B') ||
    setweight(to_tsvector('french', coalesce(content, '')), 'C')
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_actes_search_vector ON public.actes_reglementaires USING GIN(search_vector);

-- 7. Créer trigger pour updated_at sur annexes
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_annexes_updated_at') THEN
    CREATE FUNCTION update_annexes_updated_at()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $func$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $func$;
  END IF;
END $$;

DROP TRIGGER IF EXISTS update_actes_annexes_updated_at ON public.actes_annexes;
CREATE TRIGGER update_actes_annexes_updated_at
  BEFORE UPDATE ON public.actes_annexes
  FOR EACH ROW
  EXECUTE FUNCTION update_annexes_updated_at();

-- 8. RLS pour actes_annexes
ALTER TABLE public.actes_annexes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin global can manage all annexes" ON public.actes_annexes;
CREATE POLICY "Admin global can manage all annexes"
  ON public.actes_annexes
  FOR ALL
  USING (has_role(auth.uid(), 'admin_global'::app_role));

DROP POLICY IF EXISTS "Authenticated users can view annexes" ON public.actes_annexes;
CREATE POLICY "Authenticated users can view annexes"
  ON public.actes_annexes
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 9. RLS pour actes_applicabilite_mapping
ALTER TABLE public.actes_applicabilite_mapping ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin global can manage all mappings" ON public.actes_applicabilite_mapping;
CREATE POLICY "Admin global can manage all mappings"
  ON public.actes_applicabilite_mapping
  FOR ALL
  USING (has_role(auth.uid(), 'admin_global'::app_role));

DROP POLICY IF EXISTS "Authenticated users can view mappings" ON public.actes_applicabilite_mapping;
CREATE POLICY "Authenticated users can view mappings"
  ON public.actes_applicabilite_mapping
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 10. Créer storage bucket pour annexes
INSERT INTO storage.buckets (id, name, public)
VALUES ('actes_annexes', 'actes_annexes', true)
ON CONFLICT (id) DO NOTHING;

-- 11. RLS pour storage annexes
DROP POLICY IF EXISTS "Admin can upload annexes" ON storage.objects;
CREATE POLICY "Admin can upload annexes"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'actes_annexes' AND
    has_role(auth.uid(), 'admin_global'::app_role)
  );

DROP POLICY IF EXISTS "Public can view annexes" ON storage.objects;
CREATE POLICY "Public can view annexes"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'actes_annexes');

DROP POLICY IF EXISTS "Admin can delete annexes" ON storage.objects;
CREATE POLICY "Admin can delete annexes"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'actes_annexes' AND
    has_role(auth.uid(), 'admin_global'::app_role)
  );

-- 12. Fonction helper pour recherche full-text
CREATE OR REPLACE FUNCTION search_actes_reglementaires(
  search_query text,
  limit_count integer DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  intitule text,
  reference_officielle text,
  rank real
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ar.id,
    ar.intitule,
    ar.reference_officielle,
    ts_rank(ar.search_vector, websearch_to_tsquery('french', search_query)) AS rank
  FROM public.actes_reglementaires ar
  WHERE ar.search_vector @@ websearch_to_tsquery('french', search_query)
    AND ar.deleted_at IS NULL
  ORDER BY rank DESC
  LIMIT limit_count;
END;
$$;

-- 13. Fonction helper pour obtenir actes applicables à un site
CREATE OR REPLACE FUNCTION get_applicable_actes_for_site(
  site_id_param uuid
)
RETURNS TABLE (
  acte_id uuid,
  intitule text,
  reference_officielle text,
  statut_vigueur text,
  match_score integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  site_info RECORD;
BEGIN
  SELECT 
    classification AS establishment_type,
    secteur_activite AS sector
  INTO site_info
  FROM public.sites
  WHERE id = site_id_param;

  RETURN QUERY
  SELECT DISTINCT
    ar.id,
    ar.intitule,
    ar.reference_officielle,
    ar.statut_vigueur::text,
    (
      CASE WHEN aam.establishment_type = site_info.establishment_type THEN 2 ELSE 0 END +
      CASE WHEN aam.sector = site_info.sector THEN 2 ELSE 0 END +
      CASE WHEN ar.applicability @> jsonb_build_object('establishment_types', jsonb_build_array(site_info.establishment_type)) THEN 1 ELSE 0 END
    ) AS match_score
  FROM public.actes_reglementaires ar
  LEFT JOIN public.actes_applicabilite_mapping aam ON aam.acte_id = ar.id
  WHERE ar.deleted_at IS NULL
    AND ar.statut_vigueur IN ('en_vigueur', 'modifie')
    AND (
      aam.establishment_type = site_info.establishment_type
      OR aam.sector = site_info.sector
      OR ar.applicability @> jsonb_build_object('establishment_types', jsonb_build_array(site_info.establishment_type))
      OR ar.applicability @> jsonb_build_object('sectors', jsonb_build_array(site_info.sector))
    )
  ORDER BY match_score DESC, ar.date_publication_jort DESC;
END;
$$;