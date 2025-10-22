-- Create roles table with JSON permissions
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add role_id to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES public.roles(id);

-- Create default roles with permissions
INSERT INTO public.roles (nom, description, permissions) VALUES
(
  'Admin Global',
  'Administrateur avec accès complet à toutes les fonctionnalités',
  '{
    "clients": ["create", "read", "update", "delete"],
    "sites": ["create", "read", "update", "delete"],
    "utilisateurs": ["create", "read", "update", "delete"],
    "roles": ["create", "read", "update", "delete"],
    "veille": ["create", "read", "update", "delete"],
    "conformite": ["create", "read", "update", "delete"],
    "actions": ["create", "read", "update", "delete"],
    "incidents": ["create", "read", "update", "delete"],
    "controles": ["create", "read", "update", "delete"],
    "domaines": ["create", "read", "update", "delete"]
  }'::jsonb
),
(
  'Admin Client',
  'Administrateur d''un client avec accès à ses sites',
  '{
    "sites": ["create", "read", "update"],
    "utilisateurs": ["create", "read", "update"],
    "veille": ["read"],
    "conformite": ["create", "read", "update"],
    "actions": ["create", "read", "update"],
    "incidents": ["create", "read", "update"],
    "controles": ["create", "read", "update"]
  }'::jsonb
),
(
  'Gestionnaire HSE',
  'Gestionnaire HSE avec accès aux fonctionnalités opérationnelles',
  '{
    "sites": ["read"],
    "veille": ["read"],
    "conformite": ["create", "read", "update"],
    "actions": ["create", "read", "update"],
    "incidents": ["create", "read", "update"],
    "controles": ["create", "read", "update"]
  }'::jsonb
),
(
  'Chef de Site',
  'Responsable de site avec accès limité',
  '{
    "conformite": ["read"],
    "actions": ["read", "update"],
    "incidents": ["create", "read"],
    "controles": ["read"]
  }'::jsonb
),
(
  'Consultant',
  'Accès en lecture seule',
  '{
    "sites": ["read"],
    "veille": ["read"],
    "conformite": ["read"],
    "actions": ["read"],
    "incidents": ["read"],
    "controles": ["read"]
  }'::jsonb
)
ON CONFLICT (nom) DO NOTHING;

-- Enable RLS on roles table
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- RLS policies for roles table
CREATE POLICY "Admin global can manage all roles"
ON public.roles
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin_global'::app_role));

CREATE POLICY "All authenticated users can view roles"
ON public.roles
FOR SELECT
TO authenticated
USING (actif = true);

-- Create function to check if user has permission
CREATE OR REPLACE FUNCTION public.has_permission(
  _user_id UUID,
  _module TEXT,
  _action TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_permissions JSONB;
  module_permissions JSONB;
BEGIN
  -- Get user's role permissions
  SELECT r.permissions INTO user_permissions
  FROM public.profiles p
  JOIN public.roles r ON r.id = p.role_id
  WHERE p.id = _user_id AND r.actif = true;
  
  -- If no permissions found, return false
  IF user_permissions IS NULL THEN
    RETURN false;
  END IF;
  
  -- Get permissions for the specific module
  module_permissions := user_permissions->_module;
  
  -- Check if the action is allowed
  IF module_permissions IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if action exists in the array
  RETURN module_permissions ? _action;
END;
$$;

-- Create trigger for updated_at on roles
CREATE TRIGGER update_roles_updated_at
BEFORE UPDATE ON public.roles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role_id ON public.profiles(role_id);
CREATE INDEX IF NOT EXISTS idx_roles_actif ON public.roles(actif);