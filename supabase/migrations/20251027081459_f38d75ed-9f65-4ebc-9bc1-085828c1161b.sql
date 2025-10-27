-- Create enum for equipment operational status
CREATE TYPE public.statut_operationnel AS ENUM (
  'en_service',
  'hors_service',
  'arret_technique'
);

-- Create enum for conformity status
CREATE TYPE public.statut_conformite AS ENUM (
  'conforme',
  'non_conforme',
  'a_controler'
);

-- Create enum for control result
CREATE TYPE public.resultat_controle AS ENUM (
  'conforme',
  'non_conforme',
  'conforme_avec_reserves',
  'en_attente'
);

-- Create reference table for equipment types
CREATE TABLE public.types_equipement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  libelle TEXT NOT NULL,
  description TEXT,
  periodicite_mois INTEGER NOT NULL DEFAULT 12,
  reglementation_reference TEXT,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create reference table for authorized control organizations
CREATE TABLE public.organismes_controle (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  agrement_numero TEXT,
  telephone TEXT,
  email TEXT,
  adresse TEXT,
  specialites TEXT[],
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create main equipment table
CREATE TABLE public.equipements_controle (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  type_equipement_id UUID NOT NULL REFERENCES public.types_equipement(id),
  code_identification TEXT NOT NULL,
  localisation TEXT,
  batiment TEXT,
  etage TEXT,
  marque TEXT,
  modele TEXT,
  numero_serie TEXT,
  date_mise_en_service DATE,
  date_dernier_controle DATE,
  organisme_controle_id UUID REFERENCES public.organismes_controle(id),
  periodicite_mois INTEGER NOT NULL DEFAULT 12,
  prochaine_echeance DATE,
  statut_conformite public.statut_conformite DEFAULT 'a_controler',
  resultat_dernier_controle public.resultat_controle,
  statut_operationnel public.statut_operationnel DEFAULT 'en_service',
  observations TEXT,
  responsable_hse_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  UNIQUE(site_id, code_identification)
);

-- Create control history table
CREATE TABLE public.historique_controles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipement_id UUID NOT NULL REFERENCES public.equipements_controle(id) ON DELETE CASCADE,
  date_controle DATE NOT NULL,
  organisme_controle_id UUID REFERENCES public.organismes_controle(id),
  resultat public.resultat_controle NOT NULL,
  observations TEXT,
  rapport_url TEXT,
  non_conformites TEXT[],
  actions_correctives TEXT,
  controleur_nom TEXT,
  certificat_numero TEXT,
  prochaine_echeance DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Enable RLS
ALTER TABLE public.types_equipement ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organismes_controle ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipements_controle ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historique_controles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for types_equipement
CREATE POLICY "Authenticated users can view equipment types"
ON public.types_equipement FOR SELECT
USING (auth.uid() IS NOT NULL AND actif = true);

CREATE POLICY "Admin and HSE can manage equipment types"
ON public.types_equipement FOR ALL
USING (
  has_role(auth.uid(), 'admin_global'::app_role) OR 
  has_role(auth.uid(), 'gestionnaire_hse'::app_role)
);

-- RLS Policies for organismes_controle
CREATE POLICY "Authenticated users can view control organizations"
ON public.organismes_controle FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin and HSE can manage control organizations"
ON public.organismes_controle FOR ALL
USING (
  has_role(auth.uid(), 'admin_global'::app_role) OR 
  has_role(auth.uid(), 'gestionnaire_hse'::app_role)
);

-- RLS Policies for equipements_controle
CREATE POLICY "Admin global can view all equipment"
ON public.equipements_controle FOR SELECT
USING (has_role(auth.uid(), 'admin_global'::app_role));

CREATE POLICY "Users can view equipment from their client sites"
ON public.equipements_controle FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.sites s
    WHERE s.id = equipements_controle.site_id
    AND s.client_id = get_user_client_id(auth.uid())
  )
);

CREATE POLICY "Admin global can manage all equipment"
ON public.equipements_controle FOR ALL
USING (has_role(auth.uid(), 'admin_global'::app_role));

CREATE POLICY "HSE can manage equipment for their client sites"
ON public.equipements_controle FOR ALL
USING (
  has_role(auth.uid(), 'gestionnaire_hse'::app_role) AND
  EXISTS (
    SELECT 1 FROM public.sites s
    WHERE s.id = equipements_controle.site_id
    AND s.client_id = get_user_client_id(auth.uid())
  )
);

-- RLS Policies for historique_controles
CREATE POLICY "Admin global can view all control history"
ON public.historique_controles FOR SELECT
USING (has_role(auth.uid(), 'admin_global'::app_role));

