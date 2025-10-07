-- Create ENUM types for regulatory module
CREATE TYPE public.statut_texte AS ENUM ('en_vigueur', 'abroge', 'modifie');
CREATE TYPE public.domaine_reglementaire AS ENUM ('Incendie', 'Sécurité du travail', 'Environnement', 'RH', 'Hygiène', 'Autres');
CREATE TYPE public.etat_conformite AS ENUM ('Conforme', 'Partiel', 'Non_conforme', 'Non_evalue');
CREATE TYPE public.statut_action AS ENUM ('A_faire', 'En_cours', 'Termine', 'Bloque');
CREATE TYPE public.statut_lecture AS ENUM ('A_lire', 'Lu', 'Valide');
CREATE TYPE public.priorite AS ENUM ('Basse', 'Moyenne', 'Haute', 'Critique');

-- Table: textes_reglementaires
CREATE TABLE public.textes_reglementaires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titre TEXT NOT NULL,
  source TEXT,
  reference TEXT NOT NULL,
  date_publication DATE,
  domaine domaine_reglementaire NOT NULL,
  mots_cles TEXT[],
  resume TEXT,
  lien_pdf TEXT,
  version INTEGER DEFAULT 1,
  statut statut_texte DEFAULT 'en_vigueur',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.textes_reglementaires ENABLE ROW LEVEL SECURITY;

-- Table: articles
CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  texte_id UUID REFERENCES public.textes_reglementaires(id) ON DELETE CASCADE NOT NULL,
  numero TEXT NOT NULL,
  resume_article TEXT,
  exigences TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Table: applicabilite
