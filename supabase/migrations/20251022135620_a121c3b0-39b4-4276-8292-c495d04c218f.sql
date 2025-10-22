-- Add notes field to preuves table
ALTER TABLE public.preuves ADD COLUMN IF NOT EXISTS notes text;

-- Create index for better performance on conformite queries
CREATE INDEX IF NOT EXISTS idx_conformite_applicabilite_id ON public.conformite(applicabilite_id);
CREATE INDEX IF NOT EXISTS idx_preuves_conformite_id ON public.preuves(conformite_id);
CREATE INDEX IF NOT EXISTS idx_applicabilite_article_id ON public.applicabilite(article_id);
CREATE INDEX IF NOT EXISTS idx_applicabilite_site_id ON public.applicabilite(site_id);