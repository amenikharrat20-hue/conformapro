-- Create RPC function for transactional client user invite/update
CREATE OR REPLACE FUNCTION public.invite_or_update_client_user(
  p_email TEXT,
  p_full_name TEXT,
  p_role app_role,
  p_client_id UUID,
  p_site_ids UUID[]
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_site_id UUID;
  v_profile_exists BOOLEAN;
  v_result jsonb;
BEGIN
  -- Validate that all site_ids belong to the client
  IF NOT (SELECT bool_and(client_id = p_client_id) 
          FROM public.sites 
          WHERE id = ANY(p_site_ids)) THEN
    RAISE EXCEPTION 'Un ou plusieurs sites n''appartiennent pas à ce client';
  END IF;

  -- Check if profile exists (user already invited)
  SELECT id, true INTO v_user_id, v_profile_exists
  FROM public.profiles
  WHERE email = p_email;

  IF NOT v_profile_exists THEN
    -- User doesn't exist, we'll need to create profile after auth.users is created
    -- Note: This assumes the profile will be created via trigger or separate process
    v_result := jsonb_build_object(
      'action', 'invite_needed',
      'email', p_email,
      'message', 'L''utilisateur doit être invité via Supabase Auth'
    );
  ELSE
    -- User exists, verify they belong to the same client
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = v_user_id 
      AND (client_id = p_client_id OR client_id IS NULL)
    ) THEN
      RAISE EXCEPTION 'Cet utilisateur appartient à un autre client';
    END IF;

    -- Update profile
    UPDATE public.profiles
    SET 
      nom = split_part(p_full_name, ' ', 1),
      prenom = split_part(p_full_name, ' ', 2),
      client_id = p_client_id,
      updated_at = now()
    WHERE id = v_user_id;

    -- Update user role
    DELETE FROM public.user_roles WHERE user_id = v_user_id;
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, p_role);

    -- Replace access scopes for this client's sites
    DELETE FROM public.access_scopes 
    WHERE utilisateur_id = v_user_id
    AND site_id IN (SELECT id FROM public.sites WHERE client_id = p_client_id);

    -- Insert new access scopes
    FOREACH v_site_id IN ARRAY p_site_ids
    LOOP
      INSERT INTO public.access_scopes (utilisateur_id, site_id, read_only)
      VALUES (
        v_user_id, 
        v_site_id, 
        CASE WHEN p_role = 'lecteur' THEN true ELSE false END
      )
      ON CONFLICT (utilisateur_id, site_id) DO UPDATE
      SET read_only = CASE WHEN p_role = 'lecteur' THEN true ELSE false END;
    END LOOP;

    v_result := jsonb_build_object(
      'action', 'updated',
      'user_id', v_user_id,
      'message', 'Accès mis à jour avec succès'
    );
  END IF;

  RETURN v_result;
END;
$$;

-- Grant execute to authenticated users (RLS will handle authorization)
GRANT EXECUTE ON FUNCTION public.invite_or_update_client_user TO authenticated;