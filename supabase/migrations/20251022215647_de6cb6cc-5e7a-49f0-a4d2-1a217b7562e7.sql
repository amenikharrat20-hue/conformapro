-- Assign admin_global role to all existing users who don't have roles yet
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin_global'::app_role
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles WHERE user_id = auth.users.id
);