CREATE POLICY "Users can view control history for their client equipment"
ON public.historique_controles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.equipements_controle e
    JOIN public.sites s ON s.id = e.site_id
    WHERE e.id = historique_controles.equipement_id
    AND s.client_id = get_user_client_id(auth.uid())
  )
);

CREATE POLICY "Admin global can manage all control history"
ON public.historique_controles FOR ALL
USING (has_role(auth.uid(), 'admin_global'::app_role));

CREATE POLICY "HSE can manage control history for their client equipment"
ON public.historique_controles FOR ALL
USING (
  has_role(auth.uid(), 'gestionnaire_hse'::app_role) AND
  EXISTS (
    SELECT 1 FROM public.equipements_controle e
    JOIN public.sites s ON s.id = e.site_id
    WHERE e.id = historique_controles.equipement_id
    AND s.client_id = get_user_client_id(auth.uid())
  )
);

-- Create function to auto-calculate next control date
CREATE OR REPLACE FUNCTION public.calculate_next_control_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.date_dernier_controle IS NOT NULL AND NEW.periodicite_mois IS NOT NULL THEN
    NEW.prochaine_echeance := NEW.date_dernier_controle + (NEW.periodicite_mois || ' months')::INTERVAL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-calculation
CREATE TRIGGER trigger_calculate_next_control_date
BEFORE INSERT OR UPDATE OF date_dernier_controle, periodicite_mois
ON public.equipements_controle
FOR EACH ROW
EXECUTE FUNCTION public.calculate_next_control_date();

-- Create trigger for updated_at
CREATE TRIGGER update_equipements_controle_updated_at
BEFORE UPDATE ON public.equipements_controle
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_types_equipement_updated_at
BEFORE UPDATE ON public.types_equipement
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_organismes_controle_updated_at
BEFORE UPDATE ON public.organismes_controle
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default equipment types (common Tunisian regulatory equipment)
INSERT INTO public.types_equipement (code, libelle, periodicite_mois, reglementation_reference) VALUES
('EXTINCTEUR', 'Extincteur', 12, 'Arrêté du 11 mars 2005'),
('RIA', 'Robinet d''Incendie Armé (RIA)', 12, 'Arrêté du 11 mars 2005'),
('CHAUDIERE', 'Chaudière à vapeur', 12, 'Décret n°2013-3735'),
('MONTE_CHARGE', 'Monte-charge', 12, 'Décret n°2013-3735'),
('ASCENSEUR', 'Ascenseur', 12, 'Décret n°2013-3735'),
('APPAREIL_LEVAGE', 'Appareil de levage', 12, 'Décret n°2013-3735'),
('RESERVOIR_PRESSION', 'Réservoir sous pression', 24, 'Décret n°2013-3735'),
('INSTALLATION_ELECTRIQUE', 'Installation électrique', 60, 'Code de l''électricité'),
('INSTALLATION_GAZ', 'Installation de gaz', 12, 'Arrêté relatif aux installations de gaz'),
('SPRINKLER', 'Système sprinkler', 12, 'Arrêté du 11 mars 2005'),
('DETECTION_INCENDIE', 'Système de détection incendie', 12, 'Arrêté du 11 mars 2005'),
('DESENFUMAGE', 'Système de désenfumage', 12, 'Arrêté du 11 mars 2005'),
('PORTE_COUPE_FEU', 'Porte coupe-feu', 12, 'Arrêté du 11 mars 2005'),
('ECLAIRAGE_SECOURS', 'Éclairage de sécurité', 12, 'Arrêté du 11 mars 2005');

-- Create storage bucket for control reports
INSERT INTO storage.buckets (id, name, public) 
VALUES ('controle_rapports', 'controle_rapports', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for control reports
CREATE POLICY "Users can view reports for their client equipment"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'controle_rapports' AND
  EXISTS (
    SELECT 1 FROM public.equipements_controle e
    JOIN public.sites s ON s.id = e.site_id
    WHERE s.client_id = get_user_client_id(auth.uid())
  )
);

CREATE POLICY "HSE can upload reports for their client equipment"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'controle_rapports' AND
  (has_role(auth.uid(), 'admin_global'::app_role) OR 
   has_role(auth.uid(), 'gestionnaire_hse'::app_role))
);

CREATE POLICY "HSE can update reports for their client equipment"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'controle_rapports' AND
  (has_role(auth.uid(), 'admin_global'::app_role) OR 
   has_role(auth.uid(), 'gestionnaire_hse'::app_role))
);

CREATE POLICY "HSE can delete reports for their client equipment"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'controle_rapports' AND
  (has_role(auth.uid(), 'admin_global'::app_role) OR 
   has_role(auth.uid(), 'gestionnaire_hse'::app_role))
);