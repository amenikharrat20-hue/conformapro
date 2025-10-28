-- Create employees table if not exists
CREATE TABLE IF NOT EXISTS public.employes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  site_id uuid REFERENCES public.sites(id) ON DELETE SET NULL,
  matricule text NOT NULL,
  nom text NOT NULL,
  prenom text NOT NULL,
  date_naissance date,
  poste text,
  date_embauche date,
  statut_emploi text DEFAULT 'ACTIF' CHECK (statut_emploi IN ('ACTIF', 'SUSPENDU', 'DEMISSIONNAIRE', 'LICENCIE', 'RETRAITE')),
  risques_exposition text[],
  aptitude_medicale text DEFAULT 'NON_EVALUE' CHECK (aptitude_medicale IN ('APTE', 'APTE_RESTRICTIONS', 'INAPTE_TEMP', 'INAPTE_DEFINITIVE', 'NON_EVALUE')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(client_id, matricule)
);

-- Create enums for medical visits
CREATE TYPE type_visite_medicale AS ENUM (
  'EMBAUCHE',
  'PERIODIQUE',
  'REPRISE',
  'CHANGEMENT_POSTE',
  'SMS'
);

CREATE TYPE statut_visite_medicale AS ENUM (
  'PLANIFIEE',
  'REALISEE',
  'REPORTEE',
  'ANNULEE',
  'NO_SHOW'
);

CREATE TYPE resultat_aptitude AS ENUM (
  'APTE',
  'APTE_RESTRICTIONS',
  'INAPTE_TEMP',
  'INAPTE_DEFINITIVE',
  'AVIS_RESERVE',
  'EN_ATTENTE'
);

CREATE TYPE type_document_medical AS ENUM (
  'CONVOCATION',
  'AVIS_APTITUDE',
  'JUSTIFICATIF',
  'AUTRE'
);

-- Main medical visits table
CREATE TABLE public.med_visites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employe_id uuid NOT NULL REFERENCES public.employes(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  site_id uuid REFERENCES public.sites(id) ON DELETE SET NULL,
  type_visite type_visite_medicale NOT NULL,
  motif text,
  date_planifiee timestamptz NOT NULL,
  date_realisee timestamptz,
  statut_visite statut_visite_medicale NOT NULL DEFAULT 'PLANIFIEE',
  resultat_aptitude resultat_aptitude DEFAULT 'EN_ATTENTE',
  restrictions text,
  validite_jusqua date,
  prochaine_echeance date,
  sms_flags text[],
  medecin_nom text,
  medecin_organisme text,
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Medical documents table
CREATE TABLE public.med_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visite_id uuid NOT NULL REFERENCES public.med_visites(id) ON DELETE CASCADE,
  type_doc type_document_medical NOT NULL,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_size int,
  version int NOT NULL DEFAULT 1,
  valid_until date,
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Confidential medical notes (only accessible by medical staff)
CREATE TABLE public.med_notes_confidentielles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visite_id uuid NOT NULL REFERENCES public.med_visites(id) ON DELETE CASCADE,
  observations text,
  examens_realises text,
  contre_indications text,
  propositions_amenagement text,
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Periodicity rules table
CREATE TABLE public.med_periodicite_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  libelle text NOT NULL,
  periodicite_mois int NOT NULL,
  description text,
  actif boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Insert default periodicity rules
INSERT INTO public.med_periodicite_rules (key, libelle, periodicite_mois, description) VALUES
  ('STANDARD_12M', 'Visite périodique standard', 12, 'Périodicité normale pour employés sans risque particulier'),
  ('STANDARD_24M', 'Visite périodique espacée', 24, 'Pour personnel administratif sans exposition'),
  ('RISQUE_BRUIT_12M', 'Exposition bruit', 12, 'Surveillance médicale spéciale - Bruit'),
  ('TRAVAIL_NUIT_6M', 'Travail de nuit', 6, 'Surveillance renforcée - Travail nocturne'),
  ('RISQUE_CHIMIQUE_12M', 'Exposition chimique', 12, 'Surveillance médicale spéciale - Agents chimiques'),
  ('POUSSIERE_AMIANTE_6M', 'Amiante/Poussières', 6, 'Surveillance renforcée - Exposition amiante'),
  ('JEUNE_TRAVAILLEUR_12M', 'Jeune travailleur (<18 ans)', 12, 'Surveillance adaptée mineurs'),
  ('FEMME_ENCEINTE_3M', 'Grossesse déclarée', 3, 'Suivi rapproché femme enceinte');

-- Enable RLS on all tables
ALTER TABLE public.employes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.med_visites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.med_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.med_notes_confidentielles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.med_periodicite_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for employes
CREATE POLICY "Admin global can manage all employees"
  ON public.employes FOR ALL
  USING (has_role(auth.uid(), 'admin_global'));

CREATE POLICY "Users can view employees in their client"
  ON public.employes FOR SELECT
  USING (client_id = get_user_client_id(auth.uid()));

CREATE POLICY "Admin client and HSE can manage employees"
  ON public.employes FOR ALL
  USING (
    client_id = get_user_client_id(auth.uid()) 
    AND (has_role(auth.uid(), 'admin_client') OR has_role(auth.uid(), 'gestionnaire_hse'))
  );

-- RLS Policies for med_visites
CREATE POLICY "Admin global can manage all visits"
  ON public.med_visites FOR ALL
  USING (has_role(auth.uid(), 'admin_global'));

CREATE POLICY "Medical staff can manage all visits"
  ON public.med_visites FOR ALL
  USING (has_role(auth.uid(), 'med_practitioner') OR has_role(auth.uid(), 'med_admin'));

CREATE POLICY "Users can view visits in their client"
  ON public.med_visites FOR SELECT
  USING (client_id = get_user_client_id(auth.uid()));

CREATE POLICY "HSE can manage visits for their client"
  ON public.med_visites FOR ALL
  USING (
    client_id = get_user_client_id(auth.uid()) 
    AND has_role(auth.uid(), 'gestionnaire_hse')
  );

-- RLS Policies for med_documents
CREATE POLICY "Admin global can manage all documents"
  ON public.med_documents FOR ALL
  USING (has_role(auth.uid(), 'admin_global'));

CREATE POLICY "Medical staff can manage all documents"
  ON public.med_documents FOR ALL
  USING (has_role(auth.uid(), 'med_practitioner') OR has_role(auth.uid(), 'med_admin'));

CREATE POLICY "Users can view documents for their client visits"
  ON public.med_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.med_visites v
      WHERE v.id = med_documents.visite_id
      AND v.client_id = get_user_client_id(auth.uid())
    )
  );

