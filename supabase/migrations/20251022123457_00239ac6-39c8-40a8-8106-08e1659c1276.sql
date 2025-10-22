-- Create enum for text types
CREATE TYPE type_texte_reglementaire AS ENUM ('LOI', 'ARRETE', 'DECRET', 'CIRCULAIRE');

-- Create Codes table
CREATE TABLE public.codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titre TEXT NOT NULL,
  description TEXT,
  structure JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create TextesReglementaires table
CREATE TABLE public.textes_reglementaires (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type type_texte_reglementaire NOT NULL,
  code_id UUID REFERENCES public.codes(id) ON DELETE SET NULL,
  reference_officielle TEXT NOT NULL,
  titre TEXT NOT NULL,
  autorite TEXT,
  date_signature DATE,
  date_publication DATE,
  statut_vigueur statut_vigueur NOT NULL DEFAULT 'en_vigueur',
  resume TEXT,
  fichier_pdf_url TEXT,
  annee INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id)
);

-- Link textes to domaines (many-to-many)
CREATE TABLE public.textes_reglementaires_domaines (
  texte_id UUID NOT NULL REFERENCES public.textes_reglementaires(id) ON DELETE CASCADE,
  domaine_id UUID NOT NULL REFERENCES public.domaines_application(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (texte_id, domaine_id)
);

-- Link textes to sous-domaines (many-to-many)
CREATE TABLE public.textes_reglementaires_sous_domaines (
  texte_id UUID NOT NULL REFERENCES public.textes_reglementaires(id) ON DELETE CASCADE,
  sous_domaine_id UUID NOT NULL REFERENCES public.sous_domaines_application(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (texte_id, sous_domaine_id)
);

-- Articles count table
CREATE TABLE public.textes_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  texte_id UUID NOT NULL REFERENCES public.textes_reglementaires(id) ON DELETE CASCADE,
  numero TEXT NOT NULL,
  contenu TEXT,
  ordre INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.textes_reglementaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.textes_reglementaires_domaines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.textes_reglementaires_sous_domaines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.textes_articles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for codes
CREATE POLICY "Admin global can manage codes"
  ON public.codes FOR ALL
  USING (has_role(auth.uid(), 'admin_global'::app_role));

CREATE POLICY "Authenticated users can view codes"
  ON public.codes FOR SELECT
  USING (auth.uid() IS NOT NULL AND deleted_at IS NULL);

-- RLS Policies for textes_reglementaires
CREATE POLICY "Admin global can manage textes"
  ON public.textes_reglementaires FOR ALL
  USING (has_role(auth.uid(), 'admin_global'::app_role));

CREATE POLICY "Authenticated users can view textes"
  ON public.textes_reglementaires FOR SELECT
  USING (auth.uid() IS NOT NULL AND deleted_at IS NULL);

-- RLS Policies for junction tables
CREATE POLICY "Admin global can manage textes_domaines"
  ON public.textes_reglementaires_domaines FOR ALL
  USING (has_role(auth.uid(), 'admin_global'::app_role));

CREATE POLICY "Authenticated users can view textes_domaines"
  ON public.textes_reglementaires_domaines FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin global can manage textes_sous_domaines"
  ON public.textes_reglementaires_sous_domaines FOR ALL
  USING (has_role(auth.uid(), 'admin_global'::app_role));

CREATE POLICY "Authenticated users can view textes_sous_domaines"
  ON public.textes_reglementaires_sous_domaines FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- RLS Policies for articles
CREATE POLICY "Admin global can manage articles"
  ON public.textes_articles FOR ALL
  USING (has_role(auth.uid(), 'admin_global'::app_role));

CREATE POLICY "Authenticated users can view articles"
  ON public.textes_articles FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Create indexes
CREATE INDEX idx_textes_type ON public.textes_reglementaires(type);
CREATE INDEX idx_textes_statut ON public.textes_reglementaires(statut_vigueur);
CREATE INDEX idx_textes_annee ON public.textes_reglementaires(annee);
CREATE INDEX idx_textes_code ON public.textes_reglementaires(code_id);

-- Trigger for updated_at
CREATE TRIGGER update_codes_updated_at
  BEFORE UPDATE ON public.codes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_textes_updated_at
  BEFORE UPDATE ON public.textes_reglementaires
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();