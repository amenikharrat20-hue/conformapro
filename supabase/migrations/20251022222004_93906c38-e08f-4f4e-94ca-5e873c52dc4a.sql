-- Fix RLS policies on clients table for proper creation and viewing
DROP POLICY IF EXISTS "Authenticated users can insert clients" ON public.clients;
DROP POLICY IF EXISTS "Users can view their own client" ON public.clients;
DROP POLICY IF EXISTS "Admin client can update their client" ON public.clients;

-- Allow admin_global and gestionnaire_hse to create clients
CREATE POLICY "Admin and HSE can create clients" ON public.clients
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'admin_global'::app_role) OR 
  has_role(auth.uid(), 'gestionnaire_hse'::app_role)
);

-- Allow users to view clients they're associated with OR all if admin_global
CREATE POLICY "Users can view their client or admins can view all" ON public.clients
FOR SELECT USING (
  has_role(auth.uid(), 'admin_global'::app_role) OR
  id = get_user_client_id(auth.uid())
);

-- Allow admin_global and admin_client to update clients
CREATE POLICY "Admins can update clients" ON public.clients
FOR UPDATE USING (
  has_role(auth.uid(), 'admin_global'::app_role) OR
  (has_role(auth.uid(), 'admin_client'::app_role) AND id = get_user_client_id(auth.uid()))
);

-- Create function to auto-assign creator to new client
CREATE OR REPLACE FUNCTION public.assign_creator_to_client()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only auto-assign if the creator doesn't have a client_id yet
  -- and they're not admin_global (admin_global should stay client-agnostic)
  IF NOT has_role(auth.uid(), 'admin_global'::app_role) THEN
    UPDATE public.profiles
    SET client_id = NEW.id
    WHERE id = auth.uid() AND client_id IS NULL;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-assign creator to client
DROP TRIGGER IF EXISTS assign_creator_to_client_trigger ON public.clients;
CREATE TRIGGER assign_creator_to_client_trigger
AFTER INSERT ON public.clients
FOR EACH ROW
EXECUTE FUNCTION public.assign_creator_to_client();