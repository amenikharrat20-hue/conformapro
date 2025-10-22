-- Create gouvernorats reference table
CREATE TABLE IF NOT EXISTS public.gouvernorats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create delegations reference table  
CREATE TABLE IF NOT EXISTS public.delegations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  gouvernorat_id UUID NOT NULL REFERENCES public.gouvernorats(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create localites reference table
CREATE TABLE IF NOT EXISTS public.localites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  code_postal TEXT,
  delegation_id UUID NOT NULL REFERENCES public.delegations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add new columns to sites table if they don't exist
ALTER TABLE public.sites 
ADD COLUMN IF NOT EXISTS secteur_activite TEXT,
ADD COLUMN IF NOT EXISTS est_siege BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ville TEXT,
ADD COLUMN IF NOT EXISTS localite TEXT,
ADD COLUMN IF NOT EXISTS delegation TEXT,
ADD COLUMN IF NOT EXISTS code_postal TEXT,
ADD COLUMN IF NOT EXISTS coordonnees_gps_lat NUMERIC,
ADD COLUMN IF NOT EXISTS coordonnees_gps_lng NUMERIC,
ADD COLUMN IF NOT EXISTS equipements_critiques JSONB DEFAULT '{}'::jsonb;

-- Enable RLS on new tables
ALTER TABLE public.gouvernorats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delegations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.localites ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users to read address data
CREATE POLICY "Authenticated users can view gouvernorats"
ON public.gouvernorats FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can view delegations"
ON public.delegations FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can view localites"
ON public.localites FOR SELECT
TO authenticated
USING (true);

-- Admin global can manage address data
CREATE POLICY "Admin global can manage gouvernorats"
ON public.gouvernorats FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin_global'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin_global'::app_role));

CREATE POLICY "Admin global can manage delegations"
ON public.delegations FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin_global'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin_global'::app_role));

CREATE POLICY "Admin global can manage localites"
ON public.localites FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin_global'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin_global'::app_role));

-- Insert sample gouvernorats for Tunisia
INSERT INTO public.gouvernorats (code, nom) VALUES
('TU', 'Tunis'),
('AR', 'Ariana'),
('BA', 'Ben Arous'),
('MA', 'La Manouba'),
('NA', 'Nabeul'),
('ZA', 'Zaghouan'),
('BI', 'Bizerte'),
('BE', 'Béja'),
('JE', 'Jendouba'),
('KE', 'Le Kef'),
('SI', 'Siliana'),
('SO', 'Sousse'),
('MO', 'Monastir'),
('MA', 'Mahdia'),
('SF', 'Sfax'),
('KA', 'Kairouan'),
('KS', 'Kasserine'),
('SB', 'Sidi Bouzid'),
('GA', 'Gabès'),
('ME', 'Médenine'),
('TA', 'Tataouine'),
('GF', 'Gafsa'),
('TO', 'Tozeur'),
('KB', 'Kébili')
ON CONFLICT (code) DO NOTHING;

-- Create function to ensure only one siege per client
CREATE OR REPLACE FUNCTION public.ensure_single_siege_per_client()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If setting est_siege to true, unset all others for this client
  IF NEW.est_siege = true THEN
    UPDATE public.sites
    SET est_siege = false
    WHERE client_id = NEW.client_id
      AND id != NEW.id
      AND est_siege = true;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for siege uniqueness
DROP TRIGGER IF EXISTS ensure_single_siege_trigger ON public.sites;
CREATE TRIGGER ensure_single_siege_trigger
BEFORE INSERT OR UPDATE OF est_siege ON public.sites
FOR EACH ROW
EXECUTE FUNCTION public.ensure_single_siege_per_client();