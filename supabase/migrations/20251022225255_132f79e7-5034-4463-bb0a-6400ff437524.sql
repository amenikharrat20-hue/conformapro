-- Update textes_reglementaires type enum to support more detailed categories
ALTER TABLE public.textes_reglementaires DROP CONSTRAINT IF EXISTS textes_reglementaires_type_check;

-- Add new type enum with detailed categories
DO $$ BEGIN
  CREATE TYPE type_texte_reglementaire AS ENUM (
    'LOI_ORDINAIRE',
    'LOI_ORGANIQUE',
    'DECRET_LOI',
    'DECRET_PRESIDENTIEL',
    'DECRET_GOUVERNEMENTAL',
    'ARRETE_MINISTERIEL',
    'ARRETE_INTERMINISTERIEL',
    'CIRCULAIRE'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Update the type column to use the new enum
ALTER TABLE public.textes_reglementaires
  ALTER COLUMN type TYPE type_texte_reglementaire USING type::text::type_texte_reglementaire;