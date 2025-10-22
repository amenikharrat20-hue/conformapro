-- Alter textes_articles to add missing columns
ALTER TABLE public.textes_articles
ADD COLUMN IF NOT EXISTS reference text,
ADD COLUMN IF NOT EXISTS titre_court text;

-- Create textes_articles_versions table
CREATE TABLE IF NOT EXISTS public.textes_articles_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES public.textes_articles(id) ON DELETE CASCADE,
  version_label text NOT NULL,
  contenu text NOT NULL,
  date_effet date,
  statut_vigueur statut_vigueur NOT NULL DEFAULT 'en_vigueur',
  remplace_version_id uuid REFERENCES public.textes_articles_versions(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

-- Enable RLS
ALTER TABLE public.textes_articles_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for textes_articles_versions
CREATE POLICY "Admin global can manage article versions"
  ON public.textes_articles_versions
  FOR ALL
  USING (has_role(auth.uid(), 'admin_global'));

CREATE POLICY "Authenticated users can view article versions"
  ON public.textes_articles_versions
  FOR SELECT
  USING (auth.uid() IS NOT NULL AND deleted_at IS NULL);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_textes_articles_versions_article_id 
  ON public.textes_articles_versions(article_id);

-- Trigger for updated_at
CREATE TRIGGER update_textes_articles_versions_updated_at
  BEFORE UPDATE ON public.textes_articles_versions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();