CREATE TABLE public.applicabilite (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  texte_id UUID REFERENCES public.textes_reglementaires(id) ON DELETE CASCADE NOT NULL,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  activite TEXT,
  applicable BOOLEAN DEFAULT true,
  justification TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.applicabilite ENABLE ROW LEVEL SECURITY;

-- Table: conformite
CREATE TABLE public.conformite (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicabilite_id UUID REFERENCES public.applicabilite(id) ON DELETE CASCADE NOT NULL,
  etat etat_conformite DEFAULT 'Non_evalue',
  score NUMERIC(5,2) CHECK (score >= 0 AND score <= 100),
  commentaire TEXT,
  derniere_mise_a_jour TIMESTAMPTZ DEFAULT now(),
  mise_a_jour_par UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.conformite ENABLE ROW LEVEL SECURITY;

-- Table: preuves
CREATE TABLE public.preuves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conformite_id UUID REFERENCES public.conformite(id) ON DELETE CASCADE NOT NULL,
  type TEXT,
  fichier_url TEXT,
  empreinte_sha256 TEXT,
  date TIMESTAMPTZ DEFAULT now(),
  ajoute_par UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.preuves ENABLE ROW LEVEL SECURITY;

-- Table: actions_correctives
CREATE TABLE public.actions_correctives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conformite_id UUID REFERENCES public.conformite(id) ON DELETE CASCADE NOT NULL,
  manquement TEXT NOT NULL,
  action TEXT NOT NULL,
  responsable UUID REFERENCES auth.users(id),
  echeance DATE,
  statut statut_action DEFAULT 'A_faire',
  cout_estime NUMERIC(10,2),
  priorite priorite DEFAULT 'Moyenne',
  preuve_cloture_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.actions_correctives ENABLE ROW LEVEL SECURITY;

-- Table: lectures_validations
CREATE TABLE public.lectures_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  texte_id UUID REFERENCES public.textes_reglementaires(id) ON DELETE CASCADE NOT NULL,
  utilisateur_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  date_lecture TIMESTAMPTZ,
  date_validation TIMESTAMPTZ,
  statut statut_lecture DEFAULT 'A_lire',
  commentaire TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(texte_id, utilisateur_id, site_id)
);

ALTER TABLE public.lectures_validations ENABLE ROW LEVEL SECURITY;

-- Table: changelog_reglementaire
CREATE TABLE public.changelog_reglementaire (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  texte_id UUID REFERENCES public.textes_reglementaires(id) ON DELETE CASCADE NOT NULL,
  type_changement TEXT NOT NULL,
  resume TEXT,
  date_changement TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.changelog_reglementaire ENABLE ROW LEVEL SECURITY;

-- Table: referentiels_secteurs
CREATE TABLE public.referentiels_secteurs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  secteur secteur NOT NULL,
  exigences_types TEXT[],
  actifs_concernes TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.referentiels_secteurs ENABLE ROW LEVEL SECURITY;

-- Table: liens_module
CREATE TABLE public.liens_module (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
  module TEXT NOT NULL,
  record_id UUID NOT NULL,
  action_corrective_id UUID REFERENCES public.actions_correctives(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.liens_module ENABLE ROW LEVEL SECURITY;

-- Create updated_at triggers
CREATE TRIGGER update_textes_reglementaires_updated_at
  BEFORE UPDATE ON public.textes_reglementaires
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_applicabilite_updated_at
  BEFORE UPDATE ON public.applicabilite
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_actions_correctives_updated_at
  BEFORE UPDATE ON public.actions_correctives
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_referentiels_secteurs_updated_at
  BEFORE UPDATE ON public.referentiels_secteurs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for textes_reglementaires
CREATE POLICY "Admin global can manage regulatory texts"
  ON public.textes_reglementaires FOR ALL
  USING (has_role(auth.uid(), 'admin_global'));

CREATE POLICY "Authenticated users can view regulatory texts"
  ON public.textes_reglementaires FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- RLS Policies for articles
CREATE POLICY "Admin global can manage articles"
  ON public.articles FOR ALL
  USING (has_role(auth.uid(), 'admin_global'));

CREATE POLICY "Authenticated users can view articles"
  ON public.articles FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- RLS Policies for applicabilite
CREATE POLICY "Admin global can manage all applicability"
  ON public.applicabilite FOR ALL
  USING (has_role(auth.uid(), 'admin_global'));

CREATE POLICY "Users can view applicability for their client"
  ON public.applicabilite FOR SELECT
  USING (client_id = get_user_client_id(auth.uid()));

CREATE POLICY "Admin client can manage applicability for their client"
  ON public.applicabilite FOR ALL
  USING (client_id = get_user_client_id(auth.uid()) AND has_role(auth.uid(), 'admin_client'));

CREATE POLICY "Gestionnaire HSE can manage applicability for their client"
  ON public.applicabilite FOR ALL
  USING (client_id = get_user_client_id(auth.uid()) AND has_role(auth.uid(), 'gestionnaire_hse'));

-- RLS Policies for conformite
CREATE POLICY "Admin global can manage all compliance"
  ON public.conformite FOR ALL
  USING (has_role(auth.uid(), 'admin_global'));

CREATE POLICY "Users can view compliance for their client"
  ON public.conformite FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.applicabilite a
      WHERE a.id = conformite.applicabilite_id
      AND a.client_id = get_user_client_id(auth.uid())
    )
  );

CREATE POLICY "Gestionnaire HSE can manage compliance for their client"
  ON public.conformite FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.applicabilite a
      WHERE a.id = conformite.applicabilite_id
      AND a.client_id = get_user_client_id(auth.uid())
    ) AND has_role(auth.uid(), 'gestionnaire_hse')
  );

-- RLS Policies for preuves
CREATE POLICY "Admin global can manage all evidence"
  ON public.preuves FOR ALL
  USING (has_role(auth.uid(), 'admin_global'));

CREATE POLICY "Users can view evidence for their client"
  ON public.preuves FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conformite c
      JOIN public.applicabilite a ON c.applicabilite_id = a.id
      WHERE c.id = preuves.conformite_id
      AND a.client_id = get_user_client_id(auth.uid())
    )
  );

CREATE POLICY "Gestionnaire HSE can manage evidence for their client"
  ON public.preuves FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conformite c
      JOIN public.applicabilite a ON c.applicabilite_id = a.id
      WHERE c.id = preuves.conformite_id
      AND a.client_id = get_user_client_id(auth.uid())
    ) AND has_role(auth.uid(), 'gestionnaire_hse')
  );

