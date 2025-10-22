-- Add description column to domaines_application if it doesn't exist
ALTER TABLE public.domaines_application
ADD COLUMN IF NOT EXISTS description text;

-- Add description column to sous_domaines_application if it doesn't exist
ALTER TABLE public.sous_domaines_application
ADD COLUMN IF NOT EXISTS description text;

-- Seed example domaines
INSERT INTO public.domaines_application (code, libelle, description, actif) VALUES
  ('QUA', 'Qualité', 'Normes et exigences de qualité des produits et services', true),
  ('SEC', 'Sécurité', 'Sécurité au travail et prévention des accidents', true),
  ('ENV', 'Environnement', 'Protection environnementale et gestion des impacts', true),
  ('ENE', 'Énergie', 'Efficacité énergétique et énergies renouvelables', true),
  ('SUR', 'Sûreté', 'Sûreté des installations et sécurité des biens', true),
  ('SOC', 'Social', 'Responsabilité sociale et bien-être des employés', true),
  ('SAL', 'Sécurité alimentaire', 'Hygiène et sécurité des denrées alimentaires', true),
  ('SIN', 'Sécurité de l''information', 'Protection des données et cybersécurité', true)
ON CONFLICT (code) DO NOTHING;