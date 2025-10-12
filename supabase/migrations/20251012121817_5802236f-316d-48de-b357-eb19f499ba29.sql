-- Create storage bucket for regulatory text PDFs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'textes_pdf',
  'textes_pdf',
  true,
  10485760, -- 10MB
  ARRAY['application/pdf']
);

-- Create RLS policies for the textes_pdf bucket
CREATE POLICY "Admin global can upload PDFs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'textes_pdf' AND
  has_role(auth.uid(), 'admin_global'::app_role)
);

CREATE POLICY "Admin global can update PDFs"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'textes_pdf' AND
  has_role(auth.uid(), 'admin_global'::app_role)
);

CREATE POLICY "Admin global can delete PDFs"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'textes_pdf' AND
  has_role(auth.uid(), 'admin_global'::app_role)
);

CREATE POLICY "Everyone can view PDFs"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'textes_pdf');

-- Insert base domains
INSERT INTO domaines_application (code, libelle, actif) VALUES
('SEC', 'Sécurité au travail', true),
('ENV', 'Environnement', true),
('SAN', 'Santé et hygiène', true),
('INC', 'Incendie et protection civile', true),
('CHI', 'Produits chimiques et dangereux', true),
('TRA', 'Transport et logistique', true),
('BAT', 'Bâtiment et construction', true),
('ENE', 'Énergie', true);

-- Insert sub-domains for Sécurité
INSERT INTO sous_domaines_application (domaine_id, code, libelle, ordre, actif)
SELECT id, 'SEC_EPI', 'Équipements de protection individuelle', 1, true
FROM domaines_application WHERE code = 'SEC';

INSERT INTO sous_domaines_application (domaine_id, code, libelle, ordre, actif)
SELECT id, 'SEC_MAC', 'Machines et équipements', 2, true
FROM domaines_application WHERE code = 'SEC';

INSERT INTO sous_domaines_application (domaine_id, code, libelle, ordre, actif)
SELECT id, 'SEC_ACC', 'Accidents du travail', 3, true
FROM domaines_application WHERE code = 'SEC';

-- Insert sub-domains for Environnement
INSERT INTO sous_domaines_application (domaine_id, code, libelle, ordre, actif)
SELECT id, 'ENV_DEC', 'Déchets', 1, true
FROM domaines_application WHERE code = 'ENV';

INSERT INTO sous_domaines_application (domaine_id, code, libelle, ordre, actif)
SELECT id, 'ENV_EAU', 'Eau et assainissement', 2, true
FROM domaines_application WHERE code = 'ENV';

INSERT INTO sous_domaines_application (domaine_id, code, libelle, ordre, actif)
SELECT id, 'ENV_AIR', 'Air et émissions', 3, true
FROM domaines_application WHERE code = 'ENV';

INSERT INTO sous_domaines_application (domaine_id, code, libelle, ordre, actif)
SELECT id, 'ENV_IMP', 'Impact environnemental', 4, true
FROM domaines_application WHERE code = 'ENV';

-- Insert sub-domains for Santé
INSERT INTO sous_domaines_application (domaine_id, code, libelle, ordre, actif)
SELECT id, 'SAN_HYG', 'Hygiène', 1, true
FROM domaines_application WHERE code = 'SAN';

INSERT INTO sous_domaines_application (domaine_id, code, libelle, ordre, actif)
SELECT id, 'SAN_MED', 'Médecine du travail', 2, true
FROM domaines_application WHERE code = 'SAN';

INSERT INTO sous_domaines_application (domaine_id, code, libelle, ordre, actif)
SELECT id, 'SAN_ERG', 'Ergonomie', 3, true
FROM domaines_application WHERE code = 'SAN';

-- Insert sub-domains for Incendie
INSERT INTO sous_domaines_application (domaine_id, code, libelle, ordre, actif)
SELECT id, 'INC_PRE', 'Prévention incendie', 1, true
FROM domaines_application WHERE code = 'INC';

INSERT INTO sous_domaines_application (domaine_id, code, libelle, ordre, actif)
SELECT id, 'INC_EXT', 'Systèmes d''extinction', 2, true
FROM domaines_application WHERE code = 'INC';

INSERT INTO sous_domaines_application (domaine_id, code, libelle, ordre, actif)
SELECT id, 'INC_EVA', 'Évacuation', 3, true
FROM domaines_application WHERE code = 'INC';