-- RLS Policies for actions_correctives
CREATE POLICY "Admin global can manage all actions"
  ON public.actions_correctives FOR ALL
  USING (has_role(auth.uid(), 'admin_global'));

CREATE POLICY "Users can view actions for their client"
  ON public.actions_correctives FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conformite c
      JOIN public.applicabilite a ON c.applicabilite_id = a.id
      WHERE c.id = actions_correctives.conformite_id
      AND a.client_id = get_user_client_id(auth.uid())
    )
  );

CREATE POLICY "Gestionnaire HSE can manage actions for their client"
  ON public.actions_correctives FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.conformite c
      JOIN public.applicabilite a ON c.applicabilite_id = a.id
      WHERE c.id = actions_correctives.conformite_id
      AND a.client_id = get_user_client_id(auth.uid())
    ) AND has_role(auth.uid(), 'gestionnaire_hse')
  );

-- RLS Policies for lectures_validations
CREATE POLICY "Admin global can manage all readings"
  ON public.lectures_validations FOR ALL
  USING (has_role(auth.uid(), 'admin_global'));

CREATE POLICY "Users can view their own readings"
  ON public.lectures_validations FOR SELECT
  USING (utilisateur_id = auth.uid());

CREATE POLICY "Users can update their own readings"
  ON public.lectures_validations FOR INSERT
  WITH CHECK (utilisateur_id = auth.uid());

CREATE POLICY "Users can update their reading status"
  ON public.lectures_validations FOR UPDATE
  USING (utilisateur_id = auth.uid());

-- RLS Policies for changelog_reglementaire
CREATE POLICY "Admin global can manage changelog"
  ON public.changelog_reglementaire FOR ALL
  USING (has_role(auth.uid(), 'admin_global'));

CREATE POLICY "Authenticated users can view changelog"
  ON public.changelog_reglementaire FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- RLS Policies for referentiels_secteurs
CREATE POLICY "Admin global can manage sector frameworks"
  ON public.referentiels_secteurs FOR ALL
  USING (has_role(auth.uid(), 'admin_global'));

CREATE POLICY "Authenticated users can view sector frameworks"
  ON public.referentiels_secteurs FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- RLS Policies for liens_module
CREATE POLICY "Admin global can manage module links"
  ON public.liens_module FOR ALL
  USING (has_role(auth.uid(), 'admin_global'));

CREATE POLICY "Users can view module links for their client sites"
  ON public.liens_module FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sites s
      WHERE s.id = liens_module.site_id
      AND s.client_id = get_user_client_id(auth.uid())
    )
  );

CREATE POLICY "Gestionnaire HSE can manage module links for their client"
  ON public.liens_module FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.sites s
      WHERE s.id = liens_module.site_id
      AND s.client_id = get_user_client_id(auth.uid())
    ) AND has_role(auth.uid(), 'gestionnaire_hse')
  );

-- Insert demo data
INSERT INTO public.textes_reglementaires (titre, source, reference, date_publication, domaine, mots_cles, resume, statut, version)
VALUES 
  ('Loi n° 97-37 relative à la protection contre les incendies', 'JORT', 'L97-37', '1997-06-16', 'Incendie', ARRAY['incendie', 'protection', 'prévention'], 'Loi fixant les mesures de protection et de prévention contre les incendies dans les établissements recevant du public et les lieux de travail.', 'en_vigueur', 1),
  ('Code du travail - Décret n° 66-27', 'JORT', 'D66-27', '1966-01-30', 'Sécurité du travail', ARRAY['travail', 'sécurité', 'hygiène'], 'Décret relatif aux conditions générales d''hygiène et de sécurité dans les établissements de travail.', 'en_vigueur', 1);

