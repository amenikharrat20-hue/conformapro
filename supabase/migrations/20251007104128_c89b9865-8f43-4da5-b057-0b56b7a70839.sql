-- =====================================================
-- Refactor Textes → Actes with typed acts and article-level compliance (FIXED)
-- =====================================================

-- 1. Create enums (only if they don't exist)
DO $$ BEGIN
  CREATE TYPE type_acte AS ENUM (
    'loi', 'loi_org', 'code', 'decret_gouv', 'decret_pres', 'decret_loi',
    'arrete', 'arrete_conjoint', 'circulaire', 'decision', 'rectificatif'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE statut_vigueur AS ENUM ('en_vigueur', 'modifie', 'abroge', 'suspendu');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE type_relation AS ENUM ('modifie', 'abroge', 'complete', 'rend_applicable', 'rectifie', 'renvoi');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE niveau_structure AS ENUM ('livre', 'titre', 'chapitre', 'section');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE etat_conformite AS ENUM ('conforme', 'partiel', 'non_conforme', 'non_evalue');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE type_preuve AS ENUM ('procedure', 'rapport', 'certificat', 'photo', 'autre');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. Create types_acte reference table
CREATE TABLE IF NOT EXISTS public.types_acte (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code type_acte NOT NULL UNIQUE,
  libelle TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.types_acte (code, libelle) VALUES
  ('loi', 'Loi'), ('loi_org', 'Loi organique'), ('code', 'Code'),
  ('decret_gouv', 'Décret gouvernemental'), ('decret_pres', 'Décret présidentiel'),
  ('decret_loi', 'Décret-loi'), ('arrete', 'Arrêté'), ('arrete_conjoint', 'Arrêté conjoint'),
  ('circulaire', 'Circulaire'), ('decision', 'Décision'), ('rectificatif', 'Rectificatif')
ON CONFLICT (code) DO NOTHING;

-- 3. Rename textes_reglementaires → actes_reglementaires
DO $$ BEGIN
  ALTER TABLE public.textes_reglementaires RENAME TO actes_reglementaires;
EXCEPTION WHEN undefined_table THEN null; END $$;

-- Update actes_reglementaires columns
ALTER TABLE public.actes_reglementaires DROP COLUMN IF EXISTS version;
ALTER TABLE public.actes_reglementaires 
  ADD COLUMN IF NOT EXISTS type_acte type_acte NOT NULL DEFAULT 'loi',
  ADD COLUMN IF NOT EXISTS numero_officiel TEXT,
  ADD COLUMN IF NOT EXISTS annee INTEGER,
  ADD COLUMN IF NOT EXISTS date_signature DATE,
  ADD COLUMN IF NOT EXISTS date_publication_jort DATE,
  ADD COLUMN IF NOT EXISTS jort_numero TEXT,
  ADD COLUMN IF NOT EXISTS jort_page_debut TEXT,
  ADD COLUMN IF NOT EXISTS jort_page_fin TEXT,
  ADD COLUMN IF NOT EXISTS autorite_emettrice TEXT,
  ADD COLUMN IF NOT EXISTS intitule TEXT,
  ADD COLUMN IF NOT EXISTS objet_resume TEXT,
  ADD COLUMN IF NOT EXISTS domaines TEXT[],
  ADD COLUMN IF NOT EXISTS statut_vigueur statut_vigueur NOT NULL DEFAULT 'en_vigueur',
  ADD COLUMN IF NOT EXISTS langue_disponible TEXT,
  ADD COLUMN IF NOT EXISTS url_pdf_ar TEXT,
  ADD COLUMN IF NOT EXISTS url_pdf_fr TEXT,
  ADD COLUMN IF NOT EXISTS notes_editoriales TEXT,
  ADD COLUMN IF NOT EXISTS date_entree_vigueur_effective DATE;

-- Migrate existing data
UPDATE public.actes_reglementaires SET intitule = titre WHERE intitule IS NULL AND titre IS NOT NULL;
UPDATE public.actes_reglementaires SET numero_officiel = reference WHERE numero_officiel IS NULL AND reference IS NOT NULL;
UPDATE public.actes_reglementaires SET objet_resume = resume WHERE objet_resume IS NULL AND resume IS NOT NULL;
UPDATE public.actes_reglementaires SET url_pdf_ar = lien_pdf WHERE url_pdf_ar IS NULL AND lien_pdf IS NOT NULL;
UPDATE public.actes_reglementaires SET date_publication_jort = date_publication WHERE date_publication_jort IS NULL AND date_publication IS NOT NULL;

DO $$ BEGIN
  ALTER TABLE public.actes_reglementaires ADD CONSTRAINT actes_reglementaires_intitule_key UNIQUE (intitule);
EXCEPTION WHEN duplicate_table THEN null; END $$;

-- 4. Update articles table structure
DO $$ BEGIN
  ALTER TABLE public.articles RENAME COLUMN texte_id TO acte_id;
EXCEPTION WHEN undefined_column THEN null; END $$;

-- Add new columns to articles if they don't exist
ALTER TABLE public.articles 
  ADD COLUMN IF NOT EXISTS titre_court TEXT,
  ADD COLUMN IF NOT EXISTS contenu_ar TEXT,
  ADD COLUMN IF NOT EXISTS contenu_fr TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- Migrate existing data from resume_article to contenu_fr if empty
UPDATE public.articles 
  SET contenu_fr = resume_article 
  WHERE (contenu_fr IS NULL OR contenu_fr = '') AND resume_article IS NOT NULL;

-- Ensure all articles have some content (back-compat placeholder)
UPDATE public.articles 
  SET contenu_fr = 'Contenu à compléter' 
  WHERE (contenu_fr IS NULL OR contenu_fr = '');

-- 5. Create structures_code table
CREATE TABLE IF NOT EXISTS public.structures_code (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  acte_id UUID NOT NULL REFERENCES public.actes_reglementaires(id) ON DELETE CASCADE,
  niveau niveau_structure NOT NULL,
  numero TEXT NOT NULL,
  titre TEXT NOT NULL,
  parent_id UUID REFERENCES public.structures_code(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_structures_code_acte ON public.structures_code(acte_id);
CREATE INDEX IF NOT EXISTS idx_structures_code_parent ON public.structures_code(parent_id);

-- 6. Create relations_actes table
CREATE TABLE IF NOT EXISTS public.relations_actes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES public.actes_reglementaires(id) ON DELETE CASCADE,
  relation type_relation NOT NULL,
  cible_id UUID NOT NULL REFERENCES public.actes_reglementaires(id) ON DELETE CASCADE,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_relations_actes_source ON public.relations_actes(source_id);
CREATE INDEX IF NOT EXISTS idx_relations_actes_cible ON public.relations_actes(cible_id);

-- 7. Update changelog_reglementaire
DO $$ BEGIN
  ALTER TABLE public.changelog_reglementaire RENAME COLUMN texte_id TO acte_id;
EXCEPTION WHEN undefined_column THEN null; END $$;

-- 8. Enable RLS
ALTER TABLE public.types_acte ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.structures_code ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relations_actes ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies
DROP POLICY IF EXISTS "Authenticated users can view types_acte" ON public.types_acte;
CREATE POLICY "Authenticated users can view types_acte" ON public.types_acte FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admin global can manage types_acte" ON public.types_acte;
CREATE POLICY "Admin global can manage types_acte" ON public.types_acte FOR ALL USING (has_role(auth.uid(), 'admin_global'));

DROP POLICY IF EXISTS "Authenticated users can view structures_code" ON public.structures_code;
CREATE POLICY "Authenticated users can view structures_code" ON public.structures_code FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admin global can manage structures_code" ON public.structures_code;
CREATE POLICY "Admin global can manage structures_code" ON public.structures_code FOR ALL USING (has_role(auth.uid(), 'admin_global'));

DROP POLICY IF EXISTS "Authenticated users can view relations_actes" ON public.relations_actes;
CREATE POLICY "Authenticated users can view relations_actes" ON public.relations_actes FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admin global can manage relations_actes" ON public.relations_actes;
CREATE POLICY "Admin global can manage relations_actes" ON public.relations_actes FOR ALL USING (has_role(auth.uid(), 'admin_global'));

-- 10. Update RLS policies on articles to use acte_id
DROP POLICY IF EXISTS "Admin global can manage articles" ON public.articles;
CREATE POLICY "Admin global can manage articles" ON public.articles FOR ALL USING (has_role(auth.uid(), 'admin_global'));

DROP POLICY IF EXISTS "Authenticated users can view articles" ON public.articles;
CREATE POLICY "Authenticated users can view articles" ON public.articles FOR SELECT USING (auth.uid() IS NOT NULL);

-- 11. Create trigger for structures_code
DROP TRIGGER IF EXISTS update_structures_code_updated_at ON public.structures_code;
CREATE TRIGGER update_structures_code_updated_at
  BEFORE UPDATE ON public.structures_code
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();