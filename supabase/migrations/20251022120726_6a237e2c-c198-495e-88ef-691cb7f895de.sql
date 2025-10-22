-- Ensure proper foreign key constraints with CASCADE DELETE
-- Drop existing constraints if they exist and recreate with CASCADE

-- Sites FK to clients with CASCADE DELETE
ALTER TABLE public.sites DROP CONSTRAINT IF EXISTS sites_client_id_fkey;
ALTER TABLE public.sites 
  ADD CONSTRAINT sites_client_id_fkey 
  FOREIGN KEY (client_id) 
  REFERENCES public.clients(id) 
  ON DELETE CASCADE;

-- Profiles FK to clients with CASCADE DELETE
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_client_id_fkey;
ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_client_id_fkey 
  FOREIGN KEY (client_id) 
  REFERENCES public.clients(id) 
  ON DELETE CASCADE;

-- Profiles FK to sites with SET NULL (keep user but remove site link)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_site_id_fkey;
ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_site_id_fkey 
  FOREIGN KEY (site_id) 
  REFERENCES public.sites(id) 
  ON DELETE SET NULL;

-- Create default "Client Inconnu" if not exists
INSERT INTO public.clients (id, nom_legal, statut, nature)
VALUES ('00000000-0000-0000-0000-000000000001', 'Client Inconnu', 'inactif', 'Autre')
ON CONFLICT (id) DO NOTHING;

-- Function to check and fix orphaned sites
CREATE OR REPLACE FUNCTION public.fix_orphaned_sites()
RETURNS TABLE(fixed_count integer, details jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_fixed_count integer := 0;
  v_details jsonb := '[]'::jsonb;
BEGIN
  -- Fix sites with NULL or invalid client_id
  UPDATE public.sites
  SET client_id = '00000000-0000-0000-0000-000000000001'
  WHERE client_id IS NULL 
     OR NOT EXISTS (SELECT 1 FROM public.clients WHERE id = sites.client_id);
  
  GET DIAGNOSTICS v_fixed_count = ROW_COUNT;
  
  v_details := jsonb_build_object(
    'orphaned_sites_fixed', v_fixed_count
  );
  
  RETURN QUERY SELECT v_fixed_count, v_details;
END;
$$;

-- Function to check and fix duplicate site names
CREATE OR REPLACE FUNCTION public.fix_duplicate_site_names()
RETURNS TABLE(fixed_count integer, details jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_fixed_count integer := 0;
  v_site record;
  v_counter integer;
  v_new_name text;
  v_details jsonb := '[]'::jsonb;
BEGIN
  -- Find duplicates within same client
  FOR v_site IN 
    SELECT s1.id, s1.nom_site, s1.client_id, 
           ROW_NUMBER() OVER (PARTITION BY s1.client_id, s1.nom_site ORDER BY s1.created_at) as rn
    FROM public.sites s1
    WHERE EXISTS (
      SELECT 1 FROM public.sites s2 
      WHERE s2.client_id = s1.client_id 
        AND s2.nom_site = s1.nom_site 
        AND s2.id != s1.id
    )
  LOOP
    IF v_site.rn > 1 THEN
      v_new_name := v_site.nom_site || '-' || v_site.rn::text;
      UPDATE public.sites 
      SET nom_site = v_new_name
      WHERE id = v_site.id;
      
      v_fixed_count := v_fixed_count + 1;
      v_details := v_details || jsonb_build_object(
        'site_id', v_site.id,
        'old_name', v_site.nom_site,
        'new_name', v_new_name
      );
    END IF;
  END LOOP;
  
  RETURN QUERY SELECT v_fixed_count, v_details;
END;
$$;

-- Function to check and fix orphaned users
CREATE OR REPLACE FUNCTION public.fix_orphaned_users()
RETURNS TABLE(fixed_count integer, details jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_fixed_count integer := 0;
  v_details jsonb := '[]'::jsonb;
  v_default_site_id uuid;
BEGIN
  -- For each client, ensure they have at least one "Siège principal" site
  INSERT INTO public.sites (client_id, nom_site, code_site, adresse, classification)
  SELECT DISTINCT p.client_id, 'Siège principal', 'SIEGE', 'Non renseigné', 'Siège'
  FROM public.profiles p
  WHERE p.client_id IS NOT NULL
    AND p.site_id IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.sites s 
      WHERE s.client_id = p.client_id 
        AND s.nom_site = 'Siège principal'
    )
  ON CONFLICT DO NOTHING;
  
  -- Assign orphaned users to their client's "Siège principal"
  UPDATE public.profiles p
  SET site_id = (
    SELECT s.id FROM public.sites s
    WHERE s.client_id = p.client_id
      AND s.nom_site = 'Siège principal'
    LIMIT 1
  )
  WHERE p.client_id IS NOT NULL
    AND p.site_id IS NULL;
  
  GET DIAGNOSTICS v_fixed_count = ROW_COUNT;
  
  v_details := jsonb_build_object(
    'orphaned_users_fixed', v_fixed_count
  );
  
  RETURN QUERY SELECT v_fixed_count, v_details;
END;
$$;

-- Master function to run all integrity checks
CREATE OR REPLACE FUNCTION public.run_integrity_checks()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sites_result record;
  v_duplicates_result record;
  v_users_result record;
  v_total_fixed integer := 0;
  v_result jsonb;
BEGIN
  -- Fix orphaned sites
  SELECT * INTO v_sites_result FROM public.fix_orphaned_sites();
  v_total_fixed := v_total_fixed + v_sites_result.fixed_count;
  
  -- Fix duplicate site names
  SELECT * INTO v_duplicates_result FROM public.fix_duplicate_site_names();
  v_total_fixed := v_total_fixed + v_duplicates_result.fixed_count;
  
  -- Fix orphaned users
  SELECT * INTO v_users_result FROM public.fix_orphaned_users();
  v_total_fixed := v_total_fixed + v_users_result.fixed_count;
  
  v_result := jsonb_build_object(
    'total_fixed', v_total_fixed,
    'orphaned_sites', v_sites_result.details,
    'duplicate_sites', v_duplicates_result.details,
    'orphaned_users', v_users_result.details,
    'timestamp', now()
  );
  
  RETURN v_result;
END;
$$;