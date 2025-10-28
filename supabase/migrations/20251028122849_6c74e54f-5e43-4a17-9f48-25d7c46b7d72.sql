-- Add medical roles to app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'med_practitioner';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'med_admin';