export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      actes_reglementaires: {
        Row: {
          annee: number | null
          autorite_emettrice: string | null
          created_at: string | null
          created_by: string | null
          date_entree_vigueur_effective: string | null
          date_publication: string | null
          date_publication_jort: string | null
          date_signature: string | null
          domaine: Database["public"]["Enums"]["domaine_reglementaire"]
          domaines: string[] | null
          id: string
          intitule: string | null
          jort_numero: string | null
          jort_page_debut: string | null
          jort_page_fin: string | null
          langue_disponible: string | null
          lien_pdf: string | null
          mots_cles: string[] | null
          notes_editoriales: string | null
          numero_officiel: string | null
          objet_resume: string | null
          reference: string
          resume: string | null
          source: string | null
          statut: Database["public"]["Enums"]["statut_texte"] | null
          statut_vigueur: Database["public"]["Enums"]["statut_vigueur"]
          titre: string
          type_acte: Database["public"]["Enums"]["type_acte"]
          updated_at: string | null
          url_pdf_ar: string | null
          url_pdf_fr: string | null
        }
        Insert: {
          annee?: number | null
          autorite_emettrice?: string | null
          created_at?: string | null
          created_by?: string | null
          date_entree_vigueur_effective?: string | null
          date_publication?: string | null
          date_publication_jort?: string | null
          date_signature?: string | null
          domaine: Database["public"]["Enums"]["domaine_reglementaire"]
          domaines?: string[] | null
          id?: string
          intitule?: string | null
          jort_numero?: string | null
          jort_page_debut?: string | null
          jort_page_fin?: string | null
          langue_disponible?: string | null
          lien_pdf?: string | null
          mots_cles?: string[] | null
          notes_editoriales?: string | null
          numero_officiel?: string | null
          objet_resume?: string | null
          reference: string
          resume?: string | null
          source?: string | null
          statut?: Database["public"]["Enums"]["statut_texte"] | null
          statut_vigueur?: Database["public"]["Enums"]["statut_vigueur"]
          titre: string
          type_acte?: Database["public"]["Enums"]["type_acte"]
          updated_at?: string | null
          url_pdf_ar?: string | null
          url_pdf_fr?: string | null
        }
        Update: {
          annee?: number | null
          autorite_emettrice?: string | null
          created_at?: string | null
          created_by?: string | null
          date_entree_vigueur_effective?: string | null
          date_publication?: string | null
          date_publication_jort?: string | null
          date_signature?: string | null
          domaine?: Database["public"]["Enums"]["domaine_reglementaire"]
          domaines?: string[] | null
          id?: string
          intitule?: string | null
          jort_numero?: string | null
          jort_page_debut?: string | null
          jort_page_fin?: string | null
          langue_disponible?: string | null
          lien_pdf?: string | null
          mots_cles?: string[] | null
          notes_editoriales?: string | null
          numero_officiel?: string | null
          objet_resume?: string | null
          reference?: string
          resume?: string | null
          source?: string | null
          statut?: Database["public"]["Enums"]["statut_texte"] | null
          statut_vigueur?: Database["public"]["Enums"]["statut_vigueur"]
          titre?: string
          type_acte?: Database["public"]["Enums"]["type_acte"]
          updated_at?: string | null
          url_pdf_ar?: string | null
          url_pdf_fr?: string | null
        }
        Relationships: []
      }
      actions_correctives: {
        Row: {
          action: string
          conformite_id: string
          cout_estime: number | null
          created_at: string | null
          created_by: string | null
          echeance: string | null
          id: string
          manquement: string
          preuve_cloture_url: string | null
          priorite: Database["public"]["Enums"]["priorite"] | null
          responsable: string | null
          statut: Database["public"]["Enums"]["statut_action"] | null
          updated_at: string | null
        }
        Insert: {
          action: string
          conformite_id: string
          cout_estime?: number | null
          created_at?: string | null
          created_by?: string | null
          echeance?: string | null
          id?: string
          manquement: string
          preuve_cloture_url?: string | null
          priorite?: Database["public"]["Enums"]["priorite"] | null
          responsable?: string | null
          statut?: Database["public"]["Enums"]["statut_action"] | null
          updated_at?: string | null
        }
        Update: {
          action?: string
          conformite_id?: string
          cout_estime?: number | null
          created_at?: string | null
          created_by?: string | null
          echeance?: string | null
          id?: string
          manquement?: string
          preuve_cloture_url?: string | null
          priorite?: Database["public"]["Enums"]["priorite"] | null
          responsable?: string | null
          statut?: Database["public"]["Enums"]["statut_action"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "actions_correctives_conformite_id_fkey"
            columns: ["conformite_id"]
            isOneToOne: false
            referencedRelation: "conformite"
            referencedColumns: ["id"]
          },
        ]
      }
      applicabilite: {
        Row: {
          activite: string | null
          applicable: boolean | null
          article_id: string | null
          client_id: string
          created_at: string | null
          created_by: string | null
          id: string
          justification: string | null
          site_id: string | null
          texte_id: string
          updated_at: string | null
        }
        Insert: {
          activite?: string | null
          applicable?: boolean | null
          article_id?: string | null
          client_id: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          justification?: string | null
          site_id?: string | null
          texte_id: string
          updated_at?: string | null
        }
        Update: {
          activite?: string | null
          applicable?: boolean | null
          article_id?: string | null
          client_id?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          justification?: string | null
          site_id?: string | null
          texte_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applicabilite_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applicabilite_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applicabilite_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applicabilite_texte_id_fkey"
            columns: ["texte_id"]
            isOneToOne: false
            referencedRelation: "actes_reglementaires"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          acte_id: string
          contenu_ar: string | null
          contenu_fr: string | null
          created_at: string | null
          exigences: string[] | null
          id: string
          notes: string | null
          numero: string
          resume_article: string | null
          titre_court: string | null
          updated_at: string | null
        }
        Insert: {
          acte_id: string
          contenu_ar?: string | null
          contenu_fr?: string | null
          created_at?: string | null
          exigences?: string[] | null
          id?: string
          notes?: string | null
          numero: string
          resume_article?: string | null
          titre_court?: string | null
          updated_at?: string | null
        }
        Update: {
          acte_id?: string
          contenu_ar?: string | null
          contenu_fr?: string | null
          created_at?: string | null
          exigences?: string[] | null
          id?: string
          notes?: string | null
          numero?: string
          resume_article?: string | null
          titre_court?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_texte_id_fkey"
            columns: ["acte_id"]
            isOneToOne: false
            referencedRelation: "actes_reglementaires"
            referencedColumns: ["id"]
          },
        ]
      }
      changelog_reglementaire: {
        Row: {
          acte_id: string
          created_by: string | null
          date_changement: string | null
          id: string
          resume: string | null
          type_changement: string
        }
        Insert: {
          acte_id: string
          created_by?: string | null
          date_changement?: string | null
          id?: string
          resume?: string | null
          type_changement: string
        }
        Update: {
          acte_id?: string
          created_by?: string | null
          date_changement?: string | null
          id?: string
          resume?: string | null
          type_changement?: string
        }
        Relationships: [
          {
            foreignKeyName: "changelog_reglementaire_texte_id_fkey"
            columns: ["acte_id"]
            isOneToOne: false
            referencedRelation: "actes_reglementaires"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          adresse_siege: string | null
          contacts: Json | null
          contrat_sla: string | null
          created_at: string
          gouvernorat: Database["public"]["Enums"]["gouvernorat"] | null
          id: string
          logo: string | null
          matricule_fiscal: string | null
          nom_legal: string
          notes: string | null
          rne_rc: string | null
          secteur: Database["public"]["Enums"]["secteur"] | null
          updated_at: string
        }
        Insert: {
          adresse_siege?: string | null
          contacts?: Json | null
          contrat_sla?: string | null
          created_at?: string
          gouvernorat?: Database["public"]["Enums"]["gouvernorat"] | null
          id?: string
          logo?: string | null
          matricule_fiscal?: string | null
          nom_legal: string
          notes?: string | null
          rne_rc?: string | null
          secteur?: Database["public"]["Enums"]["secteur"] | null
          updated_at?: string
        }
        Update: {
          adresse_siege?: string | null
          contacts?: Json | null
          contrat_sla?: string | null
          created_at?: string
          gouvernorat?: Database["public"]["Enums"]["gouvernorat"] | null
          id?: string
          logo?: string | null
          matricule_fiscal?: string | null
          nom_legal?: string
          notes?: string | null
          rne_rc?: string | null
          secteur?: Database["public"]["Enums"]["secteur"] | null
          updated_at?: string
        }
        Relationships: []
      }
      conformite: {
        Row: {
          applicabilite_id: string
          commentaire: string | null
          created_at: string | null
          derniere_mise_a_jour: string | null
          etat: Database["public"]["Enums"]["etat_conformite"] | null
          id: string
          mise_a_jour_par: string | null
          score: number | null
        }
        Insert: {
          applicabilite_id: string
          commentaire?: string | null
          created_at?: string | null
          derniere_mise_a_jour?: string | null
          etat?: Database["public"]["Enums"]["etat_conformite"] | null
          id?: string
          mise_a_jour_par?: string | null
          score?: number | null
        }
        Update: {
          applicabilite_id?: string
          commentaire?: string | null
          created_at?: string | null
          derniere_mise_a_jour?: string | null
          etat?: Database["public"]["Enums"]["etat_conformite"] | null
          id?: string
          mise_a_jour_par?: string | null
          score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "conformite_applicabilite_id_fkey"
            columns: ["applicabilite_id"]
            isOneToOne: false
            referencedRelation: "applicabilite"
            referencedColumns: ["id"]
          },
        ]
      }
      lectures_validations: {
        Row: {
          commentaire: string | null
          created_at: string | null
          date_lecture: string | null
          date_validation: string | null
          id: string
          site_id: string | null
          statut: Database["public"]["Enums"]["statut_lecture"] | null
          texte_id: string
          utilisateur_id: string
        }
        Insert: {
          commentaire?: string | null
          created_at?: string | null
          date_lecture?: string | null
          date_validation?: string | null
          id?: string
          site_id?: string | null
          statut?: Database["public"]["Enums"]["statut_lecture"] | null
          texte_id: string
          utilisateur_id: string
        }
        Update: {
          commentaire?: string | null
          created_at?: string | null
          date_lecture?: string | null
          date_validation?: string | null
          id?: string
          site_id?: string | null
          statut?: Database["public"]["Enums"]["statut_lecture"] | null
          texte_id?: string
          utilisateur_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lectures_validations_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lectures_validations_texte_id_fkey"
            columns: ["texte_id"]
            isOneToOne: false
            referencedRelation: "actes_reglementaires"
            referencedColumns: ["id"]
          },
        ]
      }
      liens_module: {
        Row: {
          action_corrective_id: string | null
          created_at: string | null
          id: string
          module: string
          record_id: string
          site_id: string
        }
        Insert: {
          action_corrective_id?: string | null
          created_at?: string | null
          id?: string
          module: string
          record_id: string
          site_id: string
        }
        Update: {
          action_corrective_id?: string | null
          created_at?: string | null
          id?: string
          module?: string
          record_id?: string
          site_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "liens_module_action_corrective_id_fkey"
            columns: ["action_corrective_id"]
            isOneToOne: false
            referencedRelation: "actions_correctives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "liens_module_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      preuves: {
        Row: {
          ajoute_par: string | null
          conformite_id: string
          created_at: string | null
          date: string | null
          empreinte_sha256: string | null
          fichier_url: string | null
          id: string
          type: string | null
        }
        Insert: {
          ajoute_par?: string | null
          conformite_id: string
          created_at?: string | null
          date?: string | null
          empreinte_sha256?: string | null
          fichier_url?: string | null
          id?: string
          type?: string | null
        }
        Update: {
          ajoute_par?: string | null
          conformite_id?: string
          created_at?: string | null
          date?: string | null
          empreinte_sha256?: string | null
          fichier_url?: string | null
          id?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "preuves_conformite_id_fkey"
            columns: ["conformite_id"]
            isOneToOne: false
            referencedRelation: "conformite"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          client_id: string | null
          created_at: string
          email: string | null
          fonction: string | null
          id: string
          nom: string | null
          prenom: string | null
          site_id: string | null
          telephone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          client_id?: string | null
          created_at?: string
          email?: string | null
          fonction?: string | null
          id: string
          nom?: string | null
          prenom?: string | null
          site_id?: string | null
          telephone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          client_id?: string | null
          created_at?: string
          email?: string | null
          fonction?: string | null
          id?: string
          nom?: string | null
          prenom?: string | null
          site_id?: string | null
          telephone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      referentiels_secteurs: {
        Row: {
          actifs_concernes: string[] | null
          created_at: string | null
          exigences_types: string[] | null
          id: string
          secteur: Database["public"]["Enums"]["secteur"]
          updated_at: string | null
        }
        Insert: {
          actifs_concernes?: string[] | null
          created_at?: string | null
          exigences_types?: string[] | null
          id?: string
          secteur: Database["public"]["Enums"]["secteur"]
          updated_at?: string | null
        }
        Update: {
          actifs_concernes?: string[] | null
          created_at?: string | null
          exigences_types?: string[] | null
          id?: string
          secteur?: Database["public"]["Enums"]["secteur"]
          updated_at?: string | null
        }
        Relationships: []
      }
      relations_actes: {
        Row: {
          cible_id: string
          created_at: string
          details: string | null
          id: string
          relation: Database["public"]["Enums"]["type_relation"]
          source_id: string
        }
        Insert: {
          cible_id: string
          created_at?: string
          details?: string | null
          id?: string
          relation: Database["public"]["Enums"]["type_relation"]
          source_id: string
        }
        Update: {
          cible_id?: string
          created_at?: string
          details?: string | null
          id?: string
          relation?: Database["public"]["Enums"]["type_relation"]
          source_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "relations_actes_cible_id_fkey"
            columns: ["cible_id"]
            isOneToOne: false
            referencedRelation: "actes_reglementaires"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relations_actes_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "actes_reglementaires"
            referencedColumns: ["id"]
          },
        ]
      }
      sites: {
        Row: {
          activite: string | null
          adresse: string | null
          autorite_protection_civile: string | null
          client_id: string
          code_site: string
          coordonnees_gps: unknown | null
          created_at: string
          documents: Json | null
          effectif: number | null
          email: string | null
          gouvernorat: Database["public"]["Enums"]["gouvernorat"] | null
          id: string
          niveau_risque: Database["public"]["Enums"]["niveau_risque"] | null
          nom_site: string
          prestataires_affectes: Json | null
          responsable_site: string | null
          telephone: string | null
          updated_at: string
        }
        Insert: {
          activite?: string | null
          adresse?: string | null
          autorite_protection_civile?: string | null
          client_id: string
          code_site: string
          coordonnees_gps?: unknown | null
          created_at?: string
          documents?: Json | null
          effectif?: number | null
          email?: string | null
          gouvernorat?: Database["public"]["Enums"]["gouvernorat"] | null
          id?: string
          niveau_risque?: Database["public"]["Enums"]["niveau_risque"] | null
          nom_site: string
          prestataires_affectes?: Json | null
          responsable_site?: string | null
          telephone?: string | null
          updated_at?: string
        }
        Update: {
          activite?: string | null
          adresse?: string | null
          autorite_protection_civile?: string | null
          client_id?: string
          code_site?: string
          coordonnees_gps?: unknown | null
          created_at?: string
          documents?: Json | null
          effectif?: number | null
          email?: string | null
          gouvernorat?: Database["public"]["Enums"]["gouvernorat"] | null
          id?: string
          niveau_risque?: Database["public"]["Enums"]["niveau_risque"] | null
          nom_site?: string
          prestataires_affectes?: Json | null
          responsable_site?: string | null
          telephone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sites_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      structures_code: {
        Row: {
          acte_id: string
          created_at: string
          id: string
          niveau: Database["public"]["Enums"]["niveau_structure"]
          numero: string
          parent_id: string | null
          titre: string
          updated_at: string
        }
        Insert: {
          acte_id: string
          created_at?: string
          id?: string
          niveau: Database["public"]["Enums"]["niveau_structure"]
          numero: string
          parent_id?: string | null
          titre: string
          updated_at?: string
        }
        Update: {
          acte_id?: string
          created_at?: string
          id?: string
          niveau?: Database["public"]["Enums"]["niveau_structure"]
          numero?: string
          parent_id?: string | null
          titre?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "structures_code_acte_id_fkey"
            columns: ["acte_id"]
            isOneToOne: false
            referencedRelation: "actes_reglementaires"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "structures_code_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "structures_code"
            referencedColumns: ["id"]
          },
        ]
      }
      types_acte: {
        Row: {
          code: Database["public"]["Enums"]["type_acte"]
          created_at: string
          id: string
          libelle: string
        }
        Insert: {
          code: Database["public"]["Enums"]["type_acte"]
          created_at?: string
          id?: string
          libelle: string
        }
        Update: {
          code?: Database["public"]["Enums"]["type_acte"]
          created_at?: string
          id?: string
          libelle?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_client_id: {
        Args: { _user_id: string }
        Returns: string
      }
      get_user_site_id: {
        Args: { _user_id: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin_global"
        | "admin_client"
        | "gestionnaire_hse"
        | "chef_site"
        | "lecteur"
      domaine_reglementaire:
        | "Incendie"
        | "Sécurité du travail"
        | "Environnement"
        | "RH"
        | "Hygiène"
        | "Autres"
      etat_conformite: "Conforme" | "Partiel" | "Non_conforme" | "Non_evalue"
      gouvernorat:
        | "Ariana"
        | "Béja"
        | "Ben Arous"
        | "Bizerte"
        | "Gabès"
        | "Gafsa"
        | "Jendouba"
        | "Kairouan"
        | "Kasserine"
        | "Kébili"
        | "Kef"
        | "Mahdia"
        | "Manouba"
        | "Médenine"
        | "Monastir"
        | "Nabeul"
        | "Sfax"
        | "Sidi Bouzid"
        | "Siliana"
        | "Sousse"
        | "Tataouine"
        | "Tozeur"
        | "Tunis"
        | "Zaghouan"
      niveau_risque: "Faible" | "Moyen" | "Élevé" | "Critique"
      niveau_structure: "livre" | "titre" | "chapitre" | "section"
      priorite: "Basse" | "Moyenne" | "Haute" | "Critique"
      secteur:
        | "Alimentaire"
        | "Automobile"
        | "Chimie"
        | "Textile"
        | "Construction"
        | "Électronique"
        | "Pharmaceutique"
        | "Services"
        | "Logistique"
        | "Autre"
      statut_action: "A_faire" | "En_cours" | "Termine" | "Bloque"
      statut_lecture: "A_lire" | "Lu" | "Valide"
      statut_texte: "en_vigueur" | "abroge" | "modifie"
      statut_vigueur: "en_vigueur" | "modifie" | "abroge" | "suspendu"
      type_acte:
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
        | "rectificatif"
      type_preuve: "procedure" | "rapport" | "certificat" | "photo" | "autre"
      type_relation:
        | "modifie"
        | "abroge"
        | "complete"
        | "rend_applicable"
        | "rectifie"
        | "renvoi"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin_global",
        "admin_client",
        "gestionnaire_hse",
        "chef_site",
        "lecteur",
      ],
      domaine_reglementaire: [
        "Incendie",
        "Sécurité du travail",
        "Environnement",
        "RH",
        "Hygiène",
        "Autres",
      ],
      etat_conformite: ["Conforme", "Partiel", "Non_conforme", "Non_evalue"],
      gouvernorat: [
        "Ariana",
        "Béja",
        "Ben Arous",
        "Bizerte",
        "Gabès",
        "Gafsa",
        "Jendouba",
        "Kairouan",
        "Kasserine",
        "Kébili",
        "Kef",
        "Mahdia",
        "Manouba",
        "Médenine",
        "Monastir",
        "Nabeul",
        "Sfax",
        "Sidi Bouzid",
        "Siliana",
        "Sousse",
        "Tataouine",
        "Tozeur",
        "Tunis",
        "Zaghouan",
      ],
      niveau_risque: ["Faible", "Moyen", "Élevé", "Critique"],
      niveau_structure: ["livre", "titre", "chapitre", "section"],
      priorite: ["Basse", "Moyenne", "Haute", "Critique"],
      secteur: [
        "Alimentaire",
        "Automobile",
        "Chimie",
        "Textile",
        "Construction",
        "Électronique",
        "Pharmaceutique",
        "Services",
        "Logistique",
        "Autre",
      ],
      statut_action: ["A_faire", "En_cours", "Termine", "Bloque"],
      statut_lecture: ["A_lire", "Lu", "Valide"],
      statut_texte: ["en_vigueur", "abroge", "modifie"],
      statut_vigueur: ["en_vigueur", "modifie", "abroge", "suspendu"],
      type_acte: [
        "loi",
        "loi_org",
        "code",
        "decret_gouv",
        "decret_pres",
        "decret_loi",
        "arrete",
        "arrete_conjoint",
        "circulaire",
        "decision",
        "rectificatif",
      ],
      type_preuve: ["procedure", "rapport", "certificat", "photo", "autre"],
      type_relation: [
        "modifie",
        "abroge",
        "complete",
        "rend_applicable",
        "rectifie",
        "renvoi",
      ],
    },
  },
} as const
