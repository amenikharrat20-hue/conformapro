-- Create domaines application table
CREATE TABLE IF NOT EXISTS public.domaines_application (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  libelle TEXT NOT NULL,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Create sous-domaines application table
CREATE TABLE IF NOT EXISTS public.sous_domaines_application (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domaine_id UUID NOT NULL REFERENCES public.domaines_application(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  libelle TEXT NOT NULL,
  actif BOOLEAN DEFAULT true,
  ordre INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(domaine_id, code)
);

-- Create junction table for textes-domaines (M:N)
CREATE TABLE IF NOT EXISTS public.textes_domaines (
  texte_id UUID NOT NULL REFERENCES public.actes_reglementaires(id) ON DELETE CASCADE,
  domaine_id UUID NOT NULL REFERENCES public.domaines_application(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (texte_id, domaine_id)
);

-- Create junction table for textes-sous-domaines (M:N)
CREATE TABLE IF NOT EXISTS public.textes_sous_domaines (
  texte_id UUID NOT NULL REFERENCES public.actes_reglementaires(id) ON DELETE CASCADE,
  sous_domaine_id UUID NOT NULL REFERENCES public.sous_domaines_application(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (texte_id, sous_domaine_id)
);

-- Add soft delete and new fields to actes_reglementaires
DO $$ BEGIN
  ALTER TABLE public.actes_reglementaires ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
  ALTER TABLE public.actes_reglementaires ADD COLUMN IF NOT EXISTS reference_officielle TEXT;
  ALTER TABLE public.actes_reglementaires ADD COLUMN IF NOT EXISTS lien_pdf TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Update articles table structure
DO $$ BEGIN
  ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS reference_article TEXT;
  ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS ordre INTEGER DEFAULT 0;
  ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Create articles versions table
CREATE TABLE IF NOT EXISTS public.articles_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  version_label TEXT NOT NULL,
  contenu TEXT NOT NULL,
  date_effet DATE,
  statut_vigueur statut_vigueur DEFAULT 'en_vigueur',
  remplace_version_id UUID REFERENCES public.articles_versions(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Create junction table for articles-sous-domaines (M:N)
CREATE TABLE IF NOT EXISTS public.articles_sous_domaines (
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  sous_domaine_id UUID NOT NULL REFERENCES public.sous_domaines_application(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (article_id, sous_domaine_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_actes_type_date ON public.actes_reglementaires(type_acte, date_publication_jort);
CREATE INDEX IF NOT EXISTS idx_articles_reference ON public.articles(reference_article);
CREATE INDEX IF NOT EXISTS idx_domaines_actif ON public.domaines_application(actif) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_sous_domaines_actif ON public.sous_domaines_application(actif) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_articles_versions_article ON public.articles_versions(article_id);

-- Enable RLS on new tables
ALTER TABLE public.domaines_application ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sous_domaines_application ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.textes_domaines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.textes_sous_domaines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles_sous_domaines ENABLE ROW LEVEL SECURITY;

-- RLS policies for domaines_application
CREATE POLICY "Authenticated users can view domaines"
  ON public.domaines_application FOR SELECT
  USING (auth.uid() IS NOT NULL AND deleted_at IS NULL);

CREATE POLICY "Admin global can manage domaines"
  ON public.domaines_application FOR ALL
  USING (has_role(auth.uid(), 'admin_global'));

-- RLS policies for sous_domaines_application
CREATE POLICY "Authenticated users can view sous-domaines"
  ON public.sous_domaines_application FOR SELECT
  USING (auth.uid() IS NOT NULL AND deleted_at IS NULL);

CREATE POLICY "Admin global can manage sous-domaines"
  ON public.sous_domaines_application FOR ALL
  USING (has_role(auth.uid(), 'admin_global'));

-- RLS policies for junction tables
CREATE POLICY "Authenticated users can view textes_domaines"
  ON public.textes_domaines FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin global can manage textes_domaines"
  ON public.textes_domaines FOR ALL
  USING (has_role(auth.uid(), 'admin_global'));

CREATE POLICY "Authenticated users can view textes_sous_domaines"
  ON public.textes_sous_domaines FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin global can manage textes_sous_domaines"
  ON public.textes_sous_domaines FOR ALL
  USING (has_role(auth.uid(), 'admin_global'));

CREATE POLICY "Authenticated users can view articles_versions"
  ON public.articles_versions FOR SELECT
  USING (auth.uid() IS NOT NULL AND deleted_at IS NULL);

CREATE POLICY "Admin global can manage articles_versions"
  ON public.articles_versions FOR ALL
  USING (has_role(auth.uid(), 'admin_global'));

CREATE POLICY "Authenticated users can view articles_sous_domaines"
  ON public.articles_sous_domaines FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin global can manage articles_sous_domaines"
  ON public.articles_sous_domaines FOR ALL
  USING (has_role(auth.uid(), 'admin_global'));

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_domaines_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_domaines_application_updated_at ON public.domaines_application;
  CREATE TRIGGER update_domaines_application_updated_at
    BEFORE UPDATE ON public.domaines_application
    FOR EACH ROW EXECUTE FUNCTION update_domaines_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_sous_domaines_application_updated_at ON public.sous_domaines_application;
  CREATE TRIGGER update_sous_domaines_application_updated_at
    BEFORE UPDATE ON public.sous_domaines_application
    FOR EACH ROW EXECUTE FUNCTION update_domaines_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_articles_versions_updated_at ON public.articles_versions;
  CREATE TRIGGER update_articles_versions_updated_at
    BEFORE UPDATE ON public.articles_versions
    FOR EACH ROW EXECUTE FUNCTION update_domaines_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;