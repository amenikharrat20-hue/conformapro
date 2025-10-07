// Temporary type definitions for Textes Réglementaires
// These will be replaced by auto-generated Supabase types once they refresh

export type TypeActe = 
  | "loi" 
  | "loi_org" 
  | "decret_gouv" 
  | "decret_pres" 
  | "decret_loi" 
  | "arrete" 
  | "arrete_conjoint" 
  | "circulaire" 
  | "decision" 
  | "rectificatif";

export type StatutVigueur = "en_vigueur" | "modifie" | "abroge" | "suspendu";

export type LangueDisponible = "ar" | "fr" | "ar_fr";

export type TypeRelation = "modifie" | "abroge" | "complete" | "rend_applicable" | "rectifie" | "renvoi";

export interface TypeActeRow {
  id: string;
  code: TypeActe;
  libelle: string;
  created_at: string;
}

export interface TexteReglementaire {
  id: string;
  type_acte: TypeActe;
  numero_officiel: string;
  annee: number;
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
  langue_disponible?: LangueDisponible;
  url_pdf_ar: string;
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
  texte_id: string;
  numero: string;
  titre_court?: string;
  contenu_ar?: string;
  contenu_fr?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface RelationTexte {
  id: string;
  source_id: string;
  relation: TypeRelation;
  cible_id: string;
  details?: string;
  created_at: string;
  cible?: {
    numero_officiel: string;
    intitule: string;
  };
}
