-- Grant admin_global role to main admin user
DELETE FROM public.user_roles WHERE user_id = '547ac9f3-39e4-48d0-8d59-f4eacd39f646';
INSERT INTO public.user_roles (user_id, role) 
VALUES ('547ac9f3-39e4-48d0-8d59-f4eacd39f646', 'admin_global');

-- Update RLS policies for domaines_application to allow both admin_global and gestionnaire_hse
DROP POLICY IF EXISTS "Admin global can manage domaines" ON public.domaines_application;
CREATE POLICY "Admin and HSE can manage domaines" ON public.domaines_application
FOR ALL USING (
  has_role(auth.uid(), 'admin_global'::app_role) OR 
  has_role(auth.uid(), 'gestionnaire_hse'::app_role)
);

-- Update RLS policies for sous_domaines_application to allow both admin_global and gestionnaire_hse
DROP POLICY IF EXISTS "Admin global can manage sous-domaines" ON public.sous_domaines_application;
CREATE POLICY "Admin and HSE can manage sous-domaines" ON public.sous_domaines_application
FOR ALL USING (
  has_role(auth.uid(), 'admin_global'::app_role) OR 
  has_role(auth.uid(), 'gestionnaire_hse'::app_role)
);