-- Get IDs for linking
DO $$
DECLARE
  texte_incendie_id UUID;
  texte_travail_id UUID;
  article1_id UUID;
  article2_id UUID;
  article3_id UUID;
  client_demo_id UUID;
  site1_id UUID;
  site2_id UUID;
  appli1_id UUID;
  appli2_id UUID;
  conf1_id UUID;
  conf2_id UUID;
BEGIN
  SELECT id INTO texte_incendie_id FROM public.textes_reglementaires WHERE reference = 'L97-37';
  SELECT id INTO texte_travail_id FROM public.textes_reglementaires WHERE reference = 'D66-27';
  SELECT id INTO client_demo_id FROM public.clients WHERE nom_legal = 'ConformaTech Industries' LIMIT 1;
  SELECT id INTO site1_id FROM public.sites WHERE code_site = 'CTS-001' LIMIT 1;
  SELECT id INTO site2_id FROM public.sites WHERE code_site = 'CTS-002' LIMIT 1;

  -- Insert articles for incendie text
  INSERT INTO public.articles (texte_id, numero, resume_article, exigences)
  VALUES 
    (texte_incendie_id, 'Art. 5', 'Installation obligatoire de systèmes de détection incendie', ARRAY['Détecteurs de fumée dans tous les locaux à risque', 'Centrale d''alarme conforme', 'Maintenance annuelle'])
  RETURNING id INTO article1_id;

  INSERT INTO public.articles (texte_id, numero, resume_article, exigences)
  VALUES 
    (texte_incendie_id, 'Art. 12', 'Moyens d''extinction et évacuation', ARRAY['Extincteurs en nombre suffisant', 'Plans d''évacuation affichés', 'Exercices d''évacuation semestriels'])
  RETURNING id INTO article2_id;

  -- Insert articles for travail text
  INSERT INTO public.articles (texte_id, numero, resume_article, exigences)
  VALUES 
    (texte_travail_id, 'Art. 8', 'Équipements de protection individuelle', ARRAY['Fourniture gratuite d''EPI adaptés', 'Formation à l''utilisation', 'Renouvellement selon usure'])
  RETURNING id INTO article3_id;

  -- Insert applicabilite
  INSERT INTO public.applicabilite (texte_id, article_id, client_id, site_id, activite, applicable, justification)
  VALUES 
    (texte_incendie_id, article1_id, client_demo_id, site1_id, 'Manufacturing', true, 'Site industriel à risque élevé')
  RETURNING id INTO appli1_id;

  INSERT INTO public.applicabilite (texte_id, article_id, client_id, site_id, activite, applicable, justification)
  VALUES 
    (texte_travail_id, article3_id, client_demo_id, site2_id, 'Warehouse', true, 'Personnel exposé aux risques logistiques')
  RETURNING id INTO appli2_id;

  -- Insert conformite
  INSERT INTO public.conformite (applicabilite_id, etat, score, commentaire)
  VALUES 
    (appli1_id, 'Partiel', 65.0, 'Détecteurs installés mais maintenance non à jour')
  RETURNING id INTO conf1_id;

  INSERT INTO public.conformite (applicabilite_id, etat, score, commentaire)
  VALUES 
    (appli2_id, 'Non_conforme', 30.0, 'EPI insuffisants, formations manquantes')
  RETURNING id INTO conf2_id;

  -- Insert actions correctives
  INSERT INTO public.actions_correctives (conformite_id, manquement, action, echeance, statut, priorite, cout_estime)
  VALUES 
    (conf1_id, 'Maintenance annuelle détecteurs incendie non effectuée', 'Planifier intervention entreprise certifiée', CURRENT_DATE + INTERVAL '30 days', 'A_faire', 'Haute', 1500.00),
    (conf2_id, 'Stock EPI insuffisant', 'Commander et distribuer EPI réglementaires', CURRENT_DATE + INTERVAL '15 days', 'En_cours', 'Critique', 3200.00),
    (conf2_id, 'Formations EPI non dispensées', 'Organiser sessions formation sécurité', CURRENT_DATE + INTERVAL '45 days', 'A_faire', 'Haute', 800.00);
END $$;