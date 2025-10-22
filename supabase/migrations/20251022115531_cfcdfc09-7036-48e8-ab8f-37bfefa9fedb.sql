-- Add DELETE policy for clients table
CREATE POLICY "Admin global can delete clients"
ON public.clients
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin_global'::app_role));

-- Add DELETE policy for sites table
CREATE POLICY "Admin global can delete sites"
ON public.sites
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin_global'::app_role));