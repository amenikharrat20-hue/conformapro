-- Update RLS policies for textes_reglementaires to allow gestionnaire_hse to manage textes

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Admin global can manage textes" ON public.textes_reglementaires;

-- Create new policies allowing both admin_global and gestionnaire_hse to manage textes
CREATE POLICY "Admin and HSE can insert textes" 
ON public.textes_reglementaires 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'admin_global'::app_role) OR 
  has_role(auth.uid(), 'gestionnaire_hse'::app_role)
);

CREATE POLICY "Admin and HSE can update textes" 
ON public.textes_reglementaires 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'admin_global'::app_role) OR 
  has_role(auth.uid(), 'gestionnaire_hse'::app_role)
);

CREATE POLICY "Admin and HSE can delete textes" 
ON public.textes_reglementaires 
FOR DELETE 
USING (
  has_role(auth.uid(), 'admin_global'::app_role) OR 
  has_role(auth.uid(), 'gestionnaire_hse'::app_role)
);

-- Also update related junction tables for domaines and sous-domaines
DROP POLICY IF EXISTS "Admin global can manage textes_domaines" ON public.textes_reglementaires_domaines;
DROP POLICY IF EXISTS "Admin global can manage textes_sous_domaines" ON public.textes_reglementaires_sous_domaines;

CREATE POLICY "Admin and HSE can manage textes_domaines" 
ON public.textes_reglementaires_domaines 
FOR ALL 
USING (
  has_role(auth.uid(), 'admin_global'::app_role) OR 
  has_role(auth.uid(), 'gestionnaire_hse'::app_role)
);

CREATE POLICY "Admin and HSE can manage textes_sous_domaines" 
ON public.textes_reglementaires_sous_domaines 
FOR ALL 
USING (
  has_role(auth.uid(), 'admin_global'::app_role) OR 
  has_role(auth.uid(), 'gestionnaire_hse'::app_role)
);