-- RLS Policies for med_notes_confidentielles (RESTRICTED TO MEDICAL STAFF ONLY)
CREATE POLICY "Only medical staff can access confidential notes"
  ON public.med_notes_confidentielles FOR ALL
  USING (
    has_role(auth.uid(), 'med_practitioner') 
    OR has_role(auth.uid(), 'med_admin')
    OR has_role(auth.uid(), 'admin_global')
  );

-- RLS Policies for med_periodicite_rules
CREATE POLICY "Everyone can view active periodicity rules"
  ON public.med_periodicite_rules FOR SELECT
  USING (actif = true);

CREATE POLICY "Admin global can manage periodicity rules"
  ON public.med_periodicite_rules FOR ALL
  USING (has_role(auth.uid(), 'admin_global'));

-- Triggers for updated_at
CREATE TRIGGER update_employes_updated_at
  BEFORE UPDATE ON public.employes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_med_visites_updated_at
  BEFORE UPDATE ON public.med_visites
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_med_notes_updated_at
  BEFORE UPDATE ON public.med_notes_confidentielles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_periodicite_rules_updated_at
  BEFORE UPDATE ON public.med_periodicite_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-update employee aptitude when visit is completed
CREATE OR REPLACE FUNCTION update_employee_aptitude()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.statut_visite = 'REALISEE' AND NEW.resultat_aptitude IS NOT NULL THEN
    UPDATE public.employes
    SET aptitude_medicale = NEW.resultat_aptitude::text
    WHERE id = NEW.employe_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER sync_employee_aptitude
  AFTER INSERT OR UPDATE ON public.med_visites
  FOR EACH ROW
  WHEN (NEW.statut_visite = 'REALISEE')
  EXECUTE FUNCTION update_employee_aptitude();

-- Create storage bucket for medical documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('medical_documents', 'medical_documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for medical documents
CREATE POLICY "Medical staff can upload documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'medical_documents' 
    AND (
      has_role(auth.uid(), 'med_practitioner') 
      OR has_role(auth.uid(), 'med_admin')
      OR has_role(auth.uid(), 'admin_global')
      OR has_role(auth.uid(), 'gestionnaire_hse')
    )
  );

CREATE POLICY "Medical staff can view documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'medical_documents' 
    AND (
      has_role(auth.uid(), 'med_practitioner') 
      OR has_role(auth.uid(), 'med_admin')
      OR has_role(auth.uid(), 'admin_global')
      OR has_role(auth.uid(), 'gestionnaire_hse')
    )
  );

CREATE POLICY "Medical staff can delete documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'medical_documents' 
    AND (
      has_role(auth.uid(), 'med_practitioner') 
      OR has_role(auth.uid(), 'med_admin')
      OR has_role(auth.uid(), 'admin_global')
    )
  );