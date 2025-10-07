// Type definitions for Actes Réglementaires (Regulatory Acts)

export type TypeActe = 
  | "loi" 
  | "loi_org" 
  | "code"
  | "decret_gouv" 
  | "decret_pres" 
  | "decret_loi"
  | "arrete" 
  | "arrete_conjoint" 
  | "circulaire" 
  | "decision" 
  | "rectificatif";

export type StatutVigueur = "en_vigueur" | "modifie" | "abroge" | "suspendu";

export type TypeRelation = "modifie" | "abroge" | "complete" | "rend_applicable" | "rectifie" | "renvoi";

export type NiveauStructure = "livre" | "titre" | "chapitre" | "section";

export type EtatConformite = "conforme" | "partiel" | "non_conforme" | "non_evalue";

export type TypePreuve = "procedure" | "rapport" | "certificat" | "photo" | "autre";

export interface TypeActeRow {
  id: string;
  code: TypeActe;
  libelle: string;
  created_at: string;
}

export interface ActeReglementaire {
  id: string;
  type_acte: TypeActe;
  numero_officiel?: string;
  annee?: number;
  date_signature?: string;
  date_publication_jort?: string;
  jort_numero?: string;
  jort_page_debut?: string;
  jort_page_fin?: string;
  autorite_emettrice?: string;
  intitule: string;
  objet_resume?: string;
  domaines?: string[];
  mots_cles?: string[];
  statut_vigueur: StatutVigueur;
  langue_disponible?: string;
  url_pdf_ar?: string;
  url_pdf_fr?: string;
  notes_editoriales?: string;
  date_entree_vigueur_effective?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  types_acte?: TypeActeRow;
}

export interface Article {
  id: string;
  acte_id: string;
  numero: string;
  titre_court?: string;
  contenu_ar?: string;
  contenu_fr?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface StructureCode {
  id: string;
  acte_id: string;
  niveau: NiveauStructure;
  numero: string;
  titre: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
}

export interface RelationActe {
  id: string;
  source_id: string;
  relation: TypeRelation;
  cible_id: string;
  details?: string;
  created_at: string;
  cible?: {
    numero_officiel?: string;
    intitule: string;
  };
}

export interface ChangelogEntry {
  id: string;
  acte_id: string;
  type_changement: "ajout" | "modification" | "abrogation";
  resume: string;
  date_changement: string;
  created_at: string;
}
