-- Update INSERT policy for clients to allow gestionnaire_hse to create clients
DROP POLICY IF EXISTS "Admin global can insert clients" ON public.clients;

CREATE POLICY "Admin global and gestionnaire can insert clients"
ON public.clients
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin_global'::app_role) OR
  has_role(auth.uid(), 'gestionnaire_hse'::app_role)
);

-- Update INSERT policy for sites to allow gestionnaire_hse
DROP POLICY IF EXISTS "Admin client can insert sites for their client" ON public.sites;

CREATE POLICY "Gestionnaire can insert sites for their client"
ON public.sites
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin_global'::app_role) OR
  (
    has_role(auth.uid(), 'gestionnaire_hse'::app_role) OR
    has_role(auth.uid(), 'admin_client'::app_role)
  )
);