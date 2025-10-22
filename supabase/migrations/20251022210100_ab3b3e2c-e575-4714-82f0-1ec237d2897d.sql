-- Create enum for system modules if needed (we'll use text for flexibility)
-- Create modules_systeme table
CREATE TABLE IF NOT EXISTS public.modules_systeme (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  libelle TEXT NOT NULL,
  description TEXT,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed system modules
INSERT INTO public.modules_systeme (code, libelle, description, actif) VALUES
  ('VEILLE', 'Veille réglementaire', 'Suivi des textes réglementaires et domaines applicables', true),
  ('CONTROLES', 'Contrôles techniques', 'Gestion des contrôles et inspections techniques', true),
  ('INCIDENTS', 'Incidents', 'Gestion des incidents et accidents', true),
  ('AUDITS', 'Audits', 'Planification et suivi des audits', true),
  ('FORMATIONS', 'Formations', 'Gestion des formations et habilitations', true),
  ('EPI', 'EPI', 'Gestion des équipements de protection individuelle', true),
  ('PRESTATAIRES', 'Prestataires', 'Gestion des prestataires et sous-traitants', true),
  ('PERMIS', 'Permis de travail', 'Gestion des permis de travail et autorisations', true),
  ('DASHBOARD', 'Tableau de bord', 'Vue d''ensemble et indicateurs', true)
ON CONFLICT (code) DO NOTHING;

-- Create site_modules table
CREATE TABLE IF NOT EXISTS public.site_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.modules_systeme(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT false,
  enabled_by UUID REFERENCES auth.users(id),
  enabled_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(site_id, module_id)
);

-- Create site_veille_domaines table
CREATE TABLE IF NOT EXISTS public.site_veille_domaines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  domaine_id UUID NOT NULL REFERENCES public.domaines_application(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT false,
  UNIQUE(site_id, domaine_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_site_modules_site_enabled ON public.site_modules(site_id, enabled);
CREATE INDEX IF NOT EXISTS idx_site_veille_domaines_site_enabled ON public.site_veille_domaines(site_id, enabled);
CREATE INDEX IF NOT EXISTS idx_site_modules_module ON public.site_modules(module_id);
CREATE INDEX IF NOT EXISTS idx_site_veille_domaines_domaine ON public.site_veille_domaines(domaine_id);

-- Enable RLS
ALTER TABLE public.modules_systeme ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_veille_domaines ENABLE ROW LEVEL SECURITY;

-- RLS Policies for modules_systeme
CREATE POLICY "Authenticated users can view active modules"
  ON public.modules_systeme FOR SELECT
  TO authenticated
  USING (actif = true);

CREATE POLICY "Admin global can manage modules"
  ON public.modules_systeme FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin_global'::app_role));

-- RLS Policies for site_modules
CREATE POLICY "Users can view site modules for their client"
  ON public.site_modules FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.sites s
      WHERE s.id = site_modules.site_id
        AND s.client_id = get_user_client_id(auth.uid())
    )
  );

CREATE POLICY "Admin global can manage all site modules"
  ON public.site_modules FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin_global'::app_role));

CREATE POLICY "Admin client can manage site modules for their client"
  ON public.site_modules FOR ALL
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin_client'::app_role) AND
    EXISTS (
      SELECT 1 FROM public.sites s
      WHERE s.id = site_modules.site_id
        AND s.client_id = get_user_client_id(auth.uid())
    )
  );

-- RLS Policies for site_veille_domaines
CREATE POLICY "Users can view veille domains for their client sites"
  ON public.site_veille_domaines FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.sites s
      WHERE s.id = site_veille_domaines.site_id
        AND s.client_id = get_user_client_id(auth.uid())
    )
  );

CREATE POLICY "Admin global can manage all site veille domains"
  ON public.site_veille_domaines FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin_global'::app_role));

CREATE POLICY "Admin client can manage veille domains for their client sites"
  ON public.site_veille_domaines FOR ALL
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin_client'::app_role) AND
    EXISTS (
      SELECT 1 FROM public.sites s
      WHERE s.id = site_veille_domaines.site_id
        AND s.client_id = get_user_client_id(auth.uid())
    )
  );

-- Trigger for updated_at on modules_systeme
CREATE OR REPLACE FUNCTION public.update_modules_systeme_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_update_modules_systeme_updated_at
  BEFORE UPDATE ON public.modules_systeme
  FOR EACH ROW
  EXECUTE FUNCTION public.update_modules_systeme_updated_at();