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
      access_scopes: {
        Row: {
          created_at: string | null
          id: string
          read_only: boolean | null
          site_id: string
          updated_at: string | null
          utilisateur_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          read_only?: boolean | null
          site_id: string
          updated_at?: string | null
          utilisateur_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          read_only?: boolean | null
          site_id?: string
          updated_at?: string | null
          utilisateur_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_scopes_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_scopes_utilisateur_id_fkey"
            columns: ["utilisateur_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
          deleted_at: string | null
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
          reference_officielle: string | null
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
          deleted_at?: string | null
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
          reference_officielle?: string | null
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
          deleted_at?: string | null
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
          reference_officielle?: string | null
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
          deleted_at: string | null
          exigences: string[] | null
          id: string
          notes: string | null
          numero: string
          ordre: number | null
          reference_article: string | null
          resume_article: string | null
          titre_court: string | null
          updated_at: string | null
        }
        Insert: {
          acte_id: string
          contenu_ar?: string | null
          contenu_fr?: string | null
          created_at?: string | null
          deleted_at?: string | null
          exigences?: string[] | null
          id?: string
          notes?: string | null
          numero: string
          ordre?: number | null
          reference_article?: string | null
          resume_article?: string | null
          titre_court?: string | null
          updated_at?: string | null
        }
        Update: {
          acte_id?: string
          contenu_ar?: string | null
          contenu_fr?: string | null
          created_at?: string | null
          deleted_at?: string | null
          exigences?: string[] | null
          id?: string
          notes?: string | null
          numero?: string
          ordre?: number | null
          reference_article?: string | null
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
      articles_sous_domaines: {
        Row: {
          article_id: string
          created_at: string | null
          sous_domaine_id: string
        }
        Insert: {
          article_id: string
          created_at?: string | null
          sous_domaine_id: string
        }
        Update: {
          article_id?: string
          created_at?: string | null
          sous_domaine_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "articles_sous_domaines_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_sous_domaines_sous_domaine_id_fkey"
            columns: ["sous_domaine_id"]
            isOneToOne: false
            referencedRelation: "sous_domaines_application"
            referencedColumns: ["id"]
          },
        ]
      }
      articles_versions: {
        Row: {
          article_id: string
          contenu: string
          created_at: string | null
          date_effet: string | null
          deleted_at: string | null
          id: string
          remplace_version_id: string | null
          statut_vigueur: Database["public"]["Enums"]["statut_vigueur"] | null
          updated_at: string | null
          version_label: string
        }
        Insert: {
          article_id: string
          contenu: string
          created_at?: string | null
          date_effet?: string | null
          deleted_at?: string | null
          id?: string
          remplace_version_id?: string | null
          statut_vigueur?: Database["public"]["Enums"]["statut_vigueur"] | null
          updated_at?: string | null
          version_label: string
        }
        Update: {
          article_id?: string
          contenu?: string
          created_at?: string | null
          date_effet?: string | null
          deleted_at?: string | null
          id?: string
          remplace_version_id?: string | null
          statut_vigueur?: Database["public"]["Enums"]["statut_vigueur"] | null
          updated_at?: string | null
          version_label?: string
        }
        Relationships: [
          {
            foreignKeyName: "articles_versions_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_versions_remplace_version_id_fkey"
            columns: ["remplace_version_id"]
            isOneToOne: false
            referencedRelation: "articles_versions"
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
          abonnement_type: string | null
          adresse_siege: string | null
          code_postal: string | null
          contacts: Json | null
          contrat_sla: string | null
          couleur_primaire: string | null
          couleur_secondaire: string | null
          created_at: string
          delegation: string | null
          email: string | null
          gouvernorat: Database["public"]["Enums"]["gouvernorat"] | null
          id: string
          localite: string | null
          logo_url: string | null
          matricule_fiscal: string | null
          nature: string | null
          nom_legal: string
          notes: string | null
          rne_rc: string | null
          secteur: string | null
          site_web: string | null
          statut: string | null
          telephone: string | null
          updated_at: string
          ville: string | null
        }
        Insert: {
          abonnement_type?: string | null
          adresse_siege?: string | null
          code_postal?: string | null
          contacts?: Json | null
          contrat_sla?: string | null
          couleur_primaire?: string | null
          couleur_secondaire?: string | null
          created_at?: string
          delegation?: string | null
          email?: string | null
          gouvernorat?: Database["public"]["Enums"]["gouvernorat"] | null
          id?: string
          localite?: string | null
          logo_url?: string | null
          matricule_fiscal?: string | null
          nature?: string | null
          nom_legal: string
          notes?: string | null
          rne_rc?: string | null
          secteur?: string | null
          site_web?: string | null
          statut?: string | null
          telephone?: string | null
          updated_at?: string
          ville?: string | null
        }
        Update: {
          abonnement_type?: string | null
          adresse_siege?: string | null
          code_postal?: string | null
          contacts?: Json | null
          contrat_sla?: string | null
          couleur_primaire?: string | null
          couleur_secondaire?: string | null
          created_at?: string
          delegation?: string | null
          email?: string | null
          gouvernorat?: Database["public"]["Enums"]["gouvernorat"] | null
          id?: string
          localite?: string | null
          logo_url?: string | null
          matricule_fiscal?: string | null
          nature?: string | null
          nom_legal?: string
          notes?: string | null
          rne_rc?: string | null
          secteur?: string | null
          site_web?: string | null
          statut?: string | null
          telephone?: string | null
          updated_at?: string
          ville?: string | null
        }
        Relationships: []
      }
      codes: {
        Row: {
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          structure: Json | null
          titre: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          structure?: Json | null
          titre: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          structure?: Json | null
          titre?: string
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
      domaines_application: {
        Row: {
          actif: boolean | null
          code: string
          created_at: string | null
          deleted_at: string | null
          description: string | null
          id: string
          libelle: string
          updated_at: string | null
        }
        Insert: {
          actif?: boolean | null
          code: string
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          libelle: string
          updated_at?: string | null
        }
        Update: {
          actif?: boolean | null
          code?: string
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          libelle?: string
          updated_at?: string | null
        }
        Relationships: []
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
      modules_systeme: {
        Row: {
          actif: boolean | null
          code: string
          created_at: string | null
          description: string | null
          id: string
          libelle: string
          updated_at: string | null
        }
        Insert: {
          actif?: boolean | null
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          libelle: string
          updated_at?: string | null
        }
        Update: {
          actif?: boolean | null
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          libelle?: string
          updated_at?: string | null
        }
        Relationships: []
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
          notes: string | null
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
          notes?: string | null
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
          notes?: string | null
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
          actif: boolean | null
          avatar_url: string | null
          client_id: string | null
          created_at: string
          email: string | null
          fonction: string | null
          id: string
          nom: string | null
          prenom: string | null
          role_id: string | null
          site_id: string | null
          telephone: string | null
          updated_at: string
        }
        Insert: {
          actif?: boolean | null
          avatar_url?: string | null
          client_id?: string | null
          created_at?: string
          email?: string | null
          fonction?: string | null
          id: string
          nom?: string | null
          prenom?: string | null
          role_id?: string | null
          site_id?: string | null
          telephone?: string | null
          updated_at?: string
        }
        Update: {
          actif?: boolean | null
          avatar_url?: string | null
          client_id?: string | null
          created_at?: string
          email?: string | null
          fonction?: string | null
          id?: string
          nom?: string | null
          prenom?: string | null
          role_id?: string | null
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
            foreignKeyName: "profiles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
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
          updated_at: string | null
        }
        Insert: {
          actifs_concernes?: string[] | null
          created_at?: string | null
          exigences_types?: string[] | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          actifs_concernes?: string[] | null
          created_at?: string | null
          exigences_types?: string[] | null
          id?: string
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
      roles: {
        Row: {
          actif: boolean | null
          created_at: string | null
          description: string | null
          id: string
          nom: string
          permissions: Json
          updated_at: string | null
        }
        Insert: {
          actif?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          nom: string
          permissions?: Json
          updated_at?: string | null
        }
        Update: {
          actif?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          nom?: string
          permissions?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      site_modules: {
        Row: {
          enabled: boolean | null
          enabled_at: string | null
          enabled_by: string | null
          id: string
          module_id: string
          site_id: string
        }
        Insert: {
          enabled?: boolean | null
          enabled_at?: string | null
          enabled_by?: string | null
          id?: string
          module_id: string
          site_id: string
        }
        Update: {
          enabled?: boolean | null
          enabled_at?: string | null
          enabled_by?: string | null
          id?: string
          module_id?: string
          site_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_modules_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules_systeme"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_modules_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      site_veille_domaines: {
        Row: {
          domaine_id: string
          enabled: boolean | null
          id: string
          site_id: string
        }
        Insert: {
          domaine_id: string
          enabled?: boolean | null
          id?: string
          site_id: string
        }
        Update: {
          domaine_id?: string
          enabled?: boolean | null
          id?: string
          site_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_veille_domaines_domaine_id_fkey"
            columns: ["domaine_id"]
            isOneToOne: false
            referencedRelation: "domaines_application"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_veille_domaines_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      sites: {
        Row: {
          activite: string | null
          adresse: string | null
          autorite_protection_civile: string | null
          classification: string | null
          client_id: string
          code_site: string
          coordonnees_gps: unknown
          created_at: string
          documents: Json | null
          effectif: number | null
          email: string | null
          equipements_critiques: Json | null
          gouvernorat: Database["public"]["Enums"]["gouvernorat"] | null
          id: string
          niveau_risque: Database["public"]["Enums"]["niveau_risque"] | null
          nom_site: string
          prestataires_affectes: Json | null
          responsable_site: string | null
          superficie: number | null
          telephone: string | null
          updated_at: string
        }
        Insert: {
          activite?: string | null
          adresse?: string | null
          autorite_protection_civile?: string | null
          classification?: string | null
          client_id: string
          code_site: string
          coordonnees_gps?: unknown
          created_at?: string
          documents?: Json | null
          effectif?: number | null
          email?: string | null
          equipements_critiques?: Json | null
          gouvernorat?: Database["public"]["Enums"]["gouvernorat"] | null
          id?: string
          niveau_risque?: Database["public"]["Enums"]["niveau_risque"] | null
          nom_site: string
          prestataires_affectes?: Json | null
          responsable_site?: string | null
          superficie?: number | null
          telephone?: string | null
          updated_at?: string
        }
        Update: {
          activite?: string | null
          adresse?: string | null
          autorite_protection_civile?: string | null
          classification?: string | null
          client_id?: string
          code_site?: string
          coordonnees_gps?: unknown
          created_at?: string
          documents?: Json | null
          effectif?: number | null
          email?: string | null
          equipements_critiques?: Json | null
          gouvernorat?: Database["public"]["Enums"]["gouvernorat"] | null
          id?: string
          niveau_risque?: Database["public"]["Enums"]["niveau_risque"] | null
          nom_site?: string
          prestataires_affectes?: Json | null
          responsable_site?: string | null
          superficie?: number | null
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
      sous_domaines_application: {
        Row: {
          actif: boolean | null
          code: string
          created_at: string | null
          deleted_at: string | null
          description: string | null
          domaine_id: string
          id: string
          libelle: string
          ordre: number | null
          updated_at: string | null
        }
        Insert: {
          actif?: boolean | null
          code: string
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          domaine_id: string
          id?: string
          libelle: string
          ordre?: number | null
          updated_at?: string | null
        }
        Update: {
          actif?: boolean | null
          code?: string
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          domaine_id?: string
          id?: string
          libelle?: string
          ordre?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sous_domaines_application_domaine_id_fkey"
            columns: ["domaine_id"]
            isOneToOne: false
            referencedRelation: "domaines_application"
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
      textes_articles: {
        Row: {
          contenu: string | null
          created_at: string | null
          id: string
          numero: string
          ordre: number | null
          reference: string | null
          texte_id: string
          titre_court: string | null
          updated_at: string | null
        }
        Insert: {
          contenu?: string | null
          created_at?: string | null
          id?: string
          numero: string
          ordre?: number | null
          reference?: string | null
          texte_id: string
          titre_court?: string | null
          updated_at?: string | null
        }
        Update: {
          contenu?: string | null
          created_at?: string | null
          id?: string
          numero?: string
          ordre?: number | null
          reference?: string | null
          texte_id?: string
          titre_court?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "textes_articles_texte_id_fkey"
            columns: ["texte_id"]
            isOneToOne: false
            referencedRelation: "textes_reglementaires"
            referencedColumns: ["id"]
          },
        ]
      }
      textes_articles_versions: {
        Row: {
          article_id: string
          contenu: string
          created_at: string
          date_effet: string | null
          deleted_at: string | null
          id: string
          remplace_version_id: string | null
          statut_vigueur: Database["public"]["Enums"]["statut_vigueur"]
          updated_at: string
          version_label: string
        }
        Insert: {
          article_id: string
          contenu: string
          created_at?: string
          date_effet?: string | null
          deleted_at?: string | null
          id?: string
          remplace_version_id?: string | null
          statut_vigueur?: Database["public"]["Enums"]["statut_vigueur"]
          updated_at?: string
          version_label: string
        }
        Update: {
          article_id?: string
          contenu?: string
          created_at?: string
          date_effet?: string | null
          deleted_at?: string | null
          id?: string
          remplace_version_id?: string | null
          statut_vigueur?: Database["public"]["Enums"]["statut_vigueur"]
          updated_at?: string
          version_label?: string
        }
        Relationships: [
          {
            foreignKeyName: "textes_articles_versions_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "textes_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "textes_articles_versions_remplace_version_id_fkey"
            columns: ["remplace_version_id"]
            isOneToOne: false
            referencedRelation: "textes_articles_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      textes_domaines: {
        Row: {
          created_at: string | null
          domaine_id: string
          texte_id: string
        }
        Insert: {
          created_at?: string | null
          domaine_id: string
          texte_id: string
        }
        Update: {
          created_at?: string | null
          domaine_id?: string
          texte_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "textes_domaines_domaine_id_fkey"
            columns: ["domaine_id"]
            isOneToOne: false
            referencedRelation: "domaines_application"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "textes_domaines_texte_id_fkey"
            columns: ["texte_id"]
            isOneToOne: false
            referencedRelation: "actes_reglementaires"
            referencedColumns: ["id"]
          },
        ]
      }
      textes_reglementaires: {
        Row: {
          annee: number | null
          autorite: string | null
          code_id: string | null
          created_at: string
          created_by: string | null
          date_publication: string | null
          date_signature: string | null
          deleted_at: string | null
          fichier_pdf_url: string | null
          id: string
          reference_officielle: string
          resume: string | null
          statut_vigueur: Database["public"]["Enums"]["statut_vigueur"]
          titre: string
          type: Database["public"]["Enums"]["type_texte_reglementaire"]
          updated_at: string
        }
        Insert: {
          annee?: number | null
          autorite?: string | null
          code_id?: string | null
          created_at?: string
          created_by?: string | null
          date_publication?: string | null
          date_signature?: string | null
          deleted_at?: string | null
          fichier_pdf_url?: string | null
          id?: string
          reference_officielle: string
          resume?: string | null
          statut_vigueur?: Database["public"]["Enums"]["statut_vigueur"]
          titre: string
          type: Database["public"]["Enums"]["type_texte_reglementaire"]
          updated_at?: string
        }
        Update: {
          annee?: number | null
          autorite?: string | null
          code_id?: string | null
          created_at?: string
          created_by?: string | null
          date_publication?: string | null
          date_signature?: string | null
          deleted_at?: string | null
          fichier_pdf_url?: string | null
          id?: string
          reference_officielle?: string
          resume?: string | null
          statut_vigueur?: Database["public"]["Enums"]["statut_vigueur"]
          titre?: string
          type?: Database["public"]["Enums"]["type_texte_reglementaire"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "textes_reglementaires_code_id_fkey"
            columns: ["code_id"]
            isOneToOne: false
            referencedRelation: "codes"
            referencedColumns: ["id"]
          },
        ]
      }
      textes_reglementaires_domaines: {
        Row: {
          created_at: string | null
          domaine_id: string
          texte_id: string
        }
        Insert: {
          created_at?: string | null
          domaine_id: string
          texte_id: string
        }
        Update: {
          created_at?: string | null
          domaine_id?: string
          texte_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "textes_reglementaires_domaines_domaine_id_fkey"
            columns: ["domaine_id"]
            isOneToOne: false
            referencedRelation: "domaines_application"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "textes_reglementaires_domaines_texte_id_fkey"
            columns: ["texte_id"]
            isOneToOne: false
            referencedRelation: "textes_reglementaires"
            referencedColumns: ["id"]
          },
        ]
      }
      textes_reglementaires_sous_domaines: {
        Row: {
          created_at: string | null
          sous_domaine_id: string
          texte_id: string
        }
        Insert: {
          created_at?: string | null
          sous_domaine_id: string
          texte_id: string
        }
        Update: {
          created_at?: string | null
          sous_domaine_id?: string
          texte_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "textes_reglementaires_sous_domaines_sous_domaine_id_fkey"
            columns: ["sous_domaine_id"]
            isOneToOne: false
            referencedRelation: "sous_domaines_application"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "textes_reglementaires_sous_domaines_texte_id_fkey"
            columns: ["texte_id"]
            isOneToOne: false
            referencedRelation: "textes_reglementaires"
            referencedColumns: ["id"]
          },
        ]
      }
      textes_sous_domaines: {
        Row: {
          created_at: string | null
          sous_domaine_id: string
          texte_id: string
        }
        Insert: {
          created_at?: string | null
          sous_domaine_id: string
          texte_id: string
        }
        Update: {
          created_at?: string | null
          sous_domaine_id?: string
          texte_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "textes_sous_domaines_sous_domaine_id_fkey"
            columns: ["sous_domaine_id"]
            isOneToOne: false
            referencedRelation: "sous_domaines_application"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "textes_sous_domaines_texte_id_fkey"
            columns: ["texte_id"]
            isOneToOne: false
            referencedRelation: "actes_reglementaires"
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
      fix_duplicate_site_names: {
        Args: never
        Returns: {
          details: Json
          fixed_count: number
        }[]
      }
      fix_orphaned_sites: {
        Args: never
        Returns: {
          details: Json
          fixed_count: number
        }[]
      }
      fix_orphaned_users: {
        Args: never
        Returns: {
          details: Json
          fixed_count: number
        }[]
      }
      get_user_client_id: { Args: { _user_id: string }; Returns: string }
      get_user_site_id: { Args: { _user_id: string }; Returns: string }
      has_permission: {
        Args: { _action: string; _module: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      invite_or_update_client_user: {
        Args: {
          p_client_id: string
          p_email: string
          p_full_name: string
          p_role: Database["public"]["Enums"]["app_role"]
          p_site_ids: string[]
        }
        Returns: Json
      }
      run_integrity_checks: { Args: never; Returns: Json }
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
      type_texte_reglementaire: "LOI" | "ARRETE" | "DECRET" | "CIRCULAIRE"
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
      type_texte_reglementaire: ["LOI", "ARRETE", "DECRET", "CIRCULAIRE"],
    },
  },
} as const
