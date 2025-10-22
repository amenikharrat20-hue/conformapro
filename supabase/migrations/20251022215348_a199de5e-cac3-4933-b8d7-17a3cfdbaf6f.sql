-- Update RLS policy to allow authenticated users to create clients for testing
-- This temporarily allows any authenticated user to create clients
DROP POLICY IF EXISTS "Admin global and gestionnaire can insert clients" ON public.clients;

CREATE POLICY "Authenticated users can insert clients"
ON public.clients
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Keep the existing admin-only policies for update and delete