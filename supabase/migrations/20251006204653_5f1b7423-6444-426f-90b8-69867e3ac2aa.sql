-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin_global', 'admin_client', 'gestionnaire_hse', 'chef_site', 'lecteur');

-- Create enum for gouvernorat (Tunisian governorates)
CREATE TYPE public.gouvernorat AS ENUM (
  'Ariana', 'Béja', 'Ben Arous', 'Bizerte', 'Gabès', 'Gafsa', 'Jendouba', 
  'Kairouan', 'Kasserine', 'Kébili', 'Kef', 'Mahdia', 'Manouba', 'Médenine', 
  'Monastir', 'Nabeul', 'Sfax', 'Sidi Bouzid', 'Siliana', 'Sousse', 
  'Tataouine', 'Tozeur', 'Tunis', 'Zaghouan'
);

-- Create enum for secteur
CREATE TYPE public.secteur AS ENUM (
  'Alimentaire', 'Automobile', 'Chimie', 'Textile', 'Construction', 
  'Électronique', 'Pharmaceutique', 'Services', 'Logistique', 'Autre'
);

-- Create enum for niveau de risque
CREATE TYPE public.niveau_risque AS ENUM ('Faible', 'Moyen', 'Élevé', 'Critique');

-- Create clients table
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom_legal TEXT NOT NULL,
  rne_rc TEXT,
  matricule_fiscal TEXT,
  secteur public.secteur,
  logo TEXT,
  adresse_siege TEXT,
  gouvernorat public.gouvernorat,
  contacts JSONB DEFAULT '[]'::jsonb,
  contrat_sla TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create sites table
CREATE TABLE public.sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  code_site TEXT NOT NULL,
  nom_site TEXT NOT NULL,
  adresse TEXT,
  gouvernorat public.gouvernorat,
  coordonnees_gps POINT,
  responsable_site TEXT,
  telephone TEXT,
  email TEXT,
  effectif INTEGER,
  activite TEXT,
  niveau_risque public.niveau_risque DEFAULT 'Moyen',
  autorite_protection_civile TEXT,
  prestataires_affectes JSONB DEFAULT '[]'::jsonb,
  documents JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(client_id, code_site)
);

-- Create profiles table to store user info (not in auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  site_id UUID REFERENCES public.sites(id) ON DELETE SET NULL,
  nom TEXT,
  prenom TEXT,
  email TEXT,
  telephone TEXT,
  fonction TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on all tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to get user's client_id
CREATE OR REPLACE FUNCTION public.get_user_client_id(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT client_id FROM public.profiles WHERE id = _user_id
$$;

-- Create function to get user's site_id
CREATE OR REPLACE FUNCTION public.get_user_site_id(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT site_id FROM public.profiles WHERE id = _user_id
$$;

-- RLS Policies for clients table
CREATE POLICY "Admin global can view all clients"
ON public.clients FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin_global'));

CREATE POLICY "Users can view their own client"
ON public.clients FOR SELECT
TO authenticated
USING (id = public.get_user_client_id(auth.uid()));

CREATE POLICY "Admin global can insert clients"
ON public.clients FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin_global'));

CREATE POLICY "Admin global can update clients"
ON public.clients FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin_global'));

CREATE POLICY "Admin client can update their client"
ON public.clients FOR UPDATE
TO authenticated
USING (
  id = public.get_user_client_id(auth.uid()) 
  AND public.has_role(auth.uid(), 'admin_client')
);

-- RLS Policies for sites table
CREATE POLICY "Admin global can view all sites"
ON public.sites FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin_global'));

CREATE POLICY "Users can view sites in their client"
ON public.sites FOR SELECT
TO authenticated
USING (client_id = public.get_user_client_id(auth.uid()));

CREATE POLICY "Chef de site can only view their site"
ON public.sites FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'chef_site') 
  AND id = public.get_user_site_id(auth.uid())
);

CREATE POLICY "Admin global can insert sites"
ON public.sites FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin_global'));

CREATE POLICY "Admin client can insert sites for their client"
ON public.sites FOR INSERT
TO authenticated
WITH CHECK (
  client_id = public.get_user_client_id(auth.uid())
  AND (
    public.has_role(auth.uid(), 'admin_client')
    OR public.has_role(auth.uid(), 'gestionnaire_hse')
  )
);

CREATE POLICY "Admin global can update sites"
ON public.sites FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin_global'));

CREATE POLICY "Admin client can update sites in their client"
ON public.sites FOR UPDATE
TO authenticated
USING (
  client_id = public.get_user_client_id(auth.uid())
  AND (
    public.has_role(auth.uid(), 'admin_client')
    OR public.has_role(auth.uid(), 'gestionnaire_hse')
  )
);

-- RLS Policies for profiles table
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Admin global can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin_global'));

CREATE POLICY "Admin client can view profiles in their client"
ON public.profiles FOR SELECT
TO authenticated
USING (
  client_id = public.get_user_client_id(auth.uid())
  AND (
    public.has_role(auth.uid(), 'admin_client')
    OR public.has_role(auth.uid(), 'gestionnaire_hse')
  )
);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Admin global can insert profiles"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin_global'));

CREATE POLICY "Admin client can insert profiles for their client"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (
  client_id = public.get_user_client_id(auth.uid())
  AND public.has_role(auth.uid(), 'admin_client')
);

-- RLS Policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admin global can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin_global'));

CREATE POLICY "Admin global can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin_global'))
WITH CHECK (public.has_role(auth.uid(), 'admin_global'));

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nom, prenom)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'nom',
    NEW.raw_user_meta_data->>'prenom'
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add updated_at triggers
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sites_updated_at
  BEFORE UPDATE ON public.sites
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert demo data (1 client with 2 sites and 3 users)
INSERT INTO public.clients (id, nom_legal, rne_rc, matricule_fiscal, secteur, adresse_siege, gouvernorat, notes)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'ConformaTech Industries',
  'B123456782023',
  '1234567/A/M/000',
  'Automobile',
  'Zone Industrielle Kheireddine, Rue de l''Innovation',
  'Sousse',
  'Client démo - Industrie automobile spécialisée en composants électroniques'
);

INSERT INTO public.sites (client_id, code_site, nom_site, adresse, gouvernorat, responsable_site, telephone, email, effectif, activite, niveau_risque, autorite_protection_civile)
VALUES
(
  '00000000-0000-0000-0000-000000000001',
  'SITE-SSE-001',
  'Usine Sousse',
  'Zone Industrielle Kheireddine, Sousse',
  'Sousse',
  'Mohamed Ben Ali',
  '+216 73 123 456',
  'sousse@conformatech.tn',
  150,
  'Fabrication de composants automobiles',
  'Élevé',
  'Protection Civile Sousse Centre'
),
(
  '00000000-0000-0000-0000-000000000001',
  'SITE-SFX-002',
  'Entrepôt Sfax',
  'Zone Logistique Thyna, Sfax',
  'Sfax',
  'Fatma Kallel',
  '+216 74 456 789',
  'sfax@conformatech.tn',
  45,
  'Stockage et distribution',
  'Moyen',
  'Protection Civile Sfax Nord'
);