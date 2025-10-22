-- Add missing columns to clients table
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS nature text,
ADD COLUMN IF NOT EXISTS couleur_primaire text,
ADD COLUMN IF NOT EXISTS couleur_secondaire text,
ADD COLUMN IF NOT EXISTS abonnement_type text,
ADD COLUMN IF NOT EXISTS statut text DEFAULT 'actif';

-- Rename logo to logo_url for consistency
ALTER TABLE public.clients
RENAME COLUMN logo TO logo_url;

-- Add missing columns to sites table
ALTER TABLE public.sites
ADD COLUMN IF NOT EXISTS classification text,
ADD COLUMN IF NOT EXISTS superficie numeric,
ADD COLUMN IF NOT EXISTS equipements_critiques jsonb DEFAULT '[]'::jsonb;

-- Add actif column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS actif boolean DEFAULT true;

-- Create access_scopes table for fine-grained access control
CREATE TABLE IF NOT EXISTS public.access_scopes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  utilisateur_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  site_id uuid REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
  read_only boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(utilisateur_id, site_id)
);

-- Enable RLS on access_scopes
ALTER TABLE public.access_scopes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for access_scopes
CREATE POLICY "Admin global can manage all access scopes"
ON public.access_scopes
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin_global'::app_role));

CREATE POLICY "Admin client can manage access scopes for their client"
ON public.access_scopes
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.sites s
    WHERE s.id = access_scopes.site_id
    AND s.client_id = get_user_client_id(auth.uid())
  )
  AND has_role(auth.uid(), 'admin_client'::app_role)
);

CREATE POLICY "Users can view their own access scopes"
ON public.access_scopes
FOR SELECT
TO authenticated
USING (utilisateur_id = auth.uid());

-- Add trigger for updated_at on access_scopes
CREATE TRIGGER update_access_scopes_updated_at
BEFORE UPDATE ON public.access_scopes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add comment for documentation
COMMENT ON TABLE public.access_scopes IS 'Contrôle d''accès fin pour les utilisateurs sur des sites spécifiques';
COMMENT ON COLUMN public.access_scopes.read_only IS 'Si vrai, l''utilisateur ne peut que lire